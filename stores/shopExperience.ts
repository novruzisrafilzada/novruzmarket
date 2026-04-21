import { defineStore } from 'pinia'

export type LocalizedText = {
  az: string
  ru: string
  en: string
}

export type ShopRailConfig = {
  enabled: boolean
  limit: number
  selectionMode?: 'auto' | 'manual'
  manualProductIds?: number[]
  title: LocalizedText
  subtitle: LocalizedText
}

export type SearchHelperChip = {
  id: string
  label: LocalizedText
  query: string
}

export type ShopProductCardPreset = {
  id: string
  name: LocalizedText
  description: LocalizedText
  settings: ShopProductCardSettings
}

export type ShopProductCardSettings = {
  layoutVariant: 'classic' | 'premium-luxe'
  density: 'comfortable' | 'compact'
  mobileDensity: 'comfortable' | 'compact'
  contentSpacing: 'tight' | 'balanced'
  imageFit: 'contain' | 'cover'
  stylePreset: 'soft' | 'outlined' | 'elevated'
  cornerStyle: 'rounded' | 'soft' | 'sharp'
  mediaRatio: 'portrait' | 'square'
  titleLines: 1 | 2
  mobileTitleLines: 1 | 2
  mobileMetaMode: 'rich' | 'minimal'
  priceTone: 'brand' | 'dark'
  primaryCtaBg: string
  primaryCtaText: string
  secondaryCtaBg: string
  secondaryCtaText: string
  secondaryCtaBorder: string
  discountBadgeBg: string
  discountBadgeText: string
  newBadgeBg: string
  newBadgeText: string
  stockBadgeBg: string
  stockBadgeText: string
  stockBadgeBorder: string
  outOfStockBadgeBg: string
  outOfStockBadgeText: string
  lowStockText: string
  showDiscountBadge: boolean
  showFeaturedBadge: boolean
  showNewBadge: boolean
  showBrandBadge: boolean
  showViewCount: boolean
  showSellerName: boolean
  showSellerScore: boolean
  showCategoryChip: boolean
  showRating: boolean
  showReviewCount: boolean
  showSoldCount: boolean
  showStockBadge: boolean
  showLowStockText: boolean
  showWishlistAction: boolean
  showCompareAction: boolean
  showQuickViewAction: boolean
  showSecondaryCta: boolean
  showMobileSellerName: boolean
  showMobileRating: boolean
  showMobileReviewCount: boolean
  showMobileSoldCount: boolean
  showMobileStockBadge: boolean
  showMobileWishlistAction: boolean
  showMobileQuickViewAction: boolean
}

export type ShopExperienceSettings = {
  stickyFiltersEnabled: boolean
  compareEnabled: boolean
  compareMaxItems: number
  sellerTrustEnabled: boolean
  hybridPaginationEnabled: boolean
  mobileLoadMoreStep: number
  searchHelperEnabled: boolean
  searchHelperTitle: LocalizedText
  emptyStateTitle: LocalizedText
  emptyStateDescription: LocalizedText
  emptyStateCta: LocalizedText
  searchHelperChips: SearchHelperChip[]
  topSellers: ShopRailConfig
  trendNow: ShopRailConfig
  newArrivals: ShopRailConfig
  recentlyViewed: ShopRailConfig
  priceDrops: ShopRailConfig
  topRated: ShopRailConfig
  alertsEnabled: boolean
  alertTitle: LocalizedText
  alertDescription: LocalizedText
  activeProductCardPresetId: string
  productCardPresets: ShopProductCardPreset[]
  productCard: ShopProductCardSettings
}

const localize = (az: string, ru: string, en: string): LocalizedText => ({ az, ru, en })

