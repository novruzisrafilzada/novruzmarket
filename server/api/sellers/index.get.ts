import { getQuery } from 'h3'
import { readCategories } from '~/server/utils/categories-db'
import { readProducts } from '~/server/utils/products-db'
import { readUsers } from '~/server/utils/users-db'

export default defineEventHandler(async (event) => {
  const [users, products, categories] = await Promise.all([readUsers(), readProducts(), readCategories()])
  const query = getQuery(event)
  const featuredOnly = String(query.featured || '') === '1'
  const limit = Math.max(0, Number(query.limit || 0))
  const categoryMap = new Map(categories.map((category) => [Number(category.id), category] as const))

  const sellers = users
    .filter((user) => user.role === 'Satıcı' && (user.status || 'Aktiv') !== 'Deaktiv')
    .map((user) => {
      const sellerProducts = products.filter((product: any) => Number(product?.sellerId) === Number(user.id))
      const featuredUntil = String(user.sellerProfile?.featuredUntil || '')
      const isFeatured = user.sellerProfile?.featuredStatus === 'Aktiv' && featuredUntil && new Date(featuredUntil).getTime() > Date.now()
      const verifiedStatus = String(user.sellerProfile?.verifiedStatus || 'Yoxdur')
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || user.sellerProfile?.phone || '',
        status: user.status || 'Aktiv',
        shopName: user.sellerProfile?.shopName || user.name,
        note: user.sellerProfile?.note || '',
        profileImage: user.sellerProfile?.profileImage || '',
        coverImage: user.sellerProfile?.coverImage || '',
        categoryIds: Array.isArray(user.sellerProfile?.categoryIds) ? user.sellerProfile?.categoryIds.map((value: any) => Number(value)).filter((value: number) => Number.isFinite(value)) : [],
        categoryNames: (Array.isArray(user.sellerProfile?.categoryIds) ? user.sellerProfile?.categoryIds : [])
          .map((value: any) => categoryMap.get(Number(value)))
          .filter(Boolean)
          .map((category: any) => category?.nameI18n?.az || category?.slug || ''),
        featuredStatus: isFeatured ? 'Aktiv' : (user.sellerProfile?.featuredStatus || 'Yoxdur'),
        featuredPlanDays: Number(user.sellerProfile?.featuredPlanDays || 0),
        featuredPlanLabel: user.sellerProfile?.featuredPlanLabel || '',
        featuredUntil,
        featuredBadgeText: user.sellerProfile?.featuredBadgeText || 'PRO',
        featuredPriority: Number(user.sellerProfile?.featuredPriority || 0),
        isFeatured,
        verifiedStatus,
        isVerified: verifiedStatus === 'Təsdiqləndi',
        verifiedAt: user.sellerProfile?.verifiedAt || '',
        verifiedByName: user.sellerProfile?.verifiedByName || '',
        verifiedNote: user.sellerProfile?.verifiedNote || '',
        verificationHistory: user.sellerProfile?.verificationHistory || [],
        verificationDocuments: user.sellerProfile?.verificationDocuments || [],
        productCount: sellerProducts.length,
        stockTotal: sellerProducts.reduce((sum: number, product: any) => sum + Number(product?.stock || 0), 0),
        joinedAt: user.createdAt
      }
    })
    .filter((seller) => featuredOnly ? seller.isFeatured : true)
    .sort((a, b) => {
      if (Number(b.isFeatured) !== Number(a.isFeatured)) return Number(b.isFeatured) - Number(a.isFeatured)
      if (Number(b.featuredPriority || 0) !== Number(a.featuredPriority || 0)) return Number(b.featuredPriority || 0) - Number(a.featuredPriority || 0)
      return Number(b.productCount) - Number(a.productCount)
    })

  return limit > 0 ? sellers.slice(0, limit) : sellers
})
