<script setup lang="ts">
import { BadgeCheck, Check, ChevronDown, Eye, Filter, Grid, Heart, List, Scale, Search, ShoppingCart, Sparkles, Star, Truck, X } from 'lucide-vue-next'
import ShopCategorySidebar from '~/components/shop/CategorySidebar.vue'
import ShopRailSection from '~/components/shop/ShopRailSection.vue'
import { useBannerStore } from '~/stores/banners'
import { useCartStore } from '~/stores/cart'
import { useCategoryFilterStore } from '~/stores/categoryFilters'
import { useCategoryStore } from '~/stores/categories'
import { useCompareStore } from '~/stores/compare'
import { useProductStore } from '~/stores/products'
import { useSettingsStore } from '~/stores/settings'
import { useShopExperienceStore } from '~/stores/shopExperience'
import { useToastStore } from '~/stores/toast'
import { useWishlistStore } from '~/stores/wishlist'
import { fuzzyMatchScore, normalizeSearchText } from '~/utils/fuzzy-search'
import { buildProductHref } from '~/utils/product-route'
import { resolveShopViewMode } from '~/utils/shop-state'

type FilterChip = { id: string; label: string; type: 'search' | 'category' | 'brand' | 'price' | 'attr'; key?: string; value?: string }

const bannerStore = useBannerStore()
const cartStore = useCartStore()
const categoryFilterStore = useCategoryFilterStore()
const categoryStore = useCategoryStore()
const compareStore = useCompareStore()
const productStore = useProductStore()
const settingsStore = useSettingsStore()
const shopExperienceStore = useShopExperienceStore()
const toastStore = useToastStore()
const wishlistStore = useWishlistStore()
const { formatMoney } = useMoney()
const { t, lang } = useT()
const { nameOf } = useProductText()
const { profileFor } = useMobileDensity()
const route = useRoute()
const router = useRouter()
const requestFetch = process.server ? useRequestFetch() : $fetch

const quickViewProductId = ref<number | null>(null)
const isFilterOpen = ref(false)
const isMobile = ref(false)
const recentViewedIds = ref<number[]>([])
const shopMemoryKey = 'markett-shop-memory-v2'
const shopMemoryRestored = ref(false)
const routeSyncing = ref(false)
const { quickViewProductId: globalQuickViewId, openQuickView, closeQuickView } = useQuickView()
const renderTimestamp = useState('markett-render-timestamp', () => Date.now())
const clientReady = ref(false)
const mobileFilterSections = ref({
  categories: true,
  price: false,
  attributes: false,
  brands: false
})

const searchQuery = ref('')
const activeCategoryId = ref<number | null>(null)
const activeBrand = ref<string | null>(null)
const activeAttributes = ref<Record<string, string[]>>({})
const currentPage = ref(1)
const itemsPerPage = ref(16)
const mobileVisibleCount = ref(8)
const viewMode = ref<'grid' | 'list'>('grid')
const sortKey = ref<'popularity' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'>('popularity')
const desktopDraftMinPrice = ref(0)
const desktopDraftMaxPrice = ref(0)
const appliedMinPrice = ref(0)
const appliedMaxPrice = ref(0)
const priceInited = ref(false)
const mobileDraftCategoryId = ref<number | null>(null)
const mobileDraftBrand = ref<string | null>(null)
const mobileDraftAttributes = ref<Record<string, string[]>>({})
const mobileDraftMinPrice = ref(0)
const mobileDraftMaxPrice = ref(0)
let searchSyncTimer: ReturnType<typeof setTimeout> | null = null

const localize = (value: any) => String(value?.[lang.value as 'az' | 'ru' | 'en'] || value?.az || '').trim()
const normKey = (value: any) => String(value || '').trim().toLowerCase()
const normVal = (value: any) => String(value || '').trim()
const colorMap: Record<string, string> = { black: '#111827', white: '#ffffff', red: '#ef4444', blue: '#2563eb', green: '#22c55e', yellow: '#facc15', qara: '#111827', ağ: '#ffffff', qırmızı: '#ef4444', qirmizi: '#ef4444', mavi: '#2563eb', yaşıl: '#22c55e', yasil: '#22c55e', sarı: '#facc15', sari: '#facc15', белый: '#ffffff', черный: '#111827', красный: '#ef4444', синий: '#2563eb', зеленый: '#22c55e' }

const ensureStores = async () => {
  if (!productStore.hydrated || !productStore.products.length) {
    if (process.server) productStore.setProducts(await requestFetch('/api/products') as any)
    else await productStore.fetchProducts()
  }
  if (!bannerStore.hydrated || !bannerStore.banners.length) {
    if (process.server) bannerStore.setBanners(await requestFetch('/api/banners') as any)
    else await bannerStore.fetchBanners()
  }
  if (!categoryStore.hydrated || !categoryStore.categories.length) {
    if (process.server) categoryStore.setCategories(await requestFetch('/api/categories') as any)
    else await categoryStore.fetchCategories()
  }
  if (!categoryFilterStore.hydrated) {
    if (process.server) categoryFilterStore.setSchemas(await requestFetch('/api/category-filters') as any)
    else await categoryFilterStore.fetchSchemas()
  }
  if (!settingsStore.hydrated) {
    if (process.server) settingsStore.setAll(await requestFetch('/api/settings') as any)
    else await settingsStore.fetchSettings().catch(() => {})
  }
  if (!shopExperienceStore.hydrated) {
    if (process.server) shopExperienceStore.setConfig(await requestFetch('/api/shop-experience') as any)
    else await shopExperienceStore.fetchConfig()
  }
}

await ensureStores()

const { data: popularSearchesData } = await useFetch('/api/search/popular', { query: { limit: 6 }, default: () => [] })
const { data: sellerTrustData } = await useFetch('/api/homepage/seller-trust', { query: { limit: 12 }, default: () => [] })

const shopConfig = computed(() => shopExperienceStore.config)
const productCardConfig = computed(() => shopConfig.value.productCard)
const activeProducts = computed(() => productStore.products.filter((item: any) => !item?.status || item.status === 'Aktiv'))
const activeCategory = computed(() => categoryStore.categories.find((item) => item.id === activeCategoryId.value) || null)
const activeCategoryLabel = computed(() => activeCategory.value?.nameI18n?.[lang.value as 'az' | 'ru' | 'en'] || activeCategory.value?.nameI18n?.az || activeCategory.value?.slug || '')
const sellerTrustMap = computed(() => new Map((Array.isArray(sellerTrustData.value) ? sellerTrustData.value : []).map((item: any) => [Number(item.id || 0), item])))
const popularSearches = computed(() => Array.isArray(popularSearchesData.value) ? popularSearchesData.value.map((item) => String(item || '').trim()).filter(Boolean) : [])

const collectDescendants = (rootId: number) => {
  const ids = new Set<number>([rootId])
  let changed = true
  while (changed) {
    changed = false
    for (const category of categoryStore.categories) {
      if (category.parentId !== null && ids.has(category.parentId) && !ids.has(category.id)) {
        ids.add(category.id)
        changed = true
      }
    }
  }
  return ids
}

const categoryBaseProducts = computed(() => {
  const q = normalizeSearchText(String(searchQuery.value || ''))
  const activeIds = activeCategoryId.value ? collectDescendants(activeCategoryId.value) : null
  return activeProducts.value.filter((product: any) => {
    const pid = product?.categoryId === null || product?.categoryId === undefined ? null : Number(product.categoryId)
    const categoryOk = !activeIds || (pid !== null && activeIds.has(pid))
    const attrs = product?.attributes && typeof product.attributes === 'object'
      ? Object.entries(product.attributes).flatMap(([key, value]) => [String(key || ''), String(value || '')])
      : []
    const searchOk = !q || fuzzyMatchScore(q, [
      product.name,
      ...(product?.nameI18n ? Object.values(product.nameI18n) : []),
      product.category,
      product.description || '',
      ...(product?.descriptionI18n ? Object.values(product.descriptionI18n) : []),
      product.brand || '',
      product.productCode || '',
      product.sellerShopName || '',
      product.sellerName || '',
      ...(product.tags || []),
      ...(product.features || []),
      ...attrs
    ]) > 0
    return categoryOk && searchOk
  })
})

const categoryOnlyProducts = computed(() => {
  const activeIds = activeCategoryId.value ? collectDescendants(activeCategoryId.value) : null
  if (!activeIds) return activeProducts.value
  return activeProducts.value.filter((product: any) => activeIds.has(Number(product?.categoryId || 0)))
})

const priceBounds = computed(() => {
  const values = categoryBaseProducts.value.map((product: any) => Number(product?.price || 0)).filter((value) => Number.isFinite(value) && value >= 0)
  if (!values.length) return [0, 2500] as const
  return [Math.floor(Math.min(...values)), Math.ceil(Math.max(...values))] as const
})

