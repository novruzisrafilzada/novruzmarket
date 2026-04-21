import { createError, readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { readSellerFeaturedRequests, writeSellerFeaturedRequests } from '~/server/utils/seller-featured-requests-db'
import { readSettings } from '~/server/utils/settings-db'
import { readUsers, writeUsers } from '~/server/utils/users-db'

export default defineEventHandler(async (event) => {
  const admin = await getRequestUser(event, { required: true, roles: ['Admin'] })
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<any>(event)
  const status = String(body?.status || '').trim()

  if (!['Təsdiqləndi', 'Rədd edildi'].includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Status yanlışdır' })
  }

  const [requests, users, settings] = await Promise.all([
    readSellerFeaturedRequests(),
    readUsers(),
    readSettings()
  ])

  const request = requests.find((item) => Number(item.id) === id)
  if (!request) {
    throw createError({ statusCode: 404, statusMessage: 'Sorğu tapılmadı' })
  }

  request.status = status as 'Təsdiqləndi' | 'Rədd edildi'
  request.approvedAt = new Date().toISOString()
  request.approvedBy = admin.email

  const user = users.find((item) => Number(item.id) === Number(request.sellerId) && item.role === 'Satıcı')
  if (user) {
    user.sellerProfile = user.sellerProfile || {}
    if (status === 'Təsdiqləndi') {
      const until = new Date(Date.now() + request.planDays * 24 * 60 * 60 * 1000).toISOString()
      user.sellerProfile.featuredStatus = 'Aktiv'
      user.sellerProfile.featuredPlanDays = request.planDays
      user.sellerProfile.featuredPlanLabel = request.planLabel
      user.sellerProfile.featuredUntil = until
      user.sellerProfile.featuredBadgeText = settings.sellerPromotion?.featuredBadgeText || 'PRO'
      user.sellerProfile.featuredPriority = Number(body?.featuredPriority || user.sellerProfile.featuredPriority || request.planDays)
      user.sellerProfile.featuredPaymentStatus = 'Təsdiqləndi'
      user.sellerProfile.featuredApprovedAt = request.approvedAt
    } else {
      user.sellerProfile.featuredStatus = 'Yoxdur'
      user.sellerProfile.featuredPlanDays = 0
      user.sellerProfile.featuredPlanLabel = ''
      user.sellerProfile.featuredUntil = ''
      user.sellerProfile.featuredPriority = 0
      user.sellerProfile.featuredPaymentStatus = 'Rədd edildi'
      user.sellerProfile.featuredApprovedAt = request.approvedAt
    }
  }

  await Promise.all([
    writeSellerFeaturedRequests(requests),
    writeUsers(users)
  ])

  return request
})
