<script setup lang="ts">
import { BellRing, Filter, Layers3, RotateCcw, Save, Search, Sparkles } from 'lucide-vue-next'
import { defaultShopExperienceSettings, useShopExperienceStore, type ShopExperienceSettings } from '~/stores/shopExperience'

definePageMeta({ layout: 'admin' })

const shopExperienceStore = useShopExperienceStore()
const toastStore = useToastStore()

const loading = ref(true)
const saving = ref(false)
const form = ref<ShopExperienceSettings>(defaultShopExperienceSettings())
const products = ref<any[]>([])
const alertsSummary = ref<{ total: number; priceDrop: number; restock: number; pending: number; sent: number; dismissed: number; items: any[] }>({
  total: 0,
  priceDrop: 0,
  restock: 0,
  pending: 0,
  sent: 0,
  dismissed: 0,
  items: []
})

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value))

const railCards = computed(() => ([
  { key: 'topSellers', label: 'Top sellers', model: form.value.topSellers },
  { key: 'trendNow', label: 'Trending this week', model: form.value.trendNow },
  { key: 'newArrivals', label: 'New arrivals', model: form.value.newArrivals },
  { key: 'recentlyViewed', label: 'Recently viewed', model: form.value.recentlyViewed },
  { key: 'priceDrops', label: 'Price drops', model: form.value.priceDrops },
  { key: 'topRated', label: 'Top rated', model: form.value.topRated }
]))

const availableProducts = computed(() => products.value.filter((item) => !item?.status || item.status === 'Aktiv'))
const previewProduct = computed(() => availableProducts.value[0] || null)
const productCardPresets = computed(() => form.value.productCardPresets || [])
const previewCardProduct = computed(() => {
  if (!previewProduct.value) return null
  return {
    ...previewProduct.value,
    sellerScore: 96
  }
})
const previewCardProducts = computed(() => availableProducts.value.slice(0, 3).map((item, index) => ({ ...item, sellerScore: 96 - index * 4 })))
const productCardDensityLabel = computed(() => form.value.productCard.density === 'compact' ? 'Kompakt' : 'Rahat')
const mobileCardDensityLabel = computed(() => form.value.productCard.mobileDensity === 'compact' ? 'Mobil kompakt' : 'Mobil rahat')
const productCardPresetLabel = computed(() => form.value.productCard.layoutVariant === 'premium-luxe'
  ? 'Premium Luxe'
  : form.value.productCard.stylePreset === 'outlined' ? 'Çərçivəli' : form.value.productCard.stylePreset === 'elevated' ? 'Premium' : 'Soft')