watchEffect(() => {
  const [min, max] = priceBounds.value
  if (!priceInited.value) {
    desktopDraftMinPrice.value = min
    desktopDraftMaxPrice.value = max
    appliedMinPrice.value = min
    appliedMaxPrice.value = max
    mobileDraftMinPrice.value = min
    mobileDraftMaxPrice.value = max
    priceInited.value = true
    return
  }
  desktopDraftMinPrice.value = Math.min(Math.max(desktopDraftMinPrice.value, min), max)
  desktopDraftMaxPrice.value = Math.min(Math.max(desktopDraftMaxPrice.value, min), max)
  mobileDraftMinPrice.value = Math.min(Math.max(mobileDraftMinPrice.value, min), max)
  mobileDraftMaxPrice.value = Math.min(Math.max(mobileDraftMaxPrice.value, min), max)
  appliedMinPrice.value = Math.min(Math.max(appliedMinPrice.value, min), max)
  appliedMaxPrice.value = Math.min(Math.max(appliedMaxPrice.value, min), max)
})

const collectBrandsForCategory = (categoryId: number | null) => {
  if (!categoryId) return []
  const ids = collectDescendants(categoryId)
  const counts = new Map<string, number>()
  for (const product of activeProducts.value as any[]) {
    const pid = Number(product?.categoryId || 0)
    if (!ids.has(pid)) continue
    const explicit = String(product?.brand || '').trim()
    if (explicit) counts.set(explicit, (counts.get(explicit) || 0) + 1)
  }
  return Array.from(counts.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'az'))
}
const availableBrands = computed(() => collectBrandsForCategory(activeCategoryId.value))
const mobileAvailableBrands = computed(() => collectBrandsForCategory(mobileDraftCategoryId.value))
const showDesktopBrands = computed(() => Boolean(activeCategoryId.value) && availableBrands.value.length > 0)
const showMobileBrands = computed(() => Boolean(mobileDraftCategoryId.value) && mobileAvailableBrands.value.length > 0)

const availableAttributeGroups = computed(() => {
  if (!activeCategoryId.value) return []
  const schema = categoryFilterStore.getSchema(activeCategoryId.value)
  if (!schema?.groups?.length) return []
  return schema.groups.map((group) => {
    const key = normKey(group.key)
    const label = String(group.label || '').trim() || group.key
    const options = (group.options || []).map((option: any) => {
      const value = normVal(option)
      const count = categoryBaseProducts.value.filter((product: any) => {
        const attrs = product?.attributes
        if (!attrs || typeof attrs !== 'object') return false
        const found = Object.entries(attrs).find(([rawKey]) => normKey(rawKey) === key)
        return found ? normVal(found[1]).toLowerCase() === value.toLowerCase() : false
      }).length
      return count > 0 ? { value, count } : null
    }).filter(Boolean) as Array<{ value: string; count: number }>
    return { key, label, options, visual: ['color', 'rəng', 'reng', 'цвет', 'size', 'ölçü', 'размер', 'variant', 'вариант'].some((token) => `${key} ${normKey(label)}`.includes(token)) }
  }).filter((group) => group.options.length > 0)
})

const products = computed(() => {
  const filtered = categoryBaseProducts.value.filter((product: any) => {
    const price = Number(product?.price || 0)
    const priceOk = price >= appliedMinPrice.value && price <= appliedMaxPrice.value
    const brandOk = !activeBrand.value || normKey(product?.brand || '') === normKey(activeBrand.value)
    const attrsOk = Object.entries(activeAttributes.value).every(([key, selected]) => {
      if (!selected.length) return true
      const attrs = product?.attributes
      if (!attrs || typeof attrs !== 'object') return false
      const found = Object.entries(attrs).find(([rawKey]) => normKey(rawKey) === key)
      return found ? selected.some((value) => normVal(value).toLowerCase() === normVal(found[1]).toLowerCase()) : false
    })
    return priceOk && brandOk && attrsOk
  })
  const sorted = [...filtered]
  if (sortKey.value === 'price_asc') sorted.sort((a: any, b: any) => Number(a?.price || 0) - Number(b?.price || 0))
  else if (sortKey.value === 'price_desc') sorted.sort((a: any, b: any) => Number(b?.price || 0) - Number(a?.price || 0))
  else if (sortKey.value === 'name_asc') sorted.sort((a: any, b: any) => String(a?.name || '').localeCompare(String(b?.name || ''), 'az'))
  else if (sortKey.value === 'name_desc') sorted.sort((a: any, b: any) => String(b?.name || '').localeCompare(String(a?.name || ''), 'az'))
  else sorted.sort((a: any, b: any) => Number(b?.sold || 0) - Number(a?.sold || 0))
  return sorted
})

const totalPages = computed(() => Math.max(1, Math.ceil(products.value.length / itemsPerPage.value)))
const paginatedProducts = computed(() => products.value.slice((currentPage.value - 1) * itemsPerPage.value, currentPage.value * itemsPerPage.value))
const displayedProducts = computed(() => isMobile.value && shopConfig.value.hybridPaginationEnabled ? products.value.slice(0, mobileVisibleCount.value) : paginatedProducts.value)
const showingRange = computed(() => !products.value.length ? { start: 0, end: 0, total: 0 } : isMobile.value && shopConfig.value.hybridPaginationEnabled ? { start: 1, end: displayedProducts.value.length, total: products.value.length } : { start: (currentPage.value - 1) * itemsPerPage.value + 1, end: Math.min(products.value.length, (currentPage.value - 1) * itemsPerPage.value + displayedProducts.value.length), total: products.value.length })
const canLoadMoreMobile = computed(() => isMobile.value && shopConfig.value.hybridPaginationEnabled && displayedProducts.value.length < products.value.length)
const pageNumbers = computed(() => totalPages.value <= 7 ? Array.from({ length: totalPages.value }, (_, index) => index + 1) : Array.from(new Set([1, currentPage.value - 1, currentPage.value, currentPage.value + 1, totalPages.value])).filter((page) => page >= 1 && page <= totalPages.value))

const didYouMean = computed(() => {
  if (!settingsStore.settings.creativeSuite?.didYouMeanEnabled) return ''
  const q = normalizeSearchText(String(searchQuery.value || ''))
  if (!q) return ''
  const synonyms = Array.isArray(settingsStore.settings.creativeSuite?.searchSynonyms) ? settingsStore.settings.creativeSuite.searchSynonyms : []
  for (const item of synonyms) {
    const term = normalizeSearchText(String(item?.term || ''))
    const aliases = Array.isArray(item?.aliases) ? item.aliases.map((alias: any) => normalizeSearchText(String(alias || ''))).filter(Boolean) : []
    if (aliases.includes(q) && term) return String(item?.term || '').trim()
  }
  return ''
})

const searchHelperChips = computed(() => shopConfig.value.searchHelperEnabled ? shopConfig.value.searchHelperChips : [])
const resolveRailProducts = (railConfig: any, autoProducts: any[]) => {
  const manualIds = Array.isArray(railConfig?.manualProductIds) ? railConfig.manualProductIds.map((item: any) => Number(item)).filter((item: number) => Number.isFinite(item) && item > 0) : []
  if (railConfig?.selectionMode === 'manual' && manualIds.length) {
    return manualIds
      .map((id: number) => activeProducts.value.find((product: any) => Number(product?.id) === id))
      .filter(Boolean)
      .slice(0, Number(railConfig?.limit || 4))
  }
  return autoProducts.slice(0, Number(railConfig?.limit || 4))
}
const shopRails = computed(() => {
  const base = categoryOnlyProducts.value.length ? categoryOnlyProducts.value : activeProducts.value
  const topSellers = resolveRailProducts(shopConfig.value.topSellers, [...base].sort((a: any, b: any) => Number(b?.sold || 0) - Number(a?.sold || 0)))
  const trendNow = [...base]
    .sort((a: any, b: any) => {
      const score = (item: any) => (
        (Number(item?.viewCount || 0) * 3)
        + (Number(item?.sold || 0) * 5)
        + (Number(item?.reviewCount || 0) * 2)
        + (Number(item?.oldPrice || 0) > Number(item?.price || 0) ? 8 : 0)
        + (String(item?.discount || '').trim() ? 5 : 0)
      )
      return score(b) - score(a)
    })
  const resolvedTrendNow = resolveRailProducts(shopConfig.value.trendNow, trendNow)
  const newArrivals = resolveRailProducts(shopConfig.value.newArrivals, [...base].sort((a: any, b: any) => new Date(String(b?.createdAt || '')).getTime() - new Date(String(a?.createdAt || '')).getTime()))
  const priceDrops = resolveRailProducts(shopConfig.value.priceDrops, [...base].filter((item: any) => Number(item?.oldPrice || 0) > Number(item?.price || 0) || String(item?.discount || '').trim()))
  const topRated = resolveRailProducts(shopConfig.value.topRated, [...base].sort((a: any, b: any) => Number(b?.rating || 0) - Number(a?.rating || 0) || Number(b?.reviewCount || 0) - Number(a?.reviewCount || 0)))
  const recentlyViewed = resolveRailProducts(shopConfig.value.recentlyViewed, recentViewedIds.value.map((id) => activeProducts.value.find((product: any) => Number(product?.id) === Number(id))).filter(Boolean) as any[])
  return [
    { key: 'topSellers', enabled: shopConfig.value.topSellers.enabled, title: localize(shopConfig.value.topSellers.title) || String(t('top_sellers_short')), subtitle: localize(shopConfig.value.topSellers.subtitle), products: topSellers },
    { key: 'trendNow', enabled: shopConfig.value.trendNow.enabled, title: localize(shopConfig.value.trendNow.title) || String(t('trend_now_short')), subtitle: localize(shopConfig.value.trendNow.subtitle), products: resolvedTrendNow },
    { key: 'newArrivals', enabled: shopConfig.value.newArrivals.enabled, title: localize(shopConfig.value.newArrivals.title) || String(t('new_arrivals_short')), subtitle: localize(shopConfig.value.newArrivals.subtitle), products: newArrivals },
    { key: 'recentlyViewed', enabled: shopConfig.value.recentlyViewed.enabled, title: localize(shopConfig.value.recentlyViewed.title) || String(t('recently_viewed_short')), subtitle: localize(shopConfig.value.recentlyViewed.subtitle), products: recentlyViewed },
    { key: 'priceDrops', enabled: shopConfig.value.priceDrops.enabled, title: localize(shopConfig.value.priceDrops.title) || String(t('price_drops_short')), subtitle: localize(shopConfig.value.priceDrops.subtitle), products: priceDrops },
    { key: 'topRated', enabled: shopConfig.value.topRated.enabled, title: localize(shopConfig.value.topRated.title) || String(t('top_rated_short')), subtitle: localize(shopConfig.value.topRated.subtitle), products: topRated }
  ].filter((item) => item.enabled && item.products.length)
})

