import { createError, readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { readSettings } from '~/server/utils/settings-db'
import { readSellerFeaturedRequests, writeSellerFeaturedRequests } from '~/server/utils/seller-featured-requests-db'

export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event, { required: true, roles: ['Satıcı'] })
  const body = await readBody<any>(event)
  const planDays = Number(body?.planDays || 0)
  const paymentNote = String(body?.paymentNote || '').trim()
  const settings = await readSettings()
  const plans = settings.sellerPromotion?.plans || []
  const plan = plans.find((item: any) => Number(item.days) === planDays && item.enabled)

  if (!plan) {
    throw createError({ statusCode: 400, statusMessage: 'Plan tapılmadı' })
  }

  const requests = await readSellerFeaturedRequests()
  const maxId = requests.length ? Math.max(...requests.map((item) => Number(item.id) || 0)) : 0
  const created = {
    id: maxId + 1,
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
  await writeSellerFeaturedRequests(requests)
  return created
})