const productCardSpacingLabel = computed(() => form.value.productCard.contentSpacing === 'balanced' ? 'Açıq' : 'Tight')
const mobileMetaModeLabel = computed(() => form.value.productCard.mobileMetaMode === 'minimal' ? 'Mobil minimal meta' : 'Mobil geniş meta')
const cloneCardSettings = () => clone(form.value.productCard)
const applyCardSettings = (settings: any) => {
  form.value.productCard = clone(settings)
}
const applyProductCardPreset = (preset: 'minimal' | 'premium' | 'editorial' | 'luxe') => {
  if (preset === 'minimal') {
    form.value.productCard.layoutVariant = 'classic'
    form.value.productCard.stylePreset = 'outlined'
    form.value.productCard.cornerStyle = 'sharp'
    form.value.productCard.mediaRatio = 'square'
    form.value.productCard.priceTone = 'dark'
    form.value.productCard.density = 'compact'
    form.value.productCard.contentSpacing = 'tight'
    form.value.productCard.titleLines = 1
    form.value.productCard.showViewCount = false
    form.value.productCard.showSellerScore = false
    form.value.productCard.showCategoryChip = false
    form.value.productCard.showRating = false
    form.value.productCard.showReviewCount = false
    form.value.productCard.showSoldCount = false
    form.value.productCard.showSecondaryCta = false
    form.value.productCard.showMobileSellerName = false
    form.value.productCard.showMobileRating = false
    form.value.productCard.showMobileReviewCount = false
    form.value.productCard.showMobileSoldCount = false
    form.value.productCard.showMobileStockBadge = true
    form.value.productCard.showMobileWishlistAction = true
    form.value.productCard.showMobileQuickViewAction = false
    return
  }
  if (preset === 'premium') {
    form.value.productCard.layoutVariant = 'classic'
    form.value.productCard.stylePreset = 'elevated'
    form.value.productCard.cornerStyle = 'rounded'
    form.value.productCard.mediaRatio = 'portrait'
    form.value.productCard.priceTone = 'brand'
    form.value.productCard.density = 'comfortable'
    form.value.productCard.contentSpacing = 'balanced'
    form.value.productCard.titleLines = 2
    form.value.productCard.showViewCount = true
    form.value.productCard.showSellerScore = true
    form.value.productCard.showCategoryChip = true
    form.value.productCard.showRating = true
    form.value.productCard.showReviewCount = true
    form.value.productCard.showSoldCount = true
    form.value.productCard.showSecondaryCta = true
    form.value.productCard.showMobileSellerName = false
    form.value.productCard.showMobileRating = true
    form.value.productCard.showMobileReviewCount = false
    form.value.productCard.showMobileSoldCount = false
    form.value.productCard.showMobileStockBadge = true
    form.value.productCard.showMobileWishlistAction = true
    form.value.productCard.showMobileQuickViewAction = true
    return
  }
  if (preset === 'luxe') {
    form.value.productCard.layoutVariant = 'premium-luxe'
    form.value.productCard.stylePreset = 'outlined'
    form.value.productCard.cornerStyle = 'sharp'
    form.value.productCard.mediaRatio = 'portrait'
    form.value.productCard.priceTone = 'dark'
    form.value.productCard.density = 'comfortable'
    form.value.productCard.mobileDensity = 'compact'
    form.value.productCard.contentSpacing = 'balanced'
    form.value.productCard.titleLines = 2
    form.value.productCard.mobileTitleLines = 1
    form.value.productCard.mobileMetaMode = 'minimal'
    form.value.productCard.showBrandBadge = false
    form.value.productCard.showViewCount = false
    form.value.productCard.showSellerName = true
    form.value.productCard.showSellerScore = true
    form.value.productCard.showCategoryChip = false
    form.value.productCard.showRating = true
    form.value.productCard.showReviewCount = false
    form.value.productCard.showSoldCount = false
    form.value.productCard.showSecondaryCta = true
    form.value.productCard.showMobileSellerName = false
    form.value.productCard.showMobileRating = false
    form.value.productCard.showMobileReviewCount = false
    form.value.productCard.showMobileSoldCount = false
    form.value.productCard.showMobileStockBadge = false
    form.value.productCard.showMobileWishlistAction = true
    form.value.productCard.showMobileQuickViewAction = false
    form.value.productCard.primaryCtaBg = '#f3c300'
    form.value.productCard.primaryCtaText = '#111827'
    form.value.productCard.secondaryCtaBg = '#FFFFFF'
    form.value.productCard.secondaryCtaText = '#111827'
    form.value.productCard.secondaryCtaBorder = '#E5E7EB'
    return
  }
  form.value.productCard.layoutVariant = 'classic'
  form.value.productCard.stylePreset = 'soft'
  form.value.productCard.cornerStyle = 'soft'
  form.value.productCard.mediaRatio = 'portrait'
  form.value.productCard.priceTone = 'brand'
  form.value.productCard.density = 'compact'
  form.value.productCard.contentSpacing = 'tight'
  form.value.productCard.titleLines = 2
  form.value.productCard.showViewCount = true
  form.value.productCard.showSellerScore = true
  form.value.productCard.showCategoryChip = true
  form.value.productCard.showRating = true
  form.value.productCard.showReviewCount = false
  form.value.productCard.showSoldCount = false
  form.value.productCard.showSecondaryCta = false
  form.value.productCard.showMobileSellerName = false
  form.value.productCard.showMobileRating = true
  form.value.productCard.showMobileReviewCount = false
  form.value.productCard.showMobileSoldCount = false
  form.value.productCard.showMobileStockBadge = true
  form.value.productCard.showMobileWishlistAction = true
  form.value.productCard.showMobileQuickViewAction = true
}
const activateSavedProductCardPreset = async (presetId: string) => {
  const preset = productCardPresets.value.find((item) => item.id === presetId)
  if (!preset) return
  applyCardSettings(preset.settings)
  form.value.activeProductCardPresetId = presetId
  await save()
}
const saveCurrentToPreset = async (presetId: string) => {
  const preset = productCardPresets.value.find((item) => item.id === presetId)
  if (!preset) return
  preset.settings = cloneCardSettings()
  form.value.activeProductCardPresetId = presetId
  await save()
}
const applyProductCardCtaPalette = (palette: 'classic' | 'dark' | 'soft') => {
  if (palette === 'dark') {
    form.value.productCard.primaryCtaBg = '#111827'
    form.value.productCard.primaryCtaText = '#FFFFFF'
    form.value.productCard.secondaryCtaBg = '#F3F4F6'
    form.value.productCard.secondaryCtaText = '#111827'
    form.value.productCard.secondaryCtaBorder = '#D1D5DB'
    return
  }
  if (palette === 'soft') {
    form.value.productCard.primaryCtaBg = '#EEF2FF'
    form.value.productCard.primaryCtaText = '#2B3E95'
    form.value.productCard.secondaryCtaBg = '#FFFFFF'
    form.value.productCard.secondaryCtaText = '#4B5563'
    form.value.productCard.secondaryCtaBorder = '#E5E7EB'
    return
  }
  form.value.productCard.primaryCtaBg = '#FFD200'
  form.value.productCard.primaryCtaText = '#111827'
  form.value.productCard.secondaryCtaBg = '#FFFFFF'
  form.value.productCard.secondaryCtaText = '#374151'
  form.value.productCard.secondaryCtaBorder = '#E5E7EB'
}
const applyProductCardBadgePalette = (palette: 'brand' | 'fresh' | 'soft') => {
  if (palette === 'fresh') {
    form.value.productCard.discountBadgeBg = '#1D4ED8'
    form.value.productCard.discountBadgeText = '#FFFFFF'
    form.value.productCard.newBadgeBg = '#ECFDF5'
    form.value.productCard.newBadgeText = '#047857'
    form.value.productCard.stockBadgeBg = '#ECFDF5'
    form.value.productCard.stockBadgeText = '#047857'
    form.value.productCard.stockBadgeBorder = '#A7F3D0'
    form.value.productCard.outOfStockBadgeBg = '#FEF2F2'
    form.value.productCard.outOfStockBadgeText = '#B91C1C'
    form.value.productCard.lowStockText = '#B45309'
    return
  }
  if (palette === 'soft') {
    form.value.productCard.discountBadgeBg = '#334155'
    form.value.productCard.discountBadgeText = '#FFFFFF'
    form.value.productCard.newBadgeBg = '#FFF7CC'
    form.value.productCard.newBadgeText = '#2B3E95'
    form.value.productCard.stockBadgeBg = '#F0FDF4'
    form.value.productCard.stockBadgeText = '#166534'
    form.value.productCard.stockBadgeBorder = '#BBF7D0'
    form.value.productCard.outOfStockBadgeBg = '#FEF2F2'
    form.value.productCard.outOfStockBadgeText = '#991B1B'
    form.value.productCard.lowStockText = '#2B3E95'
    return
  }
  form.value.productCard.discountBadgeBg = '#2B3E95'
  form.value.productCard.discountBadgeText = '#FFFFFF'
  form.value.productCard.newBadgeBg = '#FFF7CC'
  form.value.productCard.newBadgeText = '#2B3E95'
  form.value.productCard.stockBadgeBg = '#ECFDF5'
  form.value.productCard.stockBadgeText = '#047857'
  form.value.productCard.stockBadgeBorder = '#A7F3D0'
  form.value.productCard.outOfStockBadgeBg = '#FEF2F2'
  form.value.productCard.outOfStockBadgeText = '#B91C1C'
  form.value.productCard.lowStockText = '#B45309'
}
const productCardToggleGroups = [
  {
    title: 'Badge və üst hissə',
    items: [
      { key: 'showDiscountBadge', label: 'Endirim badge-i' },
      { key: 'showFeaturedBadge', label: 'Featured / PRO badge-i' },
      { key: 'showNewBadge', label: 'Yeni badge-i' },
      { key: 'showBrandBadge', label: 'Brand pill-i' },
      { key: 'showViewCount', label: 'Baxış sayı' }
    ]
  },
  {
    title: 'Məlumat hissəsi',
    items: [
      { key: 'showSellerName', label: 'Satıcı adı' },
      { key: 'showSellerScore', label: 'Satıcı etibar xalı' },
      { key: 'showCategoryChip', label: 'Kateqoriya chip-i' },
      { key: 'showRating', label: 'Reytinq ulduzları' },
      { key: 'showReviewCount', label: 'Rəy sayı' },
      { key: 'showSoldCount', label: 'Satış sayı' },
      { key: 'showStockBadge', label: 'Stok badge-i' },
      { key: 'showLowStockText', label: 'Az qalıb mətni' }
    ]
  },
  {
    title: 'Aksiya düymələri',
    items: [
      { key: 'showWishlistAction', label: 'Wishlist düyməsi' },
      { key: 'showCompareAction', label: 'Compare düyməsi' },
      { key: 'showQuickViewAction', label: 'Tez baxış düyməsi' },
      { key: 'showSecondaryCta', label: 'Məhsula bax CTA-sı' }
    ]
  }
] as const
const mobileProductCardToggleItems = [
  { key: 'showMobileSellerName', label: 'Mobil satıcı adı' },
  { key: 'showMobileRating', label: 'Mobil reytinq' },
  { key: 'showMobileReviewCount', label: 'Mobil rəy sayı' },
  { key: 'showMobileSoldCount', label: 'Mobil satış sayı' },
  { key: 'showMobileStockBadge', label: 'Mobil stok hissəsi' },
  { key: 'showMobileWishlistAction', label: 'Mobil wishlist' },
  { key: 'showMobileQuickViewAction', label: 'Mobil tez baxış' }
] as const

