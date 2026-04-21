import { createError, readBody } from 'h3'
import { appendLog } from '~/server/utils/logs-db'
import { readReviews, writeReviews, type Review } from '~/server/utils/reviews-db'
import { readProducts, writeProducts } from '~/server/utils/products-db'
import { getRequestUser } from '~/server/utils/auth-session'
import { readOrders } from '~/server/utils/orders-db'

export default defineEventHandler(async (event) => {
  const sessionUser = await getRequestUser(event).catch(() => null)
  const body = await readBody<any>(event)
  const productId = Number(body?.productId)
  const name = String(body?.name || sessionUser?.name || '').trim()
  const email = String(body?.email || sessionUser?.email || '').trim().toLowerCase()
  const rating = Math.floor(Number(body?.rating))
  const comment = String(body?.comment || '').trim()
  const images = Array.isArray(body?.images)
    ? body.images.map((item: any) => String(item || '').trim()).filter(Boolean).slice(0, 4)
    : []

  if (!Number.isFinite(productId) || productId <= 0) throw createError({ statusCode: 400, statusMessage: 'Invalid productId' })
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Name required' })
  if (!email || !email.includes('@')) throw createError({ statusCode: 400, statusMessage: 'Invalid email' })
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) throw createError({ statusCode: 400, statusMessage: 'Invalid rating' })
  if (!comment || comment.length < 3) throw createError({ statusCode: 400, statusMessage: 'Comment required' })

  const orders = await readOrders()
  const verifiedPurchase = orders.some((order: any) =>
    String(order?.email || '').trim().toLowerCase() === email
    && Array.isArray(order?.items)
    && order.items.some((item: any) => Number(item?.id) === productId)
    && ['Təsdiqləndi', 'Hazırlanır', 'Göndərildi', 'Çatdırıldı', 'Qaytarma istəyi', 'Qaytarıldı'].includes(String(order?.status || ''))
  )
  if (!verifiedPurchase) {
    throw createError({ statusCode: 403, statusMessage: 'Bu məhsul üçün yalnız təsdiqlənmiş alıcı rəy yaza bilər' })
  }

  const reviews = await readReviews()
  const maxId = reviews.length > 0 ? Math.max(...reviews.map(r => Number(r.id) || 0)) : 0
  const created: Review = {
    id: maxId + 1,
    productId,
    name,
    email,
    rating,
    comment,
    createdAt: new Date().toISOString(),
    verifiedPurchase,
    images,
    helpfulCount: 0
  }
  reviews.unshift(created)
  await writeReviews(reviews)

  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({ user: email, action: `Rəy yazdı (product: ${productId}, rating: ${rating})`, ip })

  try {
    const productReviews = reviews.filter(r => Number(r.productId) === productId)
    const count = productReviews.length
    const sum = productReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0)
    const avg = count > 0 ? sum / count : 0
    const ratingAvg = Math.max(0, Math.min(5, Math.round(avg * 10) / 10))
    const products = await readProducts()
    const idx = products.findIndex((p: any) => Number(p?.id) === productId)
    if (idx !== -1) {
      products[idx] = { ...products[idx], rating: ratingAvg, reviewCount: count }
      await writeProducts(products as any)
    }
  } catch {
  }

  return created
})
