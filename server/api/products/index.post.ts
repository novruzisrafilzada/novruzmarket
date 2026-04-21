import { readBody } from 'h3'
import { readProducts, writeProducts } from '../../utils/products-db'
import { getRequestUser } from '~/server/utils/auth-session'
import { autoNotifyNewsletter } from '~/server/utils/newsletter-notify'

export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event, { required: true, roles: ['Admin', 'Satıcı'] })
  const body = await readBody<any>(event)
  const products = await readProducts()
  const maxId = products.length > 0 ? Math.max(...products.map((p: any) => Number(p.id) || 0)) : 0
  const created = {
    ...body,
    id: maxId + 1,
    productCode: String(body?.productCode || `PRD-${String(maxId + 1).padStart(6, '0')}`),
    viewCount: Number(body?.viewCount || 0),
    featuredStatus: String(body?.featuredStatus || 'Yoxdur'),
    featuredPlanDays: Number(body?.featuredPlanDays || 0),
    featuredPlanLabel: String(body?.featuredPlanLabel || ''),
    featuredUntil: String(body?.featuredUntil || ''),
    featuredBadgeText: String(body?.featuredBadgeText || 'PRO'),
    featuredPriority: Number(body?.featuredPriority || 0),
    createdAt: new Date().toISOString()
  } as any

  if (user.role === 'Satıcı') {
    created.sellerId = user.id
    created.sellerName = user.name
    created.sellerShopName = user.sellerProfile?.shopName || ''
  }

  products.unshift(created)
  await writeProducts(products)

  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await autoNotifyNewsletter({
    type: 'newProduct',
    subject: `Yeni məhsul: ${String(created.name || '').trim()}`.trim(),
    html: `<h2>Yeni məhsul</h2><p><b>${String(created.name || '').trim()}</b></p><p>Qiymət: ${String(created.price ?? '')}</p>`,
    ip
  })
  return created
})