const toggleManualProduct = (model: any, productId: number) => {
  const current = Array.isArray(model.manualProductIds) ? model.manualProductIds : []
  model.manualProductIds = current.includes(productId)
    ? current.filter((id: number) => id !== productId)
    : [...current, productId]
}

const manualProductPreview = (ids: number[]) => {
  const list = Array.isArray(ids) ? ids : []
  return list
    .map((id) => availableProducts.value.find((item) => Number(item.id) === Number(id)))
    .filter(Boolean)
}

const loadAlerts = async () => {
  try {
    alertsSummary.value = await $fetch('/api/admin/product-alerts')
  } catch {
    alertsSummary.value = { total: 0, priceDrop: 0, restock: 0, pending: 0, sent: 0, dismissed: 0, items: [] }
  }
}

const updateAlertStatus = async (id: string, status: 'pending' | 'sent' | 'dismissed') => {
  try {
    await $fetch(`/api/admin/product-alerts/${id}`, {
      method: 'PUT',
      body: { status }
    })
    await loadAlerts()
    toastStore.success('Alert status yeniləndi')
  } catch (error: any) {
    toastStore.error(error?.data?.statusMessage || 'Alert status yenilənmədi')
  }
}

const exportAlerts = async () => {
  try {
    const csv = await $fetch('/api/admin/product-alerts', { query: { format: 'csv' }, responseType: 'text' })
    if (!process.client) return
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'product-alerts.csv'
    link.click()
    URL.revokeObjectURL(url)
  } catch (error: any) {
    toastStore.error(error?.data?.statusMessage || 'Alert export alınmadı')
  }
}

const load = async () => {
  loading.value = true
  try {
    await shopExperienceStore.fetchConfig()
    products.value = await $fetch('/api/products').catch(() => [])
    form.value = clone(shopExperienceStore.config)
    await loadAlerts()
  } finally {
    loading.value = false
  }
}

const save = async () => {
  saving.value = true
  try {
    await shopExperienceStore.saveConfig(form.value)
    form.value = clone(shopExperienceStore.config)
    toastStore.success('Shop experience yadda saxlanıldı')
    await loadAlerts()
  } catch (error: any) {
    toastStore.error(error?.data?.statusMessage || error?.statusMessage || 'Shop experience yadda saxlanılmadı')
  } finally {
    saving.value = false
  }
}

const resetToDefaults = () => {
  form.value = defaultShopExperienceSettings()
  toastStore.info('Standart mağaza konfiqi tətbiq edildi. Yadda saxlamaq üçün saxla düyməsini vurun.')
}

