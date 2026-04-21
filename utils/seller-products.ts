export type SellerHomepageProductLike = {
  sellerId?: number | string | null
  status?: string | null
  featuredStatus?: string | null
  featuredPriority?: number | string | null
}

export const getVisibleSellerProducts = (products: SellerHomepageProductLike[], limit: number) =>
  products
    .filter((product) => Number(product?.sellerId || 0) > 0 && String(product?.status || '') === 'Aktiv')
    .sort((a, b) => {
      if (String(b.featuredStatus || '') === 'Aktiv' && String(a.featuredStatus || '') !== 'Aktiv') return 1
      if (String(a.featuredStatus || '') === 'Aktiv' && String(b.featuredStatus || '') !== 'Aktiv') return -1
      return Number(b.featuredPriority || 0) - Number(a.featuredPriority || 0)
    })
    .slice(0, Math.max(1, Number(limit || 8)))
