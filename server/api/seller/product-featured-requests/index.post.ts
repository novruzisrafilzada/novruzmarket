import { createError, readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { readProducts } from '~/server/utils/products-db'
import { readProductFeaturedRequests, writeProductFeaturedRequests } from '~/server/utils/product-featured-requests-db'
import { readSettings } from '~/server/utils/settings-db'

export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event, { required: true, roles: ['Satıcı'] })
  const body = await readBody<any>(event)
  const productId = Number(body?.productId || 0)
  const planDays = Number(body?.planDays || 0)
  const paymentNote = String(body?.paymentNote || '').trim()

  const [settings, products, requests] = await Promise.all([
    readSettings(),
    readProducts(),
    readProductFeaturedRequests()
  ])

  const plan = (settings.sellerPromotion?.plans || []).find((item: any) => Number(item.days) === planDays && item.enabled)
  if (!plan) {
    throw createError({ statusCode: 400, statusMessage: 'Plan tapılmadı' })
  }

  const product = products.find((item: any) => Number(item.id) === productId && Number(item.sellerId) === Number(user.id))
  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Məhsul tapılmadı' })
  }

  const maxId = requests.length ? Math.max(...requests.map((item) => Number(item.id) || 0)) : 0
  const created = {
    id: maxId + 1,
    productId,
    productName: String(product.name || ''),
    sellerId: Number(user.id),
    sellerName: user.name,
    shopName: user.sellerProfile?.shopName || user.name,
    planDays,
    planLabel: String(plan.label || `${planDays} gün`),
    amount: Number(plan.price || 0),
    paymentNote,
    status: 'Gözləyir' as const,
    submittedAt: new Date().toISOString()
  }

  requests.unshift(created)
  await writeProductFeaturedRequests(requests)
  return created
})