onMounted(load)
</script>

<template>
  <div class="mx-auto w-full max-w-[1480px] space-y-8">
    <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Mağaza təcrübəsi</h1>
        <p class="mt-2 text-sm font-medium text-gray-500">
          Mağaza səhifəsinin sticky filters, smart empty state, compare, rails və alert axınını bu bölmədən idarə edin.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <button type="button" class="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50" @click="resetToDefaults">
          <RotateCcw class="w-4 h-4" />
          Standart
        </button>
        <button type="button" class="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60" :disabled="saving || loading" @click="save">
          <Save class="w-4 h-4" />
          {{ saving ? 'Yadda saxlanır...' : 'Yadda saxla' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="rounded-[2rem] border border-gray-100 bg-white p-10 text-sm font-medium text-gray-500 shadow-sm">
      Mağaza təcrübəsi yüklənir...
    </div>

    <template v-else>
      <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-2 text-lg font-extrabold text-gray-900">
            <Filter class="w-5 h-5 text-blue-600" />
            Core controls
          </div>
          <div class="mt-6 space-y-4">
            <label class="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
              <span class="text-sm font-bold text-gray-700">Sticky filter bar</span>
              <input v-model="form.stickyFiltersEnabled" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" />
            </label>
            <label class="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
              <span class="text-sm font-bold text-gray-700">Quick compare</span>
              <input v-model="form.compareEnabled" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" />
            </label>
            <label class="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
              <span class="text-sm font-bold text-gray-700">Seller trust highlights</span>
              <input v-model="form.sellerTrustEnabled" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" />
            </label>
            <label class="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
              <span class="text-sm font-bold text-gray-700">Hybrid pagination</span>
              <input v-model="form.hybridPaginationEnabled" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" />
            </label>
            <label class="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
              <span class="text-sm font-bold text-gray-700">AI-like search helper</span>
              <input v-model="form.searchHelperEnabled" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" />
            </label>
            <label class="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
              <span class="text-sm font-bold text-gray-700">Price-drop / restock alerts</span>
              <input v-model="form.alertsEnabled" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" />
            </label>
          </div>
        </div>

        <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-2 text-lg font-extrabold text-gray-900">
            <Layers3 class="w-5 h-5 text-blue-600" />
            Limits
          </div>
          <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label class="space-y-2">
              <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Compare max</div>
              <input v-model.number="form.compareMaxItems" type="number" min="2" max="4" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white" />
            </label>
            <label class="space-y-2">
              <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Mobile load more</div>
              <input v-model.number="form.mobileLoadMoreStep" type="number" min="4" max="32" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white" />
            </label>
          </div>
          <div class="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-900">
            `mobileLoadMoreStep` mobil görünüşdə “Daha çox göstər” düyməsi ilə neçə məhsulun əlavə olunacağını idarə edir.
          </div>
        </div>

        <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-2 text-lg font-extrabold text-gray-900">
            <BellRing class="w-5 h-5 text-blue-600" />
            Alert summary
          </div>
          <div class="mt-6 grid grid-cols-3 gap-3">
            <div class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-5">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">Total</div>
              <div class="mt-3 text-3xl font-extrabold text-gray-900">{{ alertsSummary.total }}</div>
            </div>
            <div class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-5">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">Price drop</div>
              <div class="mt-3 text-3xl font-extrabold text-gray-900">{{ alertsSummary.priceDrop }}</div>
            </div>
            <div class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-5">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">Restock</div>
              <div class="mt-3 text-3xl font-extrabold text-gray-900">{{ alertsSummary.restock }}</div>
            </div>
          </div>
          <div class="mt-3 grid grid-cols-3 gap-3">
            <div class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">Pending</div>
              <div class="mt-2 text-2xl font-extrabold text-gray-900">{{ alertsSummary.pending }}</div>
            </div>
            <div class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">Sent</div>
              <div class="mt-2 text-2xl font-extrabold text-gray-900">{{ alertsSummary.sent }}</div>
            </div>
            <div class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">Dismissed</div>
              <div class="mt-2 text-2xl font-extrabold text-gray-900">{{ alertsSummary.dismissed }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-2 text-lg font-extrabold text-gray-900">
            <Search class="w-5 h-5 text-blue-600" />
            Search helper texts
          </div>
          <div class="mt-6 space-y-5">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label class="space-y-2">
                <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Title AZ</div>
                <input v-model="form.searchHelperTitle.az" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white" />
              </label>
              <label class="space-y-2">
                <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Title RU</div>
                <input v-model="form.searchHelperTitle.ru" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white" />
              </label>
              <label class="space-y-2">
                <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Title EN</div>
                <input v-model="form.searchHelperTitle.en" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white" />
              </label>
            </div>

            <div class="space-y-4">
              <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Search helper chips</div>
              <div v-for="chip in form.searchHelperChips" :key="chip.id" class="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <input v-model="chip.label.az" placeholder="AZ label" class="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
                  <input v-model="chip.label.ru" placeholder="RU label" class="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
                  <input v-model="chip.label.en" placeholder="EN label" class="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
                  <input v-model="chip.query" placeholder="Query" class="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-2 text-lg font-extrabold text-gray-900">
            <Sparkles class="w-5 h-5 text-blue-600" />
            Empty state və alerts
          </div>
          <div class="mt-6 space-y-5">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <input v-model="form.emptyStateTitle.az" placeholder="Empty title AZ" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white" />
              <input v-model="form.emptyStateTitle.ru" placeholder="Empty title RU" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white" />
              <input v-model="form.emptyStateTitle.en" placeholder="Empty title EN" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white" />
            </div>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <textarea v-model="form.emptyStateDescription.az" rows="3" placeholder="Empty description AZ" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white resize-none"></textarea>
              <textarea v-model="form.emptyStateDescription.ru" rows="3" placeholder="Empty description RU" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white resize-none"></textarea>
              <textarea v-model="form.emptyStateDescription.en" rows="3" placeholder="Empty description EN" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white resize-none"></textarea>
            </div>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <input v-model="form.emptyStateCta.az" placeholder="CTA AZ" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white" />
              <input v-model="form.emptyStateCta.ru" placeholder="CTA RU" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white" />
              <input v-model="form.emptyStateCta.en" placeholder="CTA EN" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white" />
            </div>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <input v-model="form.alertTitle.az" placeholder="Alert title AZ" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white" />
              <input v-model="form.alertTitle.ru" placeholder="Alert title RU" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white" />
              <input v-model="form.alertTitle.en" placeholder="Alert title EN" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white" />
            </div>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <textarea v-model="form.alertDescription.az" rows="3" placeholder="Alert description AZ" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white resize-none"></textarea>
              <textarea v-model="form.alertDescription.ru" rows="3" placeholder="Alert description RU" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white resize-none"></textarea>
              <textarea v-model="form.alertDescription.en" rows="3" placeholder="Alert description EN" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white resize-none"></textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div class="text-lg font-extrabold text-gray-900">Məhsul kartları</div>
            <div class="mt-1 text-sm font-medium text-gray-500">
              Shop kartında görünən badge, meta və aksiya düymələrini buradan idarə edin.
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <div class="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Ayrı admin bölməsi
            </div>
            <label class="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 shadow-sm">
              <span class="text-sm font-extrabold text-gray-800">
                Tez baxış: {{ form.productCard.showQuickViewAction ? 'Aktiv' : 'Deaktiv' }}
              </span>
              <input v-model="form.productCard.showQuickViewAction" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" />
            </label>
          </div>
        </div>
        <div class="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div class="space-y-6">
            <div class="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 p-4">
              <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">Serverə bağlı hazır kartlar</div>
                  <div class="mt-2 text-sm font-medium text-gray-600">Bu 3 kart serverdə saxlanır. `Aktiv et` düyməsi ilə dərhal yadda saxlanır və storefront-da avtomatik dəyişir.</div>
                </div>
                <div class="rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-emerald-700 shadow-sm">
                  Aktiv: {{ form.activeProductCardPresetId }}
                </div>
              </div>
              <div class="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div v-for="preset in productCardPresets" :key="preset.id" class="rounded-[1.5rem] border border-white bg-white p-4 shadow-sm">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <div class="text-sm font-extrabold text-gray-900">{{ preset.name.az }}</div>
                      <div class="mt-1 text-xs font-medium text-gray-500">{{ preset.description.az }}</div>
                    </div>
                    <span v-if="form.activeProductCardPresetId === preset.id" class="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">Aktiv</span>
                  </div>
                  <div v-if="previewCardProduct" class="mt-4 pointer-events-none select-none">
                    <ProductCard :product="previewCardProduct" :product-card-settings="preset.settings" :compare-enabled="form.compareEnabled" :interactive="false" />
                  </div>
                  <div class="mt-4 grid grid-cols-2 gap-2">
                    <button type="button" class="rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-700 disabled:opacity-60" :disabled="saving" @click="activateSavedProductCardPreset(preset.id)">
                      Aktiv et
                    </button>
                    <button type="button" class="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-extrabold text-gray-700 hover:bg-gray-50 disabled:opacity-60" :disabled="saving" @click="saveCurrentToPreset(preset.id)">
                      Bununla yenilə
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="rounded-[1.5rem] border border-blue-100 bg-blue-50/70 p-4">
              <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-700">Hazır presetlər</div>
              <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
                <button type="button" class="rounded-2xl border border-white bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50" @click="applyProductCardPreset('minimal')">
                  <div class="text-sm font-extrabold text-gray-900">Minimal</div>
                  <div class="mt-1 text-xs font-medium text-gray-500">Daha sərt, daha təmiz, CTA-sız</div>
                </button>
                <button type="button" class="rounded-2xl border border-white bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50" @click="applyProductCardPreset('premium')">
                  <div class="text-sm font-extrabold text-gray-900">Premium</div>
                  <div class="mt-1 text-xs font-medium text-gray-500">Kölgəli, zəngin meta və dolu kart</div>
                </button>
                <button type="button" class="rounded-2xl border border-white bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50" @click="applyProductCardPreset('editorial')">
                  <div class="text-sm font-extrabold text-gray-900">Editorial</div>
                  <div class="mt-1 text-xs font-medium text-gray-500">Soft, yığcam və modern vitrin görünüşü</div>
                </button>
                <button type="button" class="rounded-2xl border border-white bg-white px-4 py-3 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50" @click="applyProductCardPreset('luxe')">
                  <div class="text-sm font-extrabold text-gray-900">Premium Luxe</div>
                  <div class="mt-1 text-xs font-medium text-gray-500">Yeni premium layout, daha təmiz meta və güclü CTA</div>
                </button>
              </div>
            </div>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label class="space-y-2">
                <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Layout variantı</div>
                <select v-model="form.productCard.layoutVariant" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white">
                  <option value="classic">Classic</option>
                  <option value="premium-luxe">Premium Luxe</option>
                </select>
              </label>
              <label class="space-y-2">
                <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Kart sıxlığı</div>
                <select v-model="form.productCard.density" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white">
                  <option value="comfortable">Rahat</option>
                  <option value="compact">Kompakt</option>
                </select>
              </label>
              <label class="space-y-2">
                <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Məzmun spacing</div>
                <select v-model="form.productCard.contentSpacing" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white">
                  <option value="tight">Tight</option>
                  <option value="balanced">Açıq</option>
                </select>
              </label>
              <label class="space-y-2">
                <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Şəkil yerləşməsi</div>
                <select v-model="form.productCard.imageFit" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white">
                  <option value="contain">Tam yerləşdir</option>
                  <option value="cover">Kadrı doldur</option>
                </select>
              </label>
              <label class="space-y-2">
                <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Kart stili</div>
                <select v-model="form.productCard.stylePreset" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white">
                  <option value="soft">Soft</option>
                  <option value="outlined">Çərçivəli</option>
                  <option value="elevated">Premium</option>
                </select>
              </label>
              <label class="space-y-2">
                <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Künc forması</div>
                <select v-model="form.productCard.cornerStyle" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white">
                  <option value="rounded">Dairəvi</option>
                  <option value="soft">Soft</option>
                  <option value="sharp">Kəskin</option>
                </select>
              </label>
              <label class="space-y-2">
                <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Media nisbəti</div>
                <select v-model="form.productCard.mediaRatio" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white">
                  <option value="portrait">Portret</option>
                  <option value="square">Kvadrat</option>
                </select>
              </label>
              <label class="space-y-2">
                <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Qiymət tonu</div>
                <select v-model="form.productCard.priceTone" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white">
                  <option value="brand">Brand rəngi</option>
                  <option value="dark">Qara</option>
                </select>
              </label>
              <label class="space-y-2">
                <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Başlıq sətirləri</div>
                <select v-model.number="form.productCard.titleLines" class="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 focus:bg-white">
                  <option :value="1">1 sətir</option>
                  <option :value="2">2 sətir</option>
                </select>
              </label>
            </div>

            <div class="rounded-[1.5rem] border border-violet-100 bg-violet-50/70 p-5">
              <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <div class="text-sm font-extrabold text-gray-900">Mobil kart ayarları</div>
                  <div class="mt-1 text-xs font-medium text-gray-600">Mobil görünüşdə kartın aşağı uzanmamasını, başlıq sıxlığını və meta həcmini buradan idarə edin.</div>
                </div>
                <div class="rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-violet-700 shadow-sm">
                  {{ mobileCardDensityLabel }} / {{ mobileMetaModeLabel }}
                </div>
              </div>
              <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <label class="space-y-2">
                  <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Mobil sıxlıq</div>
                  <select v-model="form.productCard.mobileDensity" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600">
                    <option value="compact">Daha yığcam</option>
                    <option value="comfortable">Rahat</option>
                  </select>
                </label>
                <label class="space-y-2">
                  <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Mobil başlıq</div>
                  <select v-model.number="form.productCard.mobileTitleLines" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600">
                    <option :value="1">1 sətir</option>
                    <option :value="2">2 sətir</option>
                  </select>
                </label>
                <label class="space-y-2">
                  <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Mobil meta</div>
                  <select v-model="form.productCard.mobileMetaMode" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600">
                    <option value="minimal">Minimal</option>
                    <option value="rich">Geniş</option>
                  </select>
                </label>
              </div>
              <div class="mt-5 rounded-[1.25rem] border border-violet-100 bg-white p-4">
                <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-violet-700">Mobil görünürlük seçimləri</div>
                <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label v-for="item in mobileProductCardToggleItems" :key="item.key" class="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <span class="text-sm font-bold text-gray-700">{{ item.label }}</span>
                    <input v-model="form.productCard[item.key]" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" />
                  </label>
                </div>
              </div>
            </div>

            <div class="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-5">
              <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div class="text-sm font-extrabold text-gray-900">CTA rəngləri</div>
                  <div class="mt-1 text-xs font-medium text-gray-500">Səbətə at və Məhsula bax düymələrinin rənglərini buradan idarə edin.</div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button type="button" class="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-extrabold text-gray-700 hover:border-blue-200 hover:text-blue-700" @click="applyProductCardCtaPalette('classic')">Classic</button>
                  <button type="button" class="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-extrabold text-gray-700 hover:border-blue-200 hover:text-blue-700" @click="applyProductCardCtaPalette('dark')">Dark</button>
                  <button type="button" class="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-extrabold text-gray-700 hover:border-blue-200 hover:text-blue-700" @click="applyProductCardCtaPalette('soft')">Soft</button>
                </div>
              </div>
              <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                <label class="space-y-2">
                  <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Primary bg</div>
                  <input v-model="form.productCard.primaryCtaBg" type="color" class="h-12 w-full rounded-2xl border border-gray-100 bg-white p-2" />
                </label>
                <label class="space-y-2">
                  <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Primary text</div>
                  <input v-model="form.productCard.primaryCtaText" type="color" class="h-12 w-full rounded-2xl border border-gray-100 bg-white p-2" />
                </label>
                <label class="space-y-2">
                  <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Secondary bg</div>
                  <input v-model="form.productCard.secondaryCtaBg" type="color" class="h-12 w-full rounded-2xl border border-gray-100 bg-white p-2" />
                </label>
                <label class="space-y-2">
                  <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Secondary text</div>
                  <input v-model="form.productCard.secondaryCtaText" type="color" class="h-12 w-full rounded-2xl border border-gray-100 bg-white p-2" />
                </label>
                <label class="space-y-2">
                  <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Secondary border</div>
                  <input v-model="form.productCard.secondaryCtaBorder" type="color" class="h-12 w-full rounded-2xl border border-gray-100 bg-white p-2" />
                </label>
              </div>
            </div>

            <div class="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-5">
              <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div class="text-sm font-extrabold text-gray-900">Badge və status rəngləri</div>
                  <div class="mt-1 text-xs font-medium text-gray-500">Endirim, Yeni, Stokda var, Stokda yoxdur və az qalıb hissələrinin tonlarını buradan idarə edin.</div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button type="button" class="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-extrabold text-gray-700 hover:border-blue-200 hover:text-blue-700" @click="applyProductCardBadgePalette('brand')">Brand</button>
                  <button type="button" class="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-extrabold text-gray-700 hover:border-blue-200 hover:text-blue-700" @click="applyProductCardBadgePalette('fresh')">Fresh</button>
                  <button type="button" class="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-extrabold text-gray-700 hover:border-blue-200 hover:text-blue-700" @click="applyProductCardBadgePalette('soft')">Soft</button>
                </div>
              </div>
              <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                <label class="space-y-2">
                  <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Endirim bg</div>
                  <input v-model="form.productCard.discountBadgeBg" type="color" class="h-12 w-full rounded-2xl border border-gray-100 bg-white p-2" />
                </label>
                <label class="space-y-2">
                  <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Endirim text</div>
                  <input v-model="form.productCard.discountBadgeText" type="color" class="h-12 w-full rounded-2xl border border-gray-100 bg-white p-2" />
                </label>
                <label class="space-y-2">
                  <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Yeni bg</div>
                  <input v-model="form.productCard.newBadgeBg" type="color" class="h-12 w-full rounded-2xl border border-gray-100 bg-white p-2" />
                </label>
                <label class="space-y-2">
                  <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Yeni text</div>
                  <input v-model="form.productCard.newBadgeText" type="color" class="h-12 w-full rounded-2xl border border-gray-100 bg-white p-2" />
                </label>
                <label class="space-y-2">
                  <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Stok bg</div>
                  <input v-model="form.productCard.stockBadgeBg" type="color" class="h-12 w-full rounded-2xl border border-gray-100 bg-white p-2" />
                </label>
                <label class="space-y-2">
                  <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Stok text</div>
                  <input v-model="form.productCard.stockBadgeText" type="color" class="h-12 w-full rounded-2xl border border-gray-100 bg-white p-2" />
                </label>
                <label class="space-y-2">
                  <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Stok border</div>
                  <input v-model="form.productCard.stockBadgeBorder" type="color" class="h-12 w-full rounded-2xl border border-gray-100 bg-white p-2" />
                </label>
                <label class="space-y-2">
                  <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Yoxdur bg</div>
                  <input v-model="form.productCard.outOfStockBadgeBg" type="color" class="h-12 w-full rounded-2xl border border-gray-100 bg-white p-2" />
                </label>
                <label class="space-y-2">
                  <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Yoxdur text</div>
                  <input v-model="form.productCard.outOfStockBadgeText" type="color" class="h-12 w-full rounded-2xl border border-gray-100 bg-white p-2" />
                </label>
                <label class="space-y-2">
                  <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Az qalıb text</div>
                  <input v-model="form.productCard.lowStockText" type="color" class="h-12 w-full rounded-2xl border border-gray-100 bg-white p-2" />
                </label>
              </div>
            </div>

            <div class="rounded-[1.5rem] border border-amber-100 bg-amber-50/70 p-5">
              <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div class="text-sm font-extrabold text-gray-900">Tez baxış idarəsi</div>
                  <div class="mt-1 text-xs font-medium text-gray-600">
                    Bu seçim həm kartın sağ ikonundakı, həm də alt `Tez baxış` hissəsindəki görünüşü aktiv və ya deaktiv edir.
                  </div>
                </div>
                <label class="flex items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-sm">
                  <span class="text-sm font-bold text-gray-700">
                    {{ form.productCard.showQuickViewAction ? 'Aktivdir' : 'Deaktivdir' }}
                  </span>
                  <input v-model="form.productCard.showQuickViewAction" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" />
                </label>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <div v-for="group in productCardToggleGroups" :key="group.title" class="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-5">
                <div class="text-sm font-extrabold text-gray-900">{{ group.title }}</div>
                <div class="mt-4 space-y-3">
                  <label v-for="item in group.items" :key="item.key" class="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3">
                    <span class="text-sm font-bold text-gray-700">{{ item.label }}</span>
                    <input v-model="form.productCard[item.key]" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-[1.75rem] border border-blue-100 bg-gradient-to-b from-blue-50 to-white p-5">
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-sm font-extrabold text-gray-900">Canlı preview</div>
                <div class="mt-1 text-xs font-medium text-gray-500">Storefront kartına yaxın önizləmə</div>
              </div>
              <div class="rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-blue-700 shadow-sm">
                {{ productCardDensityLabel }} / {{ productCardSpacingLabel }} / {{ productCardPresetLabel }}
              </div>
            </div>

            <div v-if="previewCardProduct" class="mt-5 max-w-[380px] pointer-events-none select-none">
              <ProductCard :product="previewCardProduct" :product-card-settings="form.productCard" :compare-enabled="form.compareEnabled" :interactive="false" />
            </div>
            <div v-if="previewCardProducts.length" class="mt-5">
              <div class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Bölmə preview</div>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div v-for="item in previewCardProducts.slice(0, 2)" :key="item.id" class="pointer-events-none select-none">
                  <ProductCard :product="item" :product-card-settings="form.productCard" :compare-enabled="form.compareEnabled" :interactive="false" />
                </div>
              </div>
            </div>
            <div v-if="previewCardProducts.length" class="mt-5">
              <div class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Mobil preview</div>
              <div class="max-w-[360px] rounded-[1.5rem] border border-dashed border-violet-200 bg-violet-50/40 p-3">
                <div class="grid grid-cols-2 gap-2">
                  <div v-for="item in previewCardProducts.slice(0, 2)" :key="`mobile-${item.id}`" class="pointer-events-none select-none">
                    <ProductCard :product="item" :product-card-settings="form.productCard" :compare-enabled="form.compareEnabled" :interactive="false" />
                  </div>
                </div>
              </div>
            </div>
            <div v-if="previewCardProducts.length" class="mt-5">
              <div class="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Rail preview</div>
              <div class="grid grid-cols-1 gap-3">
                <div v-for="item in previewCardProducts.slice(0, 3)" :key="`rail-${item.id}`" class="pointer-events-none select-none">
                  <ProductCard :product="item" :product-card-settings="form.productCard" :compare-enabled="form.compareEnabled" :interactive="false" />
                </div>
              </div>
            </div>
            <div v-else class="mt-5 rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-6 text-sm font-medium text-gray-500">
              Preview üçün aktiv məhsul tapılmadı.
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div class="text-lg font-extrabold text-gray-900">Collection rails</div>
        <div class="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div v-for="rail in railCards" :key="rail.label" class="rounded-[1.75rem] border border-gray-100 bg-gray-50 p-5">
            <div class="flex items-center justify-between gap-4">
              <div class="text-base font-extrabold text-gray-900">{{ rail.label }}</div>
              <input v-model="rail.model.enabled" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" />
            </div>
            <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label class="space-y-2 md:col-span-2">
                <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Limit</div>
                <input v-model.number="rail.model.limit" type="number" min="1" max="12" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
              </label>
              <label class="space-y-2 md:col-span-2">
                <div class="text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">Selection mode</div>
                <select v-model="rail.model.selectionMode" class="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600">
                  <option value="auto">Auto</option>
                  <option value="manual">Manual pinned products</option>
                </select>
              </label>
              <input v-model="rail.model.title.az" placeholder="Title AZ" class="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
              <input v-model="rail.model.title.ru" placeholder="Title RU" class="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600" />
              <input v-model="rail.model.title.en" placeholder="Title EN" class="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 md:col-span-2" />
              <textarea v-model="rail.model.subtitle.az" rows="2" placeholder="Subtitle AZ" class="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 resize-none"></textarea>
              <textarea v-model="rail.model.subtitle.ru" rows="2" placeholder="Subtitle RU" class="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 resize-none"></textarea>
              <textarea v-model="rail.model.subtitle.en" rows="2" placeholder="Subtitle EN" class="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-600 resize-none md:col-span-2"></textarea>
              <div class="md:col-span-2 rounded-2xl border border-dashed border-gray-200 bg-white p-4">
                <div class="flex items-center justify-between gap-4">
                  <div>
                    <div class="text-sm font-extrabold text-gray-900">Manual product pinning</div>
                    <div class="mt-1 text-xs font-medium text-gray-500">Manual mode seçiləndə bu rail yalnız seçdiyiniz məhsulları göstərir.</div>
                  </div>
                  <div class="text-xs font-bold text-blue-600">Selected: {{ (rail.model.manualProductIds || []).length }}</div>
                </div>
                <div v-if="manualProductPreview(rail.model.manualProductIds || []).length" class="mt-4 flex flex-wrap gap-2">
                  <span v-for="item in manualProductPreview(rail.model.manualProductIds || [])" :key="`${rail.key}-preview-${item.id}`" class="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-700">
                    #{{ item.id }} · {{ item.name }}
                  </span>
                </div>
                <div class="mt-4 max-h-56 space-y-2 overflow-auto pr-1">
                  <label v-for="item in availableProducts.slice(0, 40)" :key="`${rail.key}-${item.id}`" class="flex items-start gap-3 rounded-2xl border border-gray-100 px-3 py-3 text-sm font-medium text-gray-700">
                    <input :checked="(rail.model.manualProductIds || []).includes(item.id)" type="checkbox" class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600" @change="toggleManualProduct(rail.model, item.id)" />
                    <span class="min-w-0">
                      <span class="block font-extrabold text-gray-900">#{{ item.id }} · {{ item.name }}</span>
                      <span class="mt-1 block text-xs text-gray-500">{{ item.category || '-' }} · {{ item.brand || 'Brand yoxdur' }}</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between gap-4">
          <div class="text-lg font-extrabold text-gray-900">Son alert sorğuları</div>
          <button type="button" class="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50" @click="exportAlerts">
            CSV export
          </button>
        </div>
        <div v-if="!alertsSummary.items.length" class="mt-4 text-sm font-medium text-gray-500">Hələ product alert sorğusu yoxdur.</div>
        <div v-else class="mt-5 overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="text-left text-gray-400 uppercase tracking-[0.16em] text-[11px]">
                <th class="px-4 py-3">Məhsul</th>
                <th class="px-4 py-3">Email</th>
                <th class="px-4 py-3">Tip</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Tarix</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in alertsSummary.items" :key="item.id" class="border-t border-gray-100 text-gray-700">
                <td class="px-4 py-4 font-bold">{{ item.productName }}</td>
                <td class="px-4 py-4">{{ item.email }}</td>
                <td class="px-4 py-4">
                  <span :class="['inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold', item.type === 'restock' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700']">
                    {{ item.type === 'restock' ? 'Restock' : 'Price drop' }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <select :value="item.status || 'pending'" class="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:border-blue-600" @change="updateAlertStatus(item.id, (($event.target as HTMLSelectElement).value || 'pending') as any)">
                    <option value="pending">Pending</option>
                    <option value="sent">Sent</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </td>
                <td class="px-4 py-4">{{ item.createdAt }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
