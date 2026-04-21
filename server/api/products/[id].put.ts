import { createError, readBody } from 'h3'
import { readProducts, writeProducts } from '../../utils/products-db'
import { getRequestUser } from '~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event, { required: true, roles: ['Admin', 'Satıcı'] })
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<any>(event)
  const products = await readProducts()
  const index = products.findIndex((p: any) => Number(p.id) === id)
  if (index === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  const current = products[index] as any
  if (user.role === 'Satıcı' && Number(current.sellerId) !== Number(user.id)) {
    throw createError({ statusCode: 403, statusMessage: 'Bu məhsulu yeniləməyə icazəniz yoxdur' })
  }

  products[index] = {
    ...current,
    ...body,
    id,
    productCode: String(body?.productCode || current.productCode || `PRD-${String(id).padStart(6, '0')}`),
    viewCount: Number(body?.viewCount ?? current.viewCount ?? 0),
    featuredStatus: String(body?.featuredStatus || current.featuredStatus || 'Yoxdur'),
    featuredPlanDays: Number(body?.featuredPlanDays ?? current.featuredPlanDays ?? 0),
    featuredPlanLabel: String(body?.featuredPlanLabel || current.featuredPlanLabel || ''),
    featuredUntil: String(body?.featuredUntil || current.featuredUntil || ''),
    featuredBadgeText: String(body?.featuredBadgeText || current.featuredBadgeText || 'PRO'),
    featuredPriority: Number(body?.featuredPriority ?? current.featuredPriority ?? 0),
    ...(user.role === 'Satıcı'
      ? {
          sellerId: user.id,
          sellerName: user.name,
          sellerShopName: user.sellerProfile?.shopName || ''
        }
      : {})
  }
  await writeProducts(products)
  return products[index]
})