const alternativeCategories = computed(() => {
  const candidates = activeCategory.value?.parentId !== null
    ? categoryStore.categories.filter((item) => item.parentId === activeCategory.value?.parentId && item.id !== activeCategory.value?.id)
    : categoryStore.categories.filter((item) => item.parentId === null && item.id !== activeCategory.value?.id)
  const counts = new Map<number, number>()
  for (const product of activeProducts.value as any[]) counts.set(Number(product?.categoryId || 0), (counts.get(Number(product?.categoryId || 0)) || 0) + 1)
  return candidates.map((item) => ({ id: item.id, label: item.nameI18n?.[lang.value as 'az' | 'ru' | 'en'] || item.nameI18n?.az || item.slug, count: counts.get(item.id) || 0 })).filter((item) => item.count > 0).slice(0, 4)
})
const alternativeBrands = computed(() => availableBrands.value.filter((item) => item.name !== activeBrand.value).slice(0, 4))
const hasAttributeFilters = computed(() => Object.values(activeAttributes.value).some((items) => items.length))
const hasPriceFilter = computed(() => appliedMinPrice.value !== priceBounds.value[0] || appliedMaxPrice.value !== priceBounds.value[1])
const suppressShopRails = computed(() => Boolean(searchQuery.value.trim() || activeBrand.value || hasAttributeFilters.value || hasPriceFilter.value))
const activeFilterBarClass = computed(() => shopConfig.value.stickyFiltersEnabled
  ? 'mt-3 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 lg:sticky lg:top-24 lg:z-20 lg:flex-row lg:items-center lg:justify-between'
  : 'mt-3 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 lg:flex-row lg:items-center lg:justify-between')
const activeFilterChips = computed<FilterChip[]>(() => {
  const out: FilterChip[] = []
  if (searchQuery.value.trim()) out.push({ id: 'search', label: `${String(t('search_placeholder'))}: ${searchQuery.value}`, type: 'search' })
  if (activeCategoryLabel.value) out.push({ id: 'category', label: activeCategoryLabel.value, type: 'category' })
  if (activeBrand.value) out.push({ id: 'brand', label: activeBrand.value, type: 'brand' })
  if (appliedMinPrice.value !== priceBounds.value[0] || appliedMaxPrice.value !== priceBounds.value[1]) out.push({ id: 'price', label: `${formatMoney(appliedMinPrice.value)} - ${formatMoney(appliedMaxPrice.value)}`, type: 'price' })
  for (const [key, values] of Object.entries(activeAttributes.value)) for (const value of values) out.push({ id: `${key}-${value}`, label: value, type: 'attr', key, value })
  return out
})

const getClampedPriceRange = (minValue: number, maxValue: number) => {
  const minBound = priceBounds.value[0]
  const maxBound = priceBounds.value[1]
  return {
    min: Math.min(Math.max(Math.min(minValue, maxValue), minBound), maxBound),
    max: Math.min(Math.max(Math.max(minValue, maxValue), minBound), maxBound)
  }
}
const getPricePct = (minValue: number, maxValue: number, edge: 'left' | 'right') => {
  const { min, max } = getClampedPriceRange(minValue, maxValue)
  const current = edge === 'left' ? min : max
  return ((current - priceBounds.value[0]) / Math.max(1, priceBounds.value[1] - priceBounds.value[0])) * 100
}
const desktopPriceLeftPct = computed(() => getPricePct(desktopDraftMinPrice.value, desktopDraftMaxPrice.value, 'left'))
const desktopPriceRightPct = computed(() => getPricePct(desktopDraftMinPrice.value, desktopDraftMaxPrice.value, 'right'))
const mobilePriceLeftPct = computed(() => getPricePct(mobileDraftMinPrice.value, mobileDraftMaxPrice.value, 'left'))
const mobilePriceRightPct = computed(() => getPricePct(mobileDraftMinPrice.value, mobileDraftMaxPrice.value, 'right'))
const mobileDraftFilterCount = computed(() => {
  const priceChanged = mobileDraftMinPrice.value !== priceBounds.value[0] || mobileDraftMaxPrice.value !== priceBounds.value[1]
  return Number(Boolean(mobileDraftCategoryId.value))
    + Number(Boolean(mobileDraftBrand.value))
    + Object.values(mobileDraftAttributes.value || {}).reduce((sum, items) => sum + (Array.isArray(items) ? items.length : 0), 0)
    + Number(priceChanged)
})
const shopDensity = profileFor('shop')
const applyDesktopPriceFilter = () => {
  const { min, max } = getClampedPriceRange(desktopDraftMinPrice.value, desktopDraftMaxPrice.value)
  desktopDraftMinPrice.value = min
  desktopDraftMaxPrice.value = max
  appliedMinPrice.value = min
  appliedMaxPrice.value = max
  mobileDraftMinPrice.value = min
  mobileDraftMaxPrice.value = max
}
const formatSoldLabel = (value: unknown) => [Math.max(0, Math.floor(Number(value) || 0)), String(t('sold_unit')).trim(), String(t('sold_small')).trim()].filter(Boolean).join(' ')
const isStarActive = (rating: any, index: number) => index <= Math.round(Math.max(0, Math.min(5, Number(rating || 0))))
const discountPercent = (product: any) => {
  const oldPrice = Number(product?.oldPrice || 0)
  const price = Number(product?.price || 0)
  if (!oldPrice || oldPrice <= price) return 0
  return Math.max(0, Math.round(((oldPrice - price) / oldPrice) * 100))
}
const isNewArrivalProduct = (product: any) => {
  const createdAt = new Date(String(product?.createdAt || ''))
  if (Number.isNaN(createdAt.getTime())) return false
  return Number(renderTimestamp.value) - createdAt.getTime() <= 1000 * 60 * 60 * 24 * 30
}
const productImageFitClass = computed(() => productCardConfig.value.imageFit === 'cover' ? 'h-full w-full object-cover' : 'max-h-full max-w-full object-contain')
const quickView = (id: number) => { openQuickView(id) }
const toggleWishlist = (product: any) => wishlistStore.toggleWishlist(product)
const toggleCompare = (product: any) => {
  const result = compareStore.toggle(product, Number(shopConfig.value.compareMaxItems || 4))
  if (result.limitReached) toastStore.info(String(t('compare_limit_reached')))
}
const setCategory = (id: number | null) => {
  if (isMobile.value && isFilterOpen.value) {
    mobileDraftCategoryId.value = id
    return
  }
  activeCategoryId.value = id
  currentPage.value = 1
}
const toggleAttribute = (key: string, value: string) => {
  const normalizedKey = normKey(key)
  const normalizedValue = normVal(value)
  const current = activeAttributes.value[normalizedKey] || []
  activeAttributes.value = current.includes(normalizedValue) ? { ...activeAttributes.value, [normalizedKey]: current.filter((item) => item !== normalizedValue) } : { ...activeAttributes.value, [normalizedKey]: [...current, normalizedValue] }
}
const mobileToggleAttribute = (key: string, value: string) => {
  const normalizedKey = normKey(key)
  const normalizedValue = normVal(value)
  const current = mobileDraftAttributes.value[normalizedKey] || []
  mobileDraftAttributes.value = current.includes(normalizedValue) ? { ...mobileDraftAttributes.value, [normalizedKey]: current.filter((item) => item !== normalizedValue) } : { ...mobileDraftAttributes.value, [normalizedKey]: [...current, normalizedValue] }
}
const toggleMobileFilterSection = (section: keyof typeof mobileFilterSections.value) => {
  mobileFilterSections.value[section] = !mobileFilterSections.value[section]
}
const syncMobileDraftsFromActive = () => {
  mobileDraftCategoryId.value = activeCategoryId.value
  mobileDraftBrand.value = activeBrand.value
  mobileDraftAttributes.value = JSON.parse(JSON.stringify(activeAttributes.value || {}))
  mobileDraftMinPrice.value = appliedMinPrice.value
  mobileDraftMaxPrice.value = appliedMaxPrice.value
}
const clearAllFilters = () => {
  searchQuery.value = ''
  activeCategoryId.value = null
  activeBrand.value = null
  activeAttributes.value = {}
  sortKey.value = 'popularity'
  currentPage.value = 1
  desktopDraftMinPrice.value = priceBounds.value[0]
  desktopDraftMaxPrice.value = priceBounds.value[1]
  mobileDraftMinPrice.value = priceBounds.value[0]
  mobileDraftMaxPrice.value = priceBounds.value[1]
  appliedMinPrice.value = priceBounds.value[0]
  appliedMaxPrice.value = priceBounds.value[1]
  syncMobileDraftsFromActive()
}
const removeFilterChip = (chip: FilterChip) => {
  if (chip.type === 'search') searchQuery.value = ''
  else if (chip.type === 'category') activeCategoryId.value = null
  else if (chip.type === 'brand') activeBrand.value = null
  else if (chip.type === 'price') {
    desktopDraftMinPrice.value = priceBounds.value[0]
    desktopDraftMaxPrice.value = priceBounds.value[1]
    mobileDraftMinPrice.value = priceBounds.value[0]
    mobileDraftMaxPrice.value = priceBounds.value[1]
    appliedMinPrice.value = priceBounds.value[0]
    appliedMaxPrice.value = priceBounds.value[1]
  } else if (chip.type === 'attr' && chip.key && chip.value) {
    activeAttributes.value = { ...activeAttributes.value, [chip.key]: (activeAttributes.value[chip.key] || []).filter((item) => item !== chip.value) }
  }
}