const createProductCardSettings = (overrides: Partial<ShopProductCardSettings> = {}): ShopProductCardSettings => ({
  layoutVariant: 'classic',
  density: 'comfortable',
  mobileDensity: 'compact',
  contentSpacing: 'tight',
  imageFit: 'contain',
  stylePreset: 'soft',
  cornerStyle: 'rounded',
  mediaRatio: 'portrait',
  titleLines: 2,
  mobileTitleLines: 1,
  mobileMetaMode: 'minimal',
  priceTone: 'brand',
  primaryCtaBg: '#FFD200',
  primaryCtaText: '#111827',
  secondaryCtaBg: '#FFFFFF',
  secondaryCtaText: '#374151',
  secondaryCtaBorder: '#E5E7EB',
  discountBadgeBg: '#2B3E95',
  discountBadgeText: '#FFFFFF',
  newBadgeBg: '#FFF7CC',
  newBadgeText: '#2B3E95',
  stockBadgeBg: '#ECFDF5',
  stockBadgeText: '#047857',
  stockBadgeBorder: '#A7F3D0',
  outOfStockBadgeBg: '#FEF2F2',
  outOfStockBadgeText: '#B91C1C',
  lowStockText: '#B45309',
  showDiscountBadge: true,
  showFeaturedBadge: true,
  showNewBadge: true,
  showBrandBadge: true,
  showViewCount: true,
  showSellerName: true,
  showSellerScore: true,
  showCategoryChip: true,
  showRating: true,
  showReviewCount: true,
  showSoldCount: true,
  showStockBadge: true,
  showLowStockText: true,
  showWishlistAction: true,
  showCompareAction: true,
  showQuickViewAction: true,
  showSecondaryCta: true,
  showMobileSellerName: false,
  showMobileRating: true,
  showMobileReviewCount: false,
  showMobileSoldCount: false,
  showMobileStockBadge: true,
  showMobileWishlistAction: true,
  showMobileQuickViewAction: true,
  ...overrides
})

