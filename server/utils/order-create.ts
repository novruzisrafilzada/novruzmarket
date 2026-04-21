import { readOrders, writeOrders } from '~/server/utils/orders-db'
import { readProducts, writeProducts } from '~/server/utils/products-db'
import { statusToColor } from '~/server/utils/order-status'

export interface CreateOrderPayload {
  customer: string
  email: string
  amount: number
  address: string
  phone: string
  paymentMethod: 'card' | 'cash'
  items: any[]
  couponCode?: string
  discountAmount?: number
  paymentStatus?: 'pending' | 'paid' | 'failed'
  paymentProvider?: string
  paymentSessionId?: string
  shippingMethodId?: number
  shippingMethodName?: string
  shippingFee?: number
  shippingEta?: string
  shippingRegion?: string
}

export const createStoredOrder = async (payload: CreateOrderPayload) => {
  const products = await readProducts()
  const nextItems = Array.isArray(payload.items) ? payload.items : []
  const invalidItems: number[] = []

  const resolveVariation = (product: any, variationIdRaw: any) => {
    const variationId = Number(variationIdRaw)
    if (!Number.isFinite(variationId) || variationId <= 0) return null
    const variations = Array.isArray(product?.variations) ? product.variations : []
    return variations.find((variation: any) => Number(variation?.id) === variationId) || null
  }

  for (const item of nextItems) {
    const productIndex = products.findIndex((product: any) => Number(product?.id) === Number(item?.id))
    if (productIndex === -1) {
      invalidItems.push(Number(item?.id))
      continue
    }
    const requestedQty = Math.max(1, Number(item?.qty || 1))
    const variation = resolveVariation(products[productIndex], item?.variationId)
    const currentStock = variation
      ? Math.max(0, Number(variation?.stock || 0))
      : Math.max(0, Number(products[productIndex]?.stock || 0))
    if (requestedQty > currentStock) {
      const label = String(item?.variationLabel || variation?.size || '').trim()
      throw new Error(`${products[productIndex]?.name || 'Məhsul'}${label ? ` (${label})` : ''} üçün stok kifayət etmir`)
    }
  }
  if (invalidItems.length > 0) {
    throw new Error(`Səbətdəki ${invalidItems.length} məhsul artıq mövcud deyil. Zəhmət olmasa səbəti yeniləyin.`)
  }

  const updatedProducts = products.map((product: any) => ({ ...product }))
  for (const item of nextItems) {
    const productIndex = updatedProducts.findIndex((product: any) => Number(product?.id) === Number(item?.id))
    const requestedQty = Math.max(1, Number(item?.qty || 1))
    const currentProduct = { ...updatedProducts[productIndex] }
    const variation = resolveVariation(currentProduct, item?.variationId)
    if (variation) {
      currentProduct.variations = (Array.isArray(currentProduct.variations) ? currentProduct.variations : []).map((entry: any) =>
        Number(entry?.id) === Number(variation.id)
          ? {
              ...entry,
              stock: Math.max(0, Number(entry?.stock || 0) - requestedQty)
            }
          : entry
      )
    } else {
      currentProduct.stock = Math.max(0, Number(currentProduct?.stock || 0) - requestedQty)
    }
    currentProduct.sold = Math.max(0, Number(currentProduct?.sold || 0) + requestedQty)
    updatedProducts[productIndex] = currentProduct
  }

  const orders = await readOrders()
  const newId = `#ORD-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`
  const trackingCode = `TRK-${Date.now().toString().slice(-8)}`
  const date = new Date().toLocaleDateString('az-AZ', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Baku' })
  const status = 'Gözləyir'

  const created = {
    id: newId,
    customer: String(payload.customer || '').trim(),
    email: String(payload.email || '').trim(),
    date,
    amount: Number(payload.amount || 0),
    status,
    statusColor: statusToColor(status),
    address: String(payload.address || '').trim(),
    phone: String(payload.phone || '').trim(),
    paymentMethod: payload.paymentMethod === 'cash' ? 'cash' : 'card',
    paymentStatus: payload.paymentStatus || (payload.paymentMethod === 'card' ? 'paid' : 'pending'),
    paymentProvider: String(payload.paymentProvider || '').trim() || undefined,
    paymentSessionId: String(payload.paymentSessionId || '').trim() || undefined,
    trackingCode,
    items: nextItems,
    couponCode: String(payload.couponCode || '').trim() || undefined,
    discountAmount: payload.discountAmount != null ? Number(payload.discountAmount || 0) : undefined,
    shippingMethodId: Number.isFinite(Number(payload.shippingMethodId)) ? Number(payload.shippingMethodId) : undefined,
    shippingMethodName: String(payload.shippingMethodName || '').trim() || undefined,
    shippingFee: Number.isFinite(Number(payload.shippingFee)) ? Number(payload.shippingFee) : undefined,
    shippingEta: String(payload.shippingEta || '').trim() || undefined,
    shippingRegion: String(payload.shippingRegion || '').trim() || undefined,
    inventoryReserved: true
  }

  orders.unshift(created)
  await writeProducts(updatedProducts as any)
  await writeOrders(orders)
  return created
}