const applyMobileFilters = () => {
  activeCategoryId.value = mobileDraftCategoryId.value
  activeBrand.value = mobileDraftBrand.value
  activeAttributes.value = JSON.parse(JSON.stringify(mobileDraftAttributes.value || {}))
  const { min, max } = getClampedPriceRange(mobileDraftMinPrice.value, mobileDraftMaxPrice.value)
  mobileDraftMinPrice.value = min
  mobileDraftMaxPrice.value = max
  appliedMinPrice.value = min
  appliedMaxPrice.value = max
  desktopDraftMinPrice.value = min
  desktopDraftMaxPrice.value = max
  isFilterOpen.value = false
}
const resetMobileDrafts = () => {
  mobileDraftCategoryId.value = null
  mobileDraftBrand.value = null
  mobileDraftAttributes.value = {}
  mobileDraftMinPrice.value = priceBounds.value[0]
  mobileDraftMaxPrice.value = priceBounds.value[1]
}

const serializeAttributes = (value: Record<string, string[]>) => Object.entries(value || {}).filter(([, items]) => items.length).map(([key, items]) => `${encodeURIComponent(key)}:${items.map((item) => encodeURIComponent(item)).join('~')}`).join('|')
const deserializeAttributes = (value: string) => String(value || '').split('|').filter(Boolean).reduce((acc, entry) => {
  const [rawKey, rawValues] = entry.split(':')
  const key = decodeURIComponent(String(rawKey || ''))
  const values = String(rawValues || '').split('~').map((item) => decodeURIComponent(item)).filter(Boolean)
  if (key && values.length) acc[key] = values
  return acc
}, {} as Record<string, string[]>)
const persistShopMemory = () => {
  if (!process.client) return
  const payload = JSON.stringify({ q: searchQuery.value || '', categoryId: activeCategoryId.value ? String(activeCategoryId.value) : '', brand: activeBrand.value || '', attrs: serializeAttributes(activeAttributes.value), minPrice: hasPriceFilter.value ? String(appliedMinPrice.value) : '', maxPrice: hasPriceFilter.value ? String(appliedMaxPrice.value) : '', sort: sortKey.value, page: currentPage.value > 1 ? String(currentPage.value) : '', view: viewMode.value })
  localStorage.setItem(shopMemoryKey, payload)
  sessionStorage.setItem(shopMemoryKey, payload)
}
const restoreShopMemory = () => {
  if (!process.client || shopMemoryRestored.value || Object.keys(route.query || {}).length) return
  shopMemoryRestored.value = true
  try {
    const raw = localStorage.getItem(shopMemoryKey) || sessionStorage.getItem(shopMemoryKey)
    const parsed = raw ? JSON.parse(raw) : null
    if (!parsed || typeof parsed !== 'object') return
    const query: Record<string, string> = {}
    for (const [key, value] of Object.entries(parsed)) if (typeof value === 'string' && value.trim()) query[key] = value
    if (Object.keys(query).length) navigateTo({ path: route.path, query }, { replace: true })
  } catch {}
}
const buildShopQuery = () => {
  const query: Record<string, string> = {}
  if (searchQuery.value.trim()) query.q = searchQuery.value.trim()
  if (activeCategoryId.value) query.categoryId = String(activeCategoryId.value)
  if (activeBrand.value) query.brand = activeBrand.value
  const attrs = serializeAttributes(activeAttributes.value)
  if (attrs) query.attrs = attrs
  if (hasPriceFilter.value) query.minPrice = String(appliedMinPrice.value)
  if (hasPriceFilter.value) query.maxPrice = String(appliedMaxPrice.value)
  if (sortKey.value !== 'popularity') query.sort = sortKey.value
  if (viewMode.value !== 'grid') query.view = viewMode.value
  if (currentPage.value > 1) query.page = String(currentPage.value)
  return query
}
const syncShopQuery = () => {
  if (routeSyncing.value) return
  const query = buildShopQuery()
  const currentQuery = Object.fromEntries(Object.entries(route.query || {}).flatMap(([key, value]) => typeof value === 'string' && value.trim() ? [[key, value]] : []))
  if (JSON.stringify(query) === JSON.stringify(currentQuery)) return
  routeSyncing.value = true
  router.replace({ path: route.path, query }).finally(() => { routeSyncing.value = false })
}
const scheduleSearchQuerySync = () => {
  if (!process.client) {
    syncShopQuery()
    return
  }
  if (searchSyncTimer) clearTimeout(searchSyncTimer)
  searchSyncTimer = setTimeout(() => {
    searchSyncTimer = null
    syncShopQuery()
  }, 180)
}

watch(() => route.query, () => {
  routeSyncing.value = true
  searchQuery.value = typeof route.query.q === 'string' ? route.query.q : ''
  activeCategoryId.value = typeof route.query.categoryId === 'string' ? Number(route.query.categoryId) : null
  activeBrand.value = typeof route.query.brand === 'string' ? route.query.brand : null
  activeAttributes.value = typeof route.query.attrs === 'string' ? deserializeAttributes(route.query.attrs) : {}
  appliedMinPrice.value = typeof route.query.minPrice === 'string' ? Math.max(0, Number(route.query.minPrice || 0)) : priceBounds.value[0]
  appliedMaxPrice.value = typeof route.query.maxPrice === 'string' ? Math.max(0, Number(route.query.maxPrice || 0)) : priceBounds.value[1]
  desktopDraftMinPrice.value = appliedMinPrice.value
  desktopDraftMaxPrice.value = appliedMaxPrice.value
  mobileDraftMinPrice.value = appliedMinPrice.value
  mobileDraftMaxPrice.value = appliedMaxPrice.value
  sortKey.value = ['popularity', 'price_asc', 'price_desc', 'name_asc', 'name_desc'].includes(String(route.query.sort || '')) ? route.query.sort as any : 'popularity'
  viewMode.value = resolveShopViewMode(typeof route.query.view === 'string' ? route.query.view : '')
  currentPage.value = Math.max(1, Math.floor(Number(route.query.page) || 1))
  routeSyncing.value = false
}, { immediate: true })