const createProductCardPresets = (): ShopProductCardPreset[] => ([
  {
    id: 'classic-market',
    name: localize('Classic Market', 'Classic Market', 'Classic Market'),
    description: localize('Sarı CTA, dolu meta və klassik marketplace görünüşü.', 'Желтая CTA, полная мета и классический marketplace вид.', 'Yellow CTA, rich meta and classic marketplace look.'),
    settings: createProductCardSettings()
  },
  {
    id: 'compact-dark',
    name: localize('Compact Dark', 'Compact Dark', 'Compact Dark'),
    description: localize('Daha yığcam, tünd CTA və 1 sətirlik başlıq.', 'Более компактная, темная CTA и заголовок в 1 строку.', 'More compact with dark CTA and single-line title.'),
    settings: createProductCardSettings({
      density: 'compact',
      mobileDensity: 'compact',
      contentSpacing: 'tight',
      titleLines: 1,
      mobileTitleLines: 1,
      mobileMetaMode: 'minimal',
      stylePreset: 'outlined',
      cornerStyle: 'sharp',
      mediaRatio: 'square',
      priceTone: 'dark',
      primaryCtaBg: '#111827',
      primaryCtaText: '#FFFFFF',
      secondaryCtaBg: '#F3F4F6',
      secondaryCtaText: '#111827',
      secondaryCtaBorder: '#D1D5DB',
      showViewCount: false,
      showSellerScore: false,
      showCategoryChip: false,
      showReviewCount: false
    })
  },
  {
    id: 'soft-editorial',
    name: localize('Soft Editorial', 'Soft Editorial', 'Soft Editorial'),
    description: localize('Yumşaq künclər, açıq tonlar və vitrin üslublu düzülüş.', 'Мягкие углы, светлые тона и витринная подача.', 'Soft corners, airy tones and editorial merchandising feel.'),
    settings: createProductCardSettings({
      density: 'compact',
      mobileDensity: 'compact',
      contentSpacing: 'balanced',
      stylePreset: 'soft',
      cornerStyle: 'soft',
      mediaRatio: 'portrait',
      primaryCtaBg: '#EEF2FF',
      primaryCtaText: '#2B3E95',
      secondaryCtaBg: '#FFFFFF',
      secondaryCtaText: '#4B5563',
      secondaryCtaBorder: '#E5E7EB',
      showSoldCount: false
    })
  },
  {
    id: 'premium-luxe',
    name: localize('Premium Luxe', 'Premium Luxe', 'Premium Luxe'),
    description: localize('Daha premium kölgə, təmiz meta və güclü CTA ilə yeni nəsil məhsul kartı.', 'Премиальная тень, чистая мета и сильный CTA для карточки нового уровня.', 'A richer shadow, cleaner meta and stronger CTA for a next-level product card.'),
    settings: createProductCardSettings({
      layoutVariant: 'premium-luxe',
      density: 'comfortable',
      mobileDensity: 'compact',
      contentSpacing: 'balanced',
      imageFit: 'contain',
      stylePreset: 'outlined',
      cornerStyle: 'sharp',
      mediaRatio: 'portrait',
      titleLines: 2,
      mobileTitleLines: 1,
      mobileMetaMode: 'minimal',
      priceTone: 'dark',
      primaryCtaBg: '#f3c300',
      primaryCtaText: '#111827',
      secondaryCtaBg: '#FFFFFF',
      secondaryCtaText: '#111827',
      secondaryCtaBorder: '#E5E7EB',
      discountBadgeBg: '#2B3E95',
      discountBadgeText: '#FFFFFF',
      newBadgeBg: '#FFF7CC',
      newBadgeText: '#2B3E95',
      stockBadgeBg: '#ECFDF5',
      stockBadgeText: '#047857',
      stockBadgeBorder: '#A7F3D0',
      outOfStockBadgeBg: '#FEF2F2',
      outOfStockBadgeText: '#B91C1C',
      lowStockText: '#2B3E95',
      showBrandBadge: false,
      showViewCount: false,
      showSellerName: true,
      showSellerScore: true,
      showCategoryChip: false,
      showReviewCount: false,
      showSoldCount: false,
      showLowStockText: true,
      showMobileSellerName: false,
      showMobileRating: false,
      showMobileReviewCount: false,
      showMobileSoldCount: false,
      showMobileStockBadge: false,
      showMobileWishlistAction: true,
      showMobileQuickViewAction: false
    })
  }
])

