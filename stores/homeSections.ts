import { defineStore } from 'pinia'

export type I18n3 = { az: string; ru: string; en: string }

export interface HomeSectionsConfig {
  ui: {
    cardBorders: boolean
    hoverLift: boolean
    showRating: boolean
    showRatingMobile: boolean
    cardSurfaceBg: string
    cardImageBg: string
    cardBorderColor: string
    cardTitleColor: string
    cardPriceColor: string
    cardMutedColor: string
    cardBadgeBg: string
    cardBadgeText: string
    cardActionBg: string
    cardActionText: string
    cardActionHoverBg: string
    cardSoldBarColor: string
    quickActionBg: string
    quickActionIcon: string
    countdownBg: string
    countdownText: string
  }
  promoStrip: {
    enabled: boolean
    speedSec: number
    itemsI18n: I18n3[]
  }
  news: {
    enabled: boolean
    titleI18n: I18n3
    badgeI18n: I18n3
    days: number
  }
  topSelling: {
    enabled: boolean
    titleI18n: I18n3
    categoryIds: number[]
    productLimit: number
    showQuickView: boolean
  }
  topProducts: {
    enabled: boolean
    titleI18n: I18n3
    productIds: number[]
  }
  featuredCategories: {
    enabled: boolean
    titleI18n: I18n3
    subtitleI18n: I18n3
    limit: number
  }
  featuredSellers: {
    enabled: boolean
    titleI18n: I18n3
    subtitleI18n: I18n3
    limit: number
  }
  sellerProducts: {
    enabled: boolean
    titleI18n: I18n3
    subtitleI18n: I18n3
    limit: number
  }
  trendingNow: {
    enabled: boolean
    titleI18n: I18n3
    subtitleI18n: I18n3
    limit: number
  }
  popularSearches: {
    enabled: boolean
    titleI18n: I18n3
    subtitleI18n: I18n3
    limit: number
  }
  shopByBudget: {
    enabled: boolean
    titleI18n: I18n3
    subtitleI18n: I18n3
    cards: Array<{ labelI18n: I18n3; subtitleI18n: I18n3; minPrice: number; maxPrice: number; href: string }>
  }
  bestRatedProducts: {
    enabled: boolean
    titleI18n: I18n3
    subtitleI18n: I18n3
    limit: number
  }
  shopByBrand: {
    enabled: boolean
    titleI18n: I18n3
    subtitleI18n: I18n3
    cards: Array<{ name: string; logo: string; href: string }>
  }
  frequentlyBoughtTogether: {
    enabled: boolean
    titleI18n: I18n3
    subtitleI18n: I18n3
    limit: number
  }
  sellerTrustMetrics: {
    enabled: boolean
    titleI18n: I18n3
    subtitleI18n: I18n3
    limit: number
  }
  flashDeals: {
    enabled: boolean
    titleI18n: I18n3
    subtitleI18n: I18n3
    ctaLabelI18n: I18n3
  }
  verifiedSellers: {
    enabled: boolean
    titleI18n: I18n3
    subtitleI18n: I18n3
    limit: number
  }
  buyerProtection: {
    enabled: boolean
    titleI18n: I18n3
    subtitleI18n: I18n3
    items: Array<{ icon: string; titleI18n: I18n3; subtitleI18n: I18n3 }>
  }
  marketHighlights: {
    enabled: boolean
    titleI18n: I18n3
    subtitleI18n: I18n3
  }
  recentlyViewed: {
    enabled: boolean
    titleI18n: I18n3
  }
  experienceBuilder: {
    audienceMode: 'general' | 'new' | 'returning' | 'vip'
    sectionOrder: string[]
  }
  campaignBlocks: Array<{
    enabled: boolean
    audience: 'all' | 'new' | 'returning' | 'vip'
    titleI18n: I18n3
    subtitleI18n: I18n3
    ctaLabelI18n: I18n3
    href: string
    image: string
  }>
  storytelling: {
    newArrivals: { enabled: boolean; titleI18n: I18n3; subtitleI18n: I18n3; limit: number }
    trending: { enabled: boolean; titleI18n: I18n3; subtitleI18n: I18n3; limit: number }
    weeklyPick: { enabled: boolean; titleI18n: I18n3; subtitleI18n: I18n3; productIds: number[] }
    editorsPick: { enabled: boolean; titleI18n: I18n3; subtitleI18n: I18n3; productIds: number[] }
  }
  lookbook: {
    enabled: boolean
    titleI18n: I18n3
    subtitleI18n: I18n3
    blocks: Array<{ titleI18n: I18n3; subtitleI18n: I18n3; image: string; href: string }>
  }
  ugcShowcase: {
    enabled: boolean
    titleI18n: I18n3
    subtitleI18n: I18n3
    cards: Array<{ creator: string; handle: string; textI18n: I18n3; image: string; href: string }>
  }
}

export const useHomeSectionsStore = defineStore('homeSections', {
  state: () => ({
    hydrated: false,
    config: null as HomeSectionsConfig | null
  }),
  actions: {
    setConfig(cfg: HomeSectionsConfig) {
      this.config = cfg
      this.hydrated = true
    },
    async fetchConfig() {
      const cfg = await $fetch<HomeSectionsConfig>('/api/home-sections')
      this.setConfig(cfg)
      return cfg
    },
    async saveConfig(patch: Partial<HomeSectionsConfig>) {
      const saved = await $fetch<HomeSectionsConfig>('/api/home-sections', { method: 'PUT', body: patch })
      this.setConfig(saved)
      return saved
    }
  }
})
