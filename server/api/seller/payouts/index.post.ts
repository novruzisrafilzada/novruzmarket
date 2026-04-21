import { createError, readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { appendLog } from '~/server/utils/logs-db'
import { readOrders } from '~/server/utils/orders-db'
import { readProducts } from '~/server/utils/products-db'
import { readSettings } from '~/server/utils/settings-db'
import { readSellerPayoutRequests, writeSellerPayoutRequests } from '~/server/utils/seller-payouts-db'

export default defineEventHandler(async (event) => {
  const currentUser = await getRequestUser(event, { required: true, roles: ['Satıcı'] })
  const body = await readBody<any>(event)
  const amount = Number(body?.amount || 0)
  const note = String(body?.note || '').trim()

  if (!Number.isFinite(amount) || amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Məbləğ yanlışdır' })
  }

  const [items, orders, products, settings] = await Promise.all([
    readSellerPayoutRequests(),
    readOrders(),
    readProducts(),
    readSettings()
  ])

  const sellerProductIds = new Set(
    products
      .filter((product: any) => Number(product?.sellerId) === Number(currentUser.id))
      .map((product: any) => Number(product.id))
  )

  const eligibleOrders = orders.filter((order: any) =>
    String(order?.status || '') === 'Çatdırıldı'
    && ['paid', 'pending', 'cash'].includes(String(order?.paymentStatus || order?.paymentMethod || '').toLowerCase())
  )

  const grossRevenue = eligibleOrders.reduce((sum: number, order: any) => {
    const sellerItems = (Array.isArray(order?.items) ? order.items : []).filter((item: any) => sellerProductIds.has(Number(item?.id)))
    const sellerAmount = sellerItems.reduce((itemSum: number, item: any) => itemSum + Number(item?.price || 0) * Number(item?.qty || 0), 0)
    return sum + sellerAmount
  }, 0)

  const commissionRate = Number(settings.sellerCommissionRate || 10)
  const commissionAmount = grossRevenue * (commissionRate / 100)
  const netRevenue = Math.max(0, grossRevenue - commissionAmount)
  const reservedPayoutAmount = items
    .filter((item) => Number(item.sellerId) === Number(currentUser.id) && ['Gözləyir', 'Təsdiqləndi'].includes(String(item.status || '')))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const availableForPayout = Math.max(0, netRevenue - reservedPayoutAmount)

  if (amount > availableForPayout) {
    throw createError({ statusCode: 400, statusMessage: 'Mövcud payout balansından çox məbləğ seçildi' })
  }

  const created = {
    id: `PAYOUT-${Date.now()}`,
    sellerId: Number(currentUser.id),
    sellerName: String(currentUser.sellerProfile?.shopName || currentUser.name || 'Satıcı'),
    amount,
    note: note || undefined,
    status: 'Gözləyir' as const,
    createdAt: new Date().toISOString(),
    transferReference: undefined,
    processedAt: undefined,
    processedBy: undefined,
    failureReason: undefined
  }
  items.unshift(created)
  await writeSellerPayoutRequests(items)
  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({ user: currentUser.email || currentUser.name, action: 'Payout sorğusu göndərildi', ip })
  return created
})
