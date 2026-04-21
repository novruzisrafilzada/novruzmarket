import { createError, readBody } from 'h3'
import { readOrders, writeOrders } from '~/server/utils/orders-db'
import { readProducts, writeProducts } from '~/server/utils/products-db'
import { appendLog } from '~/server/utils/logs-db'
import { maybeSendAutomationEmail } from '~/server/utils/email-automation'
import { getRequestUser } from '~/server/utils/auth-session'
import { orderStatuses, statusNeedsInventoryRestore, statusToColor } from '~/server/utils/order-status'

const sellerManagedStatuses = ['Hazırlanır', 'Göndərildi', 'Çatdırıldı'] as const
type SellerManagedStatus = typeof sellerManagedStatuses[number]
const sellerStatusTransitions: Record<SellerManagedStatus | 'Gözləyir', Array<SellerManagedStatus>> = {
  'Gözləyir': ['Hazırlanır'],
  'Hazırlanır': ['Göndərildi'],
  'Göndərildi': ['Çatdırıldı'],
  'Çatdırıldı': []
}

const deriveOrderStatusFromSellerStatuses = (
  existingStatus: string,
  involvedSellerIds: number[],
  sellerStatuses: Record<string, { status: SellerManagedStatus; updatedAt: string }>
) => {
  const normalized = involvedSellerIds
    .map((sellerId) => sellerStatuses[String(sellerId)]?.status || 'Gözləyir')

  if (normalized.length === 0) return existingStatus
  if (normalized.every((status) => status === 'Çatdırıldı')) return 'Çatdırıldı'
  if (normalized.every((status) => status === 'Göndərildi' || status === 'Çatdırıldı')) return 'Göndərildi'
  if (normalized.some((status) => sellerManagedStatuses.includes(status as SellerManagedStatus))) return 'Hazırlanır'
  return existingStatus
}

export default defineEventHandler(async (event) => {
  const currentUser = await getRequestUser(event, { required: true, roles: ['Admin', 'Satıcı'] })
  const id = event.context.params?.id
  const body = await readBody<any>(event)
  const orders = await readOrders()

  const idx = orders.findIndex((o: any) => String(o?.id) === String(id))
  if (idx === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  }

  const existing = orders[idx] as any
  const nextStatus = String(body?.status || existing.status || 'Gözləyir')
  if (!orderStatuses.includes(nextStatus as any)) {
    throw createError({ statusCode: 400, statusMessage: 'Status yanlışdır' })
  }

  if (currentUser.role === 'Satıcı') {
    const products = await readProducts()
    const sellerProductIds = new Set(products.filter((product: any) => Number(product?.sellerId) === Number(currentUser.id)).map((product: any) => Number(product.id)))
    const hasSellerItems = Array.isArray(existing.items) && existing.items.some((item: any) => sellerProductIds.has(Number(item?.id)))
    if (!hasSellerItems) {
      throw createError({ statusCode: 403, statusMessage: 'Bu sifariş sizə aid deyil' })
    }
    if (!sellerManagedStatuses.includes(nextStatus as SellerManagedStatus)) {
      throw createError({ statusCode: 403, statusMessage: 'Satıcı bu statusu dəyişə bilməz' })
    }

    const involvedSellerIds = Array.from(new Set(
      (Array.isArray(existing.items) ? existing.items : [])
        .map((item: any) => products.find((product: any) => Number(product?.id) === Number(item?.id)))
        .filter(Boolean)
        .map((product: any) => Number(product.sellerId))
        .filter((sellerId: number) => Number.isFinite(sellerId) && sellerId > 0)
    ))

    const sellerStatuses = {
      ...(existing.sellerStatuses || {}),
      [String(currentUser.id)]: {
        status: nextStatus as SellerManagedStatus,
        updatedAt: new Date().toISOString()
      }
    }
    const previousSellerStatus = String(existing.sellerStatuses?.[String(currentUser.id)]?.status || 'Gözləyir') as SellerManagedStatus | 'Gözləyir'
    const allowedTransitions = sellerStatusTransitions[previousSellerStatus] || []
    if (!allowedTransitions.includes(nextStatus as SellerManagedStatus)) {
      throw createError({ statusCode: 400, statusMessage: 'Satıcı status keçidi ardıcıl olmalıdır' })
    }

    const derivedOrderStatus = deriveOrderStatusFromSellerStatuses(existing.status || 'Gözləyir', involvedSellerIds, sellerStatuses)

    const updated = {
      ...existing,
      sellerStatuses,
      status: derivedOrderStatus,
      statusColor: statusToColor(derivedOrderStatus),
      fulfilledAt: derivedOrderStatus === 'Çatdırıldı' ? new Date().toISOString() : existing.fulfilledAt,
      dispatchedAt: derivedOrderStatus === 'Göndərildi' ? new Date().toISOString() : existing.dispatchedAt,
      inventoryRestored: Boolean(existing.inventoryRestored)
    }

    orders[idx] = updated
    await writeOrders(orders)
    const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
    await appendLog({ user: updated.email || updated.customer || 'Müştəri', action: `Satıcı statusu yenilədi (${updated.id} → ${currentUser.id} / ${nextStatus})`, ip })
    return updated
  }

  const updated = {
    ...existing,
    status: nextStatus,
    statusColor: statusToColor(nextStatus),
    sellerStatuses: currentUser.role === 'Admin' ? {} : existing.sellerStatuses,
    fulfilledAt: nextStatus === 'Çatdırıldı' ? new Date().toISOString() : existing.fulfilledAt,
    dispatchedAt: nextStatus === 'Göndərildi' ? new Date().toISOString() : existing.dispatchedAt,
    inventoryRestored: Boolean(existing.inventoryRestored)
  }

  if (statusNeedsInventoryRestore(nextStatus) && !existing.inventoryRestored) {
    const products = await readProducts()
    for (const item of Array.isArray(existing.items) ? existing.items : []) {
      const productIndex = products.findIndex((product: any) => Number(product?.id) === Number(item?.id))
      if (productIndex === -1) continue
      const qty = Math.max(1, Number(item?.qty || 1))
      const currentProduct = { ...products[productIndex] }
      if (Number(item?.variationId || 0) > 0 && Array.isArray(currentProduct.variations)) {
        currentProduct.variations = currentProduct.variations.map((variation: any) =>
          Number(variation?.id) === Number(item?.variationId)
            ? { ...variation, stock: Math.max(0, Number(variation?.stock || 0) + qty) }
            : variation
        )
      } else {
        currentProduct.stock = Math.max(0, Number(currentProduct?.stock || 0) + qty)
      }
      currentProduct.sold = Math.max(0, Number(currentProduct?.sold || 0) - qty)
      products[productIndex] = currentProduct
    }
    updated.inventoryRestored = true
    await writeProducts(products as any)
  }

  orders[idx] = updated
  await writeOrders(orders)
  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  if (String(existing.status || '') !== String(nextStatus || '')) {
    await appendLog({ user: updated.email || updated.customer || 'Müştəri', action: `Sifariş statusu yeniləndi (${updated.id} → ${nextStatus})`, ip })
    await maybeSendAutomationEmail({
      kind: 'orderStatus',
      to: updated.email,
      ip,
      vars: { name: updated.customer, email: updated.email, orderId: updated.id, status: updated.status }
    })
  }
  return updated
})