watch(searchQuery, () => {
  currentPage.value = 1
  mobileVisibleCount.value = Math.max(4, Number(shopConfig.value.mobileLoadMoreStep || 8))
  scheduleSearchQuerySync()
})
watch([activeCategoryId, activeBrand, () => JSON.stringify(activeAttributes.value), appliedMinPrice, appliedMaxPrice, sortKey], () => {
  currentPage.value = 1
  mobileVisibleCount.value = Math.max(4, Number(shopConfig.value.mobileLoadMoreStep || 8))
  syncShopQuery()
})
watch(currentPage, syncShopQuery)
watch(viewMode, syncShopQuery)
watch([searchQuery, activeCategoryId, activeBrand, () => JSON.stringify(activeAttributes.value), appliedMinPrice, appliedMaxPrice, sortKey, currentPage, viewMode], persistShopMemory)
watch(isFilterOpen, (open) => {
  if (open) {
    syncMobileDraftsFromActive()
  }
})

watch([activeCategoryId, availableBrands], ([categoryId, brands]) => {
  if (!categoryId) {
    activeBrand.value = null
    return
  }
  if (activeBrand.value && !brands.some((item) => normKey(item.name) === normKey(activeBrand.value))) {
    activeBrand.value = null
  }
})

watch([mobileDraftCategoryId, mobileAvailableBrands], ([categoryId, brands]) => {
  if (!categoryId) {
    mobileDraftBrand.value = null
    return
  }
  if (mobileDraftBrand.value && !brands.some((item) => normKey(item.name) === normKey(mobileDraftBrand.value))) {
    mobileDraftBrand.value = null
  }
})

const updateViewport = () => {
  if (!process.client) return
  isMobile.value = window.matchMedia('(max-width: 639px)').matches
  itemsPerPage.value = isMobile.value ? 24 : 16
}
const loadRecentlyViewed = () => {
  if (!process.client) return
  try {
    const raw = localStorage.getItem('recentlyViewedProductIds')
    const parsed = raw ? JSON.parse(raw) : []
    recentViewedIds.value = Array.isArray(parsed) ? parsed.map((item) => Number(item)).filter((item) => Number.isFinite(item) && item > 0) : []
  } catch {
    recentViewedIds.value = []
  }
}

if (process.client) {
  onMounted(() => {
    clientReady.value = true
    compareStore.hydrate()
    updateViewport()
    restoreShopMemory()
    loadRecentlyViewed()
    window.addEventListener('resize', updateViewport, { passive: true })
  })
  onUnmounted(() => {
    if (searchSyncTimer) clearTimeout(searchSyncTimer)
    window.removeEventListener('resize', updateViewport)
  })
}

const shopBanner = computed(() => bannerStore.banners.find((banner: any) => banner.status === 'Aktiv' && banner.position === 'Shop') || null)
const localizedBannerTitle = (banner: any) => String(banner?.titleI18n?.[lang.value as 'az' | 'ru' | 'en'] || banner?.titleI18n?.az || banner?.title || '').trim()
const localizedBannerSubtitle = (banner: any) => String(banner?.subtitleI18n?.[lang.value as 'az' | 'ru' | 'en'] || banner?.subtitleI18n?.az || banner?.subtitle || '').trim()
const localizedBannerCta = (banner: any) => String(banner?.ctaTextI18n?.[lang.value as 'az' | 'ru' | 'en'] || banner?.ctaTextI18n?.az || banner?.ctaText || t('shop_banner_cta')).trim()

useSiteSeo({
  title: computed(() => activeCategoryLabel.value ? `${activeCategoryLabel.value} | ${String(t('nav_shop'))}` : searchQuery.value.trim() ? `${searchQuery.value.trim()} | ${String(t('nav_shop'))}` : String(t('nav_shop'))),
  description: computed(() => {
    const topBrands = availableBrands.value.slice(0, 3).map((item) => item.name).join(', ')
    if (activeCategoryLabel.value) {
      if (lang.value === 'ru') return `${activeCategoryLabel.value}: ${products.value.length} товаров, умные фильтры, рекомендации и бренды ${topBrands || 'магазина'}.`
      if (lang.value === 'en') return `${activeCategoryLabel.value} with ${products.value.length} products, smart filters, related rails and brands like ${topBrands || 'our catalog'}.`
      return `${activeCategoryLabel.value} kateqoriyasında ${products.value.length} məhsul, ağıllı filtrlər, merchandising rəfləri və ${topBrands || 'seçilmiş brandlər'} yer alır.`
    }
    if (searchQuery.value.trim()) {
      if (lang.value === 'ru') return `Результаты по запросу “${searchQuery.value.trim()}” с фильтрами, подсказками и связанными подборками.`
      if (lang.value === 'en') return `Results for “${searchQuery.value.trim()}” with filters, helper suggestions and curated rails.`
      return `“${searchQuery.value.trim()}” sorğusu üçün filtr, köməkçi təkliflər və uyğun vitrin blokları göstərilir.`
    }
    if (lang.value === 'ru') return 'Магазин Novruzmarket с категориями, брендами, сравнением, умными фильтрами и товарными подборками.'
    if (lang.value === 'en') return 'Novruzmarket shop with categories, brands, compare, smart filters and curated product rails.'
    return 'Novruzmarket mağazasında kateqoriyalar, brandlər, müqayisə, ağıllı filtrlər və seçilmiş məhsul rəfləri.'
  }),
  path: computed(() => route.fullPath)
})
</script>

