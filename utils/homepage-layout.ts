export type HomepageBannerPlacement = 'afterFeatures' | 'afterTopDeals' | 'afterTopProducts'

export type HomepageBannerLike = {
  id?: number
  status?: string
  position?: string
  homePlacement?: string
  featuredStatus?: string
}

const placementKeys: HomepageBannerPlacement[] = ['afterFeatures', 'afterTopDeals', 'afterTopProducts']

export const normalizeHomeBannerLayout = (value: string | null | undefined) =>
  value === 'mosaic' ? 'mosaic' : 'carousel'

export const getBannerDisplayLimit = (layout: string | null | undefined) =>
  normalizeHomeBannerLayout(layout) === 'mosaic' ? 4 : 3

export const getPlacementBanners = (
  banners: HomepageBannerLike[],
  placement: HomepageBannerPlacement,
  layout: string | null | undefined,
  fallbackPlacement: HomepageBannerPlacement = 'afterFeatures'
) => {
  const limit = getBannerDisplayLimit(layout)
  return banners
    .filter((banner) => banner.status === 'Aktiv' && banner.position === 'Middle')
    .filter((banner) => String(banner.homePlacement || fallbackPlacement) === placement)
    .slice(0, limit)
}

export const getStandaloneMiddleBanners = (
  banners: HomepageBannerLike[],
  limit = 3,
  fallbackPlacement: HomepageBannerPlacement = 'afterFeatures'
) =>
  banners
    .filter((banner) => banner.status === 'Aktiv' && banner.position === 'Middle')
    .filter((banner) => !placementKeys.includes(String(banner.homePlacement || fallbackPlacement) as HomepageBannerPlacement))
    .slice(0, limit)