export const defaultShopExperienceSettings = (): ShopExperienceSettings => ({
  stickyFiltersEnabled: true,
  compareEnabled: true,
  compareMaxItems: 4,
  sellerTrustEnabled: true,
  hybridPaginationEnabled: true,
  mobileLoadMoreStep: 8,
  searchHelperEnabled: true,
  searchHelperTitle: localize('Ağıllı axtarış istiqamətləri', 'Умные подсказки поиска', 'Smart search shortcuts'),
  emptyStateTitle: localize('Uyğun məhsul tapılmadı', 'Подходящих товаров не найдено', 'No matching products found'),
  emptyStateDescription: localize(
    'Filterləri sıfırlayın və ya alternativ kateqoriyalarla axtarışı genişləndirin.',
    'Сбросьте фильтры или расширьте поиск с помощью альтернативных категорий.',
    'Clear filters or broaden the search with alternative categories.'
  ),
  emptyStateCta: localize('Filterləri sıfırla', 'Сбросить фильтры', 'Clear filters'),
  searchHelperChips: [
    { id: 'premium', label: localize('Premium', 'Премиум', 'Premium'), query: 'premium' },
    { id: 'daily', label: localize('Gündəlik', 'На каждый день', 'Daily use'), query: 'gündəlik' },
    { id: 'gaming', label: localize('Oyun', 'Игры', 'Gaming'), query: 'oyun' },
    { id: 'budget', label: localize('Sərfəli', 'Выгодно', 'Budget'), query: 'sərfəli' }
  ],
  topSellers: {
    enabled: true,
    limit: 4,
    selectionMode: 'auto',
    manualProductIds: [],
    title: localize('Ən çox satılanlar', 'Лидеры продаж', 'Top sellers'),
    subtitle: localize('Satış göstəricilərinə görə önə çıxan məhsullar', 'Товары, которые лучше всего продаются', 'Products leading by sales')
  },
  trendNow: {
    enabled: true,
    limit: 4,
    selectionMode: 'auto',
    manualProductIds: [],
    title: localize('Bu həftə trend', 'Тренды недели', 'Trending this week'),
    subtitle: localize('Baxış, satış və endirim siqnallarına görə seçilən məhsullar', 'Товары, выбранные по просмотрам, продажам и скидкам', 'Products selected by view, sales and discount signals')
  },
  newArrivals: {
    enabled: true,
    limit: 4,
    selectionMode: 'auto',
    manualProductIds: [],
    title: localize('Yeni gələnlər', 'Новые поступления', 'New arrivals'),
    subtitle: localize('Son əlavə olunan məhsullar və yeni seçimlər', 'Последние добавленные товары', 'Freshly added products and new picks')
  },
  recentlyViewed: {
    enabled: true,
    limit: 4,
    selectionMode: 'auto',
    manualProductIds: [],
    title: localize('Baxdıqlarınız', 'Вы смотрели', 'Recently viewed'),
    subtitle: localize('Son baxdığınız məhsulları sürətlə davam etdirin', 'Быстро вернитесь к просмотренным товарам', 'Continue from the products you viewed')
  },
  priceDrops: {
    enabled: true,
    limit: 4,
    selectionMode: 'auto',
    manualProductIds: [],
    title: localize('Qiyməti düşənlər', 'Снижение цены', 'Price drops'),
    subtitle: localize('Endirimə düşən ən yaxşı seçimlər', 'Лучшие товары со сниженной ценой', 'Best picks currently discounted')
  },
  topRated: {
    enabled: true,
    limit: 4,
    selectionMode: 'auto',
    manualProductIds: [],
    title: localize('Ən yüksək qiymətləndirilənlər', 'Лучшие по рейтингу', 'Top rated'),
    subtitle: localize('Rəylərə görə ən çox bəyənilən məhsullar', 'Товары с лучшими оценками', 'Products customers rate the highest')
  },
  alertsEnabled: true,
  alertTitle: localize('Qiymət və stok bildirişi', 'Уведомление о цене и наличии', 'Price and stock alerts'),
  alertDescription: localize(
    'Məhsulun qiyməti dəyişəndə və ya stok qayıdanda xəbər alın.',
    'Получайте уведомление при изменении цены или возврате товара в наличие.',
    'Get notified when the price changes or the item is back in stock.'
  ),
  activeProductCardPresetId: 'classic-market',
  productCardPresets: createProductCardPresets(),
  productCard: createProductCardSettings()
})

export const useShopExperienceStore = defineStore('shopExperience', {
  state: () => ({
    config: defaultShopExperienceSettings(),
    hydrated: false
  }),
  actions: {
    setConfig(next: Partial<ShopExperienceSettings>) {
      this.config = {
        ...defaultShopExperienceSettings(),
        ...this.config,
        ...next
      }
      this.config.compareMaxItems = Math.min(4, Math.max(2, Number(this.config.compareMaxItems || 4)))
      this.hydrated = true
    },
    async fetchConfig() {
      const config = await $fetch<ShopExperienceSettings>('/api/shop-experience')
      this.setConfig(config)
    },
    async saveConfig(next?: Partial<ShopExperienceSettings>) {
      const payload = next ? { ...this.config, ...next } : this.config
      const saved = await $fetch<ShopExperienceSettings>('/api/shop-experience', {
        method: 'PUT',
        body: payload
      })
      this.setConfig(saved)
    }
  }
})
