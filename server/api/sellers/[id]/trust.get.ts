import { createError } from 'h3'
import { readUsers } from '~/server/utils/users-db'
import { readProducts } from '~/server/utils/products-db'
import { readOrders } from '~/server/utils/orders-db'

export default defineEventHandler(async (event) => {
  const sellerId = Number(event.context.params?.id || 0)
  if (!Number.isFinite(sellerId) || sellerId <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid seller id' })
  }

  const [users, products, orders] = await Promise.all([readUsers(), readProducts(), readOrders()])
  const seller = users.find((user: any) => Number(user?.id || 0) === sellerId && (user.role === 'seller' || user.role === 'Satıcı'))
  if (!seller) {
    throw createError({ statusCode: 404, statusMessage: 'Seller not found' })
  }

  const sellerProducts = products.filter((product: any) => Number(product?.sellerId || 0) === sellerId && product?.status === 'Aktiv')
  const sellerProductIds = new Set(sellerProducts.map((product: any) => Number(product.id)))
  const sellerOrders = orders.filter((order: any) => (order?.items || []).some((item: any) => sellerProductIds.has(Number(item?.id || 0))))
  const stockTotal = sellerProducts.reduce((sum: number, item: any) => sum + Math.max(0, Number(item?.stock || 0)), 0)
  const soldTotal = sellerProducts.reduce((sum: number, item: any) => sum + Math.max(0, Number(item?.sold || 0)), 0)
  const ratingAvg = sellerProducts.length > 0
    ? sellerProducts.reduce((sum: number, item: any) => sum + Number(item?.rating || 0), 0) / sellerProducts.length
    : 0
  const verifiedBoost = seller.sellerProfile?.verifiedStatus === 'Təsdiqləndi' ? 15 : 0
  const featuredBoost = seller.sellerProfile?.featuredStatus === 'Aktiv' ? 8 : 0
  const score = Math.round(
    Math.min(100,
      verifiedBoost
      + featuredBoost
      + Math.min(30, sellerProducts.length * 3)
      + Math.min(20, sellerOrders.length * 4)
      + Math.min(15, stockTotal)
      + Math.min(12, soldTotal)
      + Math.min(20, ratingAvg * 4)
    )
  )

  return {
    id: seller.id,
    name: seller.name,
    shopName: seller.sellerProfile?.shopName || seller.name,
    profileImage: seller.sellerProfile?.profileImage || '',
    verifiedStatus: seller.sellerProfile?.verifiedStatus || 'Yoxdur',
    verifiedAt: seller.sellerProfile?.verificationUpdatedAt || null,
    productCount: sellerProducts.length,
    orderCount: sellerOrders.length,
    stockTotal,
    soldTotal,
    ratingAvg: Number(ratingAvg.toFixed(1)),
    score
  }
})