<template>
  <div :class="['space-y-6', `shop-density-${shopDensity}`]">
    <div v-if="clientReady && shopConfig.compareEnabled && compareStore.items.length" class="sticky top-4 z-40 rounded-[2rem] border border-blue-100 bg-white/95 px-5 py-4 shadow-lg backdrop-blur">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="text-sm font-extrabold text-gray-900">{{ t('compare_page_title') }}</div>
          <div class="mt-1 text-sm font-medium text-gray-500">{{ t('selected_short') }}: {{ compareStore.items.length }}/{{ shopConfig.compareMaxItems }}</div>
        </div>
        <div class="flex items-center gap-3">
          <NuxtLink to="/compare" class="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">
            <Scale class="h-4 w-4" />
            {{ t('compare_now') }}
          </NuxtLink>
          <button type="button" class="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50" @click="compareStore.clear()">{{ t('clear_compare') }}</button>
        </div>
      </div>
    </div>

    <div v-if="shopBanner" class="relative overflow-hidden rounded-[2.25rem] border border-gray-100 bg-gray-900 shadow-sm">
      <img :src="shopBanner.image" :alt="localizedBannerTitle(shopBanner)" class="h-56 w-full object-cover opacity-70 md:h-72" />
      <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent"></div>
      <div class="absolute inset-0 flex items-center p-8 md:p-10">
        <div class="max-w-2xl">
          <div class="text-xs font-extrabold uppercase tracking-[0.25em] text-yellow-300">{{ localizedBannerTitle(shopBanner) }}</div>
          <div class="mt-3 text-2xl font-extrabold leading-tight text-white md:text-4xl">{{ localizedBannerSubtitle(shopBanner) }}</div>
          <button type="button" class="mt-6 rounded-2xl px-7 py-3 text-sm font-extrabold" :style="{ backgroundColor: shopBanner.ctaBg || '#FACC15', color: shopBanner.ctaTextColor || '#111827' }" @click="shopBanner.link && navigateTo(shopBanner.link)">{{ localizedBannerCta(shopBanner) }}</button>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-6 lg:flex-row lg:gap-10">
      <aside class="hidden lg:block lg:w-[320px] space-y-6">
        <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div class="mb-5 border-b border-gray-100 pb-4 text-lg font-extrabold text-gray-900">{{ t('categories') }}</div>
          <div class="relative z-30">
            <ShopCategorySidebar :categories="categoryStore.categories" :products="activeProducts" :active-category-id="activeCategoryId" mode="flyout" @select="setCategory" />
          </div>
        </div>
        <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div class="mb-5 border-b border-gray-100 pb-4 text-lg font-extrabold text-gray-900">{{ t('price_range') }}</div>
          <div class="space-y-5">
            <div class="grid grid-cols-2 gap-3">
              <label class="space-y-2"><div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">{{ t('min_label') }}</div><input v-model.number="desktopDraftMinPrice" type="number" :min="priceBounds[0]" :max="priceBounds[1]" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-600 focus:bg-white" /></label>
              <label class="space-y-2"><div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">{{ t('max_label') }}</div><input v-model.number="desktopDraftMaxPrice" type="number" :min="priceBounds[0]" :max="priceBounds[1]" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-600 focus:bg-white" /></label>
            </div>
            <div class="relative h-2 rounded-full bg-gray-100">
              <div class="absolute h-2 rounded-full bg-blue-600" :style="{ left: `${desktopPriceLeftPct}%`, width: `${Math.max(0, desktopPriceRightPct - desktopPriceLeftPct)}%` }"></div>
              <input v-model.number="desktopDraftMinPrice" type="range" :min="priceBounds[0]" :max="priceBounds[1]" class="absolute inset-0 h-2 w-full appearance-none bg-transparent accent-blue-600" />
              <input v-model.number="desktopDraftMaxPrice" type="range" :min="priceBounds[0]" :max="priceBounds[1]" class="absolute inset-0 h-2 w-full appearance-none bg-transparent accent-blue-600" />
            </div>
            <div class="flex items-center justify-between text-sm font-bold text-gray-700"><span>{{ formatMoney(Math.min(desktopDraftMinPrice, desktopDraftMaxPrice)) }}</span><span>{{ formatMoney(Math.max(desktopDraftMinPrice, desktopDraftMaxPrice)) }}</span></div>
            <button type="button" class="w-full rounded-2xl bg-gray-900 py-3 text-sm font-extrabold text-white hover:bg-black" @click="applyDesktopPriceFilter">{{ t('filter') }}</button>
          </div>
        </div>
        <div v-if="availableAttributeGroups.length" class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div class="mb-5 border-b border-gray-100 pb-4 text-lg font-extrabold text-gray-900">{{ t('attributes') }}</div>
          <div class="space-y-6">
            <div v-for="group in availableAttributeGroups" :key="group.key" class="space-y-3">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">{{ group.label }}</div>
              <div class="flex flex-wrap gap-2">
                <button v-for="option in group.options" :key="option.value" type="button" :class="['inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold transition-all', (activeAttributes[group.key] || []).includes(option.value) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:text-blue-700']" @click="toggleAttribute(group.key, option.value)">
                  <span v-if="group.visual && colorMap[normKey(option.value)]" class="h-4 w-4 rounded-full border border-gray-200" :style="{ backgroundColor: colorMap[normKey(option.value)] }"></span>
                  <span>{{ option.value }}</span>
                  <span class="text-[11px] text-gray-400">({{ option.count }})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="showDesktopBrands" class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div class="mb-5 text-lg font-extrabold text-gray-900">{{ t('brands') }}</div>
          <div class="space-y-2.5">
            <button
              v-for="brand in availableBrands"
              :key="brand.name"
              type="button"
              :class="[
                'flex w-full items-center gap-3 rounded-xl px-1 py-1 text-left text-sm font-extrabold transition-all',
                activeBrand === brand.name
                  ? 'text-blue-700'
                  : 'text-gray-700 hover:text-blue-700'
              ]"
              @click="activeBrand = activeBrand === brand.name ? null : brand.name"
            >
              <span :class="[
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border transition-all',
                activeBrand === brand.name
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-transparent'
              ]">
                <Check class="h-3.5 w-3.5" />
              </span>
              {{ brand.name }}
            </button>
          </div>
        </div>
      </aside>

      <div class="min-w-0 flex-1 space-y-6">
        <div v-if="activeCategoryLabel" class="rounded-[2rem] border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-6 shadow-sm">
          <div class="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-600">{{ t('category_landing') }}</div>
          <div class="mt-2 text-3xl font-extrabold text-gray-900">{{ activeCategoryLabel }}</div>
          <div class="mt-2 max-w-3xl text-sm font-medium text-gray-500">{{ t('category_landing_subtitle') }}</div>
        </div>

        <div v-if="shopConfig.searchHelperEnabled || popularSearches.length || didYouMean" class="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm">
          <div class="text-sm font-extrabold uppercase tracking-[0.18em] text-blue-600">{{ localize(shopConfig.searchHelperTitle) }}</div>
          <div v-if="didYouMean" class="mt-3 text-sm font-medium text-amber-700">{{ t('did_you_mean') }}: <button type="button" class="font-extrabold underline" @click="searchQuery = didYouMean">{{ didYouMean }}</button></div>
          <div class="mt-4 flex flex-wrap gap-2">
            <button v-for="chip in searchHelperChips" :key="chip.id" type="button" class="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-bold text-gray-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700" @click="searchQuery = chip.query">{{ chip.label?.[lang] || chip.label?.az || chip.query }}</button>
          </div>
          <div v-if="popularSearches.length" class="mt-4 flex flex-wrap gap-2">
            <span class="text-sm font-bold text-gray-400">{{ t('popular_searches_short') }}:</span>
            <button v-for="item in popularSearches" :key="item" type="button" class="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700" @click="searchQuery = item">{{ item }}</button>
          </div>
        </div>

        <div class="rounded-[2rem] border border-gray-100 bg-white p-4 shadow-sm">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex items-center gap-2">
              <button type="button" class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition-all" :class="viewMode === 'grid' ? 'border-yellow-300 text-yellow-600' : 'border-gray-200 text-gray-400 hover:text-gray-700'" @click="viewMode = 'grid'"><Grid class="h-5 w-5" /></button>
              <button type="button" class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition-all" :class="viewMode === 'list' ? 'border-yellow-300 text-yellow-600' : 'border-gray-200 text-gray-400 hover:text-gray-700'" @click="viewMode = 'list'"><List class="h-5 w-5" /></button>
              <button type="button" class="inline-flex h-11 items-center justify-center rounded-2xl border border-gray-200 px-4 text-sm font-extrabold text-gray-800 lg:hidden" @click="isFilterOpen = true"><Filter class="mr-2 h-4 w-4" />{{ t('filters') }}</button>
            </div>
            <div class="text-sm font-medium text-gray-600">{{ t('showing') }} {{ showingRange.start }}-{{ showingRange.end }} {{ t('of') }} {{ showingRange.total }} {{ t('results') }}</div>
            <select v-model="sortKey" class="h-11 min-w-[200px] rounded-2xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 outline-none">
              <option value="popularity">{{ t('sort_popularity') }}</option>
              <option value="price_asc">{{ t('sort_price_asc') }}</option>
              <option value="price_desc">{{ t('sort_price_desc') }}</option>
              <option value="name_asc">{{ t('sort_name_asc') }}</option>
              <option value="name_desc">{{ t('sort_name_desc') }}</option>
            </select>
          </div>
          <div class="mt-3 flex items-center gap-3">
            <div class="flex h-11 flex-1 items-center rounded-2xl border border-gray-200 bg-white px-4">
              <Search class="mr-3 h-4 w-4 text-gray-400" />
              <input v-model="searchQuery" type="text" :placeholder="t('search_placeholder')" class="w-full bg-transparent text-sm outline-none" />
            </div>
          </div>
          <div v-if="activeFilterChips.length" :class="activeFilterBarClass">
            <div class="flex flex-wrap items-center gap-2">
              <button v-for="chip in activeFilterChips" :key="chip.id" type="button" class="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-gray-700 border border-gray-200 hover:bg-gray-100" @click="removeFilterChip(chip)">
                {{ chip.label }}
                <X class="h-3.5 w-3.5" />
              </button>
            </div>
            <button type="button" class="self-start rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 lg:self-auto" @click="clearAllFilters">{{ t('clear_filters') }}</button>
          </div>
        </div>

        <ClientOnly>
          <template #fallback>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div v-for="index in 3" :key="`trust-skeleton-${index}`" class="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm">
                <div class="h-4 w-24 animate-pulse rounded bg-gray-100"></div>
                <div class="mt-4 h-8 w-16 animate-pulse rounded bg-gray-100"></div>
                <div class="mt-3 h-5 w-32 animate-pulse rounded bg-gray-100"></div>
                <div class="mt-4 h-4 w-full animate-pulse rounded bg-gray-100"></div>
                <div class="mt-2 h-4 w-2/3 animate-pulse rounded bg-gray-100"></div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-px bg-gray-200 xl:grid-cols-4">
              <div v-for="index in 8" :key="`shop-fallback-${index}`" class="bg-white p-4">
                <div class="aspect-[4/5] animate-pulse rounded-[1.5rem] bg-gray-100"></div>
                <div class="mt-4 h-4 animate-pulse rounded bg-gray-100"></div>
                <div class="mt-2 h-4 w-2/3 animate-pulse rounded bg-gray-100"></div>
                <div class="mt-4 h-10 animate-pulse rounded-2xl bg-gray-100"></div>
              </div>
            </div>
          </template>

          <div v-if="shopConfig.sellerTrustEnabled && Array.isArray(sellerTrustData) && sellerTrustData.length" class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div v-for="seller in sellerTrustData.slice(0, 3)" :key="seller.id" class="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm">
              <div class="flex items-center justify-between">
                <div class="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-600">{{ t('trust_score') }}</div>
                <span class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-extrabold text-emerald-700"><BadgeCheck class="h-3.5 w-3.5" />{{ seller.verifiedStatus === 'Təsdiqləndi' ? t('verified') : t('seller_role') }}</span>
              </div>
              <div class="mt-3 text-3xl font-extrabold text-gray-900">{{ seller.score }}</div>
              <div class="mt-2 text-lg font-extrabold text-gray-900">{{ seller.shopName }}</div>
              <div class="mt-4 flex items-center justify-between text-sm font-medium text-gray-600"><span>{{ t('orders_label') }}</span><span class="font-extrabold text-gray-900">{{ seller.orderCount }}</span></div>
              <div class="mt-2 flex items-center justify-between text-sm font-medium text-gray-600"><span>{{ t('rating_label') }}</span><span class="font-extrabold text-gray-900">{{ seller.ratingAvg }}</span></div>
            </div>
          </div>

          <div v-if="!products.length" class="rounded-[2rem] border border-dashed border-gray-200 bg-white p-10 text-center shadow-sm">
          <Sparkles class="mx-auto mb-6 h-14 w-14 text-gray-300" />
          <div class="text-2xl font-extrabold text-gray-900">{{ localize(shopConfig.emptyStateTitle) }}</div>
          <p class="mx-auto mt-3 max-w-2xl text-sm font-medium text-gray-500">{{ localize(shopConfig.emptyStateDescription) }}</p>
          <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button type="button" class="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700" @click="clearAllFilters">{{ localize(shopConfig.emptyStateCta) || t('clear_filters') }}</button>
            <button v-if="didYouMean" type="button" class="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50" @click="searchQuery = didYouMean">{{ t('did_you_mean') }}: {{ didYouMean }}</button>
          </div>
          <div v-if="alternativeCategories.length || alternativeBrands.length || popularSearches.length" class="mt-8 space-y-4">
            <div class="text-sm font-extrabold text-gray-900">{{ t('no_results_suggestions') }}</div>
            <div v-if="alternativeCategories.length" class="flex flex-wrap justify-center gap-2">
              <button v-for="item in alternativeCategories" :key="item.id" type="button" class="rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700" @click="setCategory(item.id)">{{ item.label }}</button>
            </div>
            <div v-if="alternativeBrands.length" class="flex flex-wrap justify-center gap-2">
              <button v-for="item in alternativeBrands" :key="item.name" type="button" class="rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700" @click="activeBrand = item.name">{{ item.name }}</button>
            </div>
            <div v-if="popularSearches.length" class="flex flex-wrap justify-center gap-2">
              <button v-for="item in popularSearches" :key="`empty-${item}`" type="button" class="rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700" @click="searchQuery = item">{{ item }}</button>
            </div>
          </div>
          </div>

          <div v-else class="space-y-6">
          <div v-if="!clientReady" class="grid grid-cols-2 gap-px bg-gray-200 xl:grid-cols-4">
            <div v-for="index in 8" :key="`shop-skeleton-${index}`" class="bg-white p-4">
              <div class="aspect-[4/5] animate-pulse rounded-[1.5rem] bg-gray-100"></div>
              <div class="mt-4 h-4 animate-pulse rounded bg-gray-100"></div>
              <div class="mt-2 h-4 w-2/3 animate-pulse rounded bg-gray-100"></div>
              <div class="mt-4 h-10 animate-pulse rounded-2xl bg-gray-100"></div>
            </div>
          </div>
          <div v-else-if="viewMode === 'grid'" class="grid grid-cols-2 gap-px bg-gray-200 xl:grid-cols-4">
            <ProductCard
              v-for="product in displayedProducts"
              :key="product.id"
              :product="product"
              :compare-enabled="shopConfig.compareEnabled"
              :product-card-settings="productCardConfig"
            />
          </div>
          <div v-else class="space-y-4">
            <article v-for="product in displayedProducts" :key="product.id" :class="['group overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm', productCardConfig.density === 'compact' ? 'p-4' : 'p-5']">
              <div class="flex flex-col gap-5 md:flex-row md:items-center">
                <div class="relative md:w-60 shrink-0">
                  <NuxtLink :to="buildProductHref(product)" class="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[1.5rem] bg-gray-50" :class="productCardConfig.density === 'compact' ? 'p-4' : 'p-5'">
                    <img :src="product.image" :alt="nameOf(product)" :class="[productImageFitClass, 'transition-transform duration-500 ease-out group-hover:scale-[1.1]']" />
                    <div class="absolute left-3 top-3 flex flex-col gap-2">
                      <span v-if="productCardConfig.showDiscountBadge && (product.discount || discountPercent(product))" class="rounded-full bg-[color:var(--color-primary,#2B3E95)] px-3 py-1 text-[10px] font-extrabold text-white">{{ product.discount || `-${discountPercent(product)}%` }}</span>
                      <span v-if="productCardConfig.showFeaturedBadge && product.featuredStatus === 'Aktiv'" class="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-extrabold text-amber-700">{{ product.featuredBadgeText || 'PRO' }}</span>
                      <span v-else-if="productCardConfig.showNewBadge && isNewArrivalProduct(product)" class="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-extrabold text-emerald-700">{{ t('new_badge') }}</span>
                      <span v-if="Number(product.stock || 0) <= 0" class="rounded-full bg-red-600 px-3 py-1 text-[10px] font-extrabold text-white">{{ t('out_of_stock') }}</span>
                    </div>
                  </NuxtLink>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <div v-if="productCardConfig.showSellerName && (product.sellerShopName || product.sellerName)" class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-600">{{ product.sellerShopName || product.sellerName }}</div>
                    <span v-if="shopConfig.sellerTrustEnabled && productCardConfig.showSellerScore && sellerTrustMap.get(Number(product.sellerId || 0))" class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700"><BadgeCheck class="h-3.5 w-3.5" />{{ sellerTrustMap.get(Number(product.sellerId || 0)).score }}</span>
                  </div>
                  <NuxtLink :to="buildProductHref(product)" class="mt-2 block text-lg font-extrabold text-gray-900 transition-colors hover:text-[color:var(--color-primary,#2B3E95)]">{{ nameOf(product) }}</NuxtLink>
                  <div class="mt-3 flex items-center gap-2">
                    <div class="flex items-center gap-0.5">
                      <Star v-for="i in 5" :key="i" class="h-4 w-4" :class="isStarActive(product.rating, i) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'" />
                    </div>
                    <span class="text-sm font-bold text-gray-600">{{ Number(product.rating || 0).toFixed(1) }}</span>
                    <span class="text-sm text-gray-400">({{ Number(product.reviewCount || 0) }} {{ Number(product.reviewCount || 0) === 1 ? t('review') : t('reviews') }})</span>
                  </div>
                  <div class="mt-3 flex items-end gap-3">
                    <div class="text-2xl font-extrabold text-[color:var(--color-primary,#2B3E95)]">{{ formatMoney(product.price) }}</div>
                    <div v-if="product.oldPrice" class="text-sm font-bold text-gray-400 line-through">{{ formatMoney(product.oldPrice) }}</div>
                  </div>
                  <div v-if="productCardConfig.showSoldCount || productCardConfig.showCategoryChip || productCardConfig.showStockBadge" class="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold">
                    <span v-if="productCardConfig.showSoldCount" class="rounded-full bg-gray-100 px-3 py-1.5 text-gray-600">{{ formatSoldLabel(product.sold) }}</span>
                    <span v-if="productCardConfig.showCategoryChip && product.category" class="rounded-full bg-gray-100 px-3 py-1.5 text-gray-600">{{ product.category }}</span>
                    <span v-if="productCardConfig.showStockBadge" class="inline-flex items-center gap-1 rounded-full px-3 py-1.5" :class="Number(product.stock || 0) > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'"><Truck class="h-3.5 w-3.5" />{{ Number(product.stock || 0) > 0 ? t('in_stock') : t('out_of_stock') }}</span>
                  </div>
                  <div class="mt-5 flex items-center gap-3" :class="productCardConfig.showSecondaryCta ? 'lg:max-w-xl' : ''">
                    <button type="button" class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[color:var(--color-accent,#FACC15)] px-5 py-3 text-sm font-extrabold text-gray-900 hover:brightness-95 disabled:opacity-60" :disabled="Number(product.stock || 0) <= 0" @click="cartStore.addToCart(product)"><ShoppingCart class="h-4 w-4" />{{ t('add_to_cart') }}</button>
                    <NuxtLink v-if="productCardConfig.showSecondaryCta" :to="buildProductHref(product)" class="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 transition-all duration-300 hover:border-[#FACC15] hover:bg-[#FACC15] hover:text-gray-900 md:inline-flex">
                      <Eye class="h-4 w-4" />
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div v-if="clientReady && canLoadMoreMobile" class="sm:hidden">
            <button type="button" class="w-full rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-extrabold text-gray-700 hover:bg-gray-50" @click="mobileVisibleCount += Math.max(4, Number(shopConfig.mobileLoadMoreStep || 8))">{{ t('load_more') }}</button>
          </div>

          <div v-if="clientReady && totalPages > 1 && !(isMobile && shopConfig.hybridPaginationEnabled)" class="flex flex-wrap items-center justify-center gap-3">
            <button type="button" class="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300" :disabled="currentPage === 1" @click="currentPage = Math.max(1, currentPage - 1)">{{ t('pagination_prev') }}</button>
            <button v-for="page in pageNumbers" :key="page" type="button" :class="['h-11 min-w-[44px] rounded-2xl border px-4 text-sm font-bold transition-all', currentPage === page ? 'border-[color:var(--color-primary,#2B3E95)] bg-[color:var(--color-primary,#2B3E95)] text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50']" @click="currentPage = page">{{ page }}</button>
            <button type="button" class="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300" :disabled="currentPage === totalPages" @click="currentPage = Math.min(totalPages, currentPage + 1)">{{ t('pagination_next') }}</button>
          </div>
          </div>

          <div v-if="clientReady && !suppressShopRails && shopRails.length" class="space-y-6">
            <ShopRailSection v-for="rail in shopRails" :key="rail.key" :title="rail.title" :subtitle="rail.subtitle" :products="rail.products" />
          </div>
        </ClientOnly>
      </div>
    </div>

    <div v-if="isFilterOpen" class="fixed inset-0 z-50 lg:hidden">
      <div class="absolute inset-0 bg-black/50" @click="isFilterOpen = false"></div>
      <div class="absolute right-0 top-0 flex h-full w-[90%] max-w-md flex-col bg-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <div class="text-lg font-extrabold text-gray-900">{{ t('filters') }}</div>
            <div class="mt-1 text-xs font-bold text-gray-500">{{ mobileDraftFilterCount }} aktiv seçim</div>
          </div>
          <button type="button" class="h-10 w-10 rounded-lg bg-gray-100 font-extrabold text-gray-700" @click="isFilterOpen = false">✕</button>
        </div>
        <div class="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 pb-28">
          <div class="rounded-xl border border-gray-100 bg-white shadow-sm">
            <button type="button" class="flex w-full items-center justify-between gap-3 px-4 py-4 text-left" @click="toggleMobileFilterSection('categories')">
              <div class="text-base font-extrabold text-gray-900">{{ t('categories') }}</div>
              <ChevronDown class="h-5 w-5 text-gray-400 transition-transform" :class="mobileFilterSections.categories ? 'rotate-180' : ''" />
            </button>
            <div v-if="mobileFilterSections.categories" class="border-t border-gray-100 p-4">
              <ShopCategorySidebar :categories="categoryStore.categories" :products="activeProducts" :active-category-id="mobileDraftCategoryId" :dense="true" @select="setCategory" />
            </div>
          </div>
          <div class="rounded-xl border border-gray-100 bg-white shadow-sm">
            <button type="button" class="flex w-full items-center justify-between gap-3 px-4 py-4 text-left" @click="toggleMobileFilterSection('price')">
              <div class="text-base font-extrabold text-gray-900">{{ t('price_range') }}</div>
              <ChevronDown class="h-5 w-5 text-gray-400 transition-transform" :class="mobileFilterSections.price ? 'rotate-180' : ''" />
            </button>
            <div v-if="mobileFilterSections.price" class="border-t border-gray-100 p-4">
              <div class="grid grid-cols-2 gap-3">
                <label class="space-y-2"><div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">{{ t('min_label') }}</div><input v-model.number="mobileDraftMinPrice" type="number" :min="priceBounds[0]" :max="priceBounds[1]" class="w-full rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-600 focus:bg-white" /></label>
                <label class="space-y-2"><div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">{{ t('max_label') }}</div><input v-model.number="mobileDraftMaxPrice" type="number" :min="priceBounds[0]" :max="priceBounds[1]" class="w-full rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-bold outline-none focus:border-blue-600 focus:bg-white" /></label>
              </div>
              <div class="mt-4 space-y-4">
                <div class="relative h-2 rounded-lg bg-gray-100">
                  <div class="absolute h-2 rounded-lg bg-blue-600" :style="{ left: `${mobilePriceLeftPct}%`, width: `${Math.max(0, mobilePriceRightPct - mobilePriceLeftPct)}%` }"></div>
                  <input v-model.number="mobileDraftMinPrice" type="range" :min="priceBounds[0]" :max="priceBounds[1]" class="absolute inset-0 h-2 w-full appearance-none bg-transparent accent-blue-600" />
                  <input v-model.number="mobileDraftMaxPrice" type="range" :min="priceBounds[0]" :max="priceBounds[1]" class="absolute inset-0 h-2 w-full appearance-none bg-transparent accent-blue-600" />
                </div>
                <div class="flex items-center justify-between text-sm font-bold text-gray-700"><span>{{ formatMoney(Math.min(mobileDraftMinPrice, mobileDraftMaxPrice)) }}</span><span>{{ formatMoney(Math.max(mobileDraftMinPrice, mobileDraftMaxPrice)) }}</span></div>
              </div>
            </div>
          </div>
          <div v-if="availableAttributeGroups.length" class="rounded-xl border border-gray-100 bg-white shadow-sm">
            <button type="button" class="flex w-full items-center justify-between gap-3 px-4 py-4 text-left" @click="toggleMobileFilterSection('attributes')">
              <div class="text-base font-extrabold text-gray-900">{{ t('attributes') }}</div>
              <ChevronDown class="h-5 w-5 text-gray-400 transition-transform" :class="mobileFilterSections.attributes ? 'rotate-180' : ''" />
            </button>
            <div v-if="mobileFilterSections.attributes" class="space-y-5 border-t border-gray-100 p-4">
              <div v-for="group in availableAttributeGroups" :key="group.key" class="space-y-3">
                <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">{{ group.label }}</div>
                <div class="flex flex-wrap gap-2">
                  <button v-for="option in group.options" :key="option.value" type="button" :class="['inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition-all', (mobileDraftAttributes[group.key] || []).includes(option.value) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:text-blue-700']" @click="mobileToggleAttribute(group.key, option.value)">
                    <span v-if="group.visual && colorMap[normKey(option.value)]" class="h-4 w-4 rounded-md border border-gray-200" :style="{ backgroundColor: colorMap[normKey(option.value)] }"></span>
                    {{ option.value }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-if="showMobileBrands" class="rounded-xl border border-gray-100 bg-white shadow-sm">
            <button type="button" class="flex w-full items-center justify-between gap-3 px-4 py-4 text-left" @click="toggleMobileFilterSection('brands')">
              <div class="text-base font-extrabold text-gray-900">{{ t('brands') }}</div>
              <ChevronDown class="h-5 w-5 text-gray-400 transition-transform" :class="mobileFilterSections.brands ? 'rotate-180' : ''" />
            </button>
            <div v-if="mobileFilterSections.brands" class="border-t border-gray-100 p-4">
              <div class="space-y-2.5">
                <button
                  v-for="brand in mobileAvailableBrands"
                  :key="brand.name"
                  type="button"
                  :class="[
                    'flex w-full items-center gap-3 rounded-xl px-1 py-1 text-left text-sm font-extrabold transition-all',
                    mobileDraftBrand === brand.name
                      ? 'text-blue-700'
                      : 'text-gray-700 hover:text-blue-700'
                  ]"
                  @click="mobileDraftBrand = mobileDraftBrand === brand.name ? null : brand.name"
                >
                  <span :class="[
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border transition-all',
                    mobileDraftBrand === brand.name
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white text-transparent'
                  ]">
                    <Check class="h-3.5 w-3.5" />
                  </span>
                  {{ brand.name }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="sticky bottom-0 grid grid-cols-2 gap-3 border-t border-gray-100 bg-white p-4">
          <button type="button" class="rounded-lg bg-gray-100 py-3 text-sm font-extrabold text-gray-800 hover:bg-gray-200" @click="resetMobileDrafts">{{ t('reset_filters') }}</button>
          <button type="button" class="rounded-lg bg-gray-900 py-3 text-sm font-extrabold text-white hover:bg-black" @click="applyMobileFilters">{{ t('filter') }}</button>
        </div>
      </div>
    </div>

    <ProductQuickViewModal v-model="globalQuickViewId" />
  </div>
</template>

<style scoped>
@media (max-width: 767px) {
  .shop-density-compact :deep(.text-3xl.font-extrabold) {
    font-size: 1.625rem;
    line-height: 2rem;
  }
  .shop-density-compact :deep(.text-2xl.font-extrabold) {
    font-size: 1.25rem;
    line-height: 1.7rem;
  }
  .shop-density-compact :deep(.rounded-\[2rem\].border.border-gray-100.bg-white.p-5),
  .shop-density-compact :deep(.rounded-\[2rem\].border.border-blue-100.bg-gradient-to-r.p-6),
  .shop-density-compact :deep(.rounded-\[2rem\].border.border-gray-100.bg-white.p-4) {
    padding: 1rem;
  }
  .shop-density-compact :deep(.absolute.inset-0.flex.items-center.p-8) {
    padding: 1.25rem;
  }
}
</style>
