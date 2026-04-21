import { createError, readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { readProductFeaturedRequests, writeProductFeaturedRequests } from '~/server/utils/product-featured-requests-db'
import { readProducts, writeProducts } from '~/server/utils/products-db'
import { readSettings } from '~/server/utils/settings-db'

export default defineEventHandler(async (event) => {
  const admin = await getRequestUser(event, { required: true, roles: ['Admin'] })
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<any>(event)
  const status = String(body?.status || '').trim()

  if (!['Təsdiqləndi', 'Rədd edildi'].includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Status yanlışdır' })
  }

  const [requests, products, settings] = await Promise.all([
    readProductFeaturedRequests(),
    readProducts(),
    readSettings()
  ])

  const request = requests.find((item) => Number(item.id) === id)
  if (!request) {
    throw createError({ statusCode: 404, statusMessage: 'Sorğu tapılmadı' })
  }

  request.status = status as 'Təsdiqləndi' | 'Rədd edildi'
  request.approvedAt = new Date().toISOString()
  request.approvedBy = admin.email

  const product = products.find((item: any) => Number(item.id) === Number(request.productId))
  if (product) {
    if (status === 'Təsdiqləndi') {
      const until = new Date(Date.now() + request.planDays * 24 * 60 * 60 * 1000).toISOString()
      product.featuredStatus = 'Aktiv'
      product.featuredPlanDays = request.planDays
      product.featuredPlanLabel = request.planLabel
      product.featuredUntil = until
      product.featuredBadgeText = settings.sellerPromotion?.featuredBadgeText || 'PRO'
      product.featuredPriority = Number(body?.featuredPriority || product.featuredPriority || request.planDays)
    } else {
      product.featuredStatus = 'Yoxdur'
      product.featuredPlanDays = 0
      product.featuredPlanLabel = ''
      product.featuredUntil = ''
      product.featuredPriority = 0
    }
  }

  await Promise.all([
    writeProductFeaturedRequests(requests),
    writeProducts(products)
  ])

  return request
})
