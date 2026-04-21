<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Save, Flame, Sparkles, Crown } from 'lucide-vue-next'
import { useHomeSectionsStore } from '~/stores/homeSections'
import { useProductStore } from '~/stores/products'
import { useToastStore } from '~/stores/toast'

definePageMeta({ layout: 'admin' })

const homeStore = useHomeSectionsStore()
const productStore = useProductStore()
const toastStore = useToastStore()

const saving = ref(false)
const contentLang = ref<'az' | 'ru' | 'en'>('az')

const form = ref({
  ui: {
    cardBorders: false,
    hoverLift: true,
    showRating: true,
    showRatingMobile: true,
    cardSurfaceBg: '#FFFFFF',
    cardImageBg: '#F7F8FA',
    cardBorderColor: '#E5E7EB',
    cardTitleColor: '#0068C9',
    cardPriceColor: '#111827',
    cardMutedColor: '#6B7280',
    cardBadgeBg: '#67B317',
    cardBadgeText: '#FFFFFF',
    cardActionBg: '#FFD200',
    cardActionText: '#111827',
    cardActionHoverBg: '#F4C400',
    cardSoldBarColor: '#E11D48',
    quickActionBg: '#FFFFFF',
    quickActionIcon: '#4B5563',
    countdownBg: '#D71920',
    countdownText: '#FFFFFF'
  },
  promoStrip: {
    enabled: true,
    speedSec: 30,
    itemsI18n: [{ az: '', ru: '', en: '' }, { az: '', ru: '', en: '' }, { az: '', ru: '', en: '' }]
  },
  news: {
    enabled: true,
    days: 7,
    titleI18n: { az: '', ru: '', en: '' },
    badgeI18n: { az: '', ru: '', en: '' }
  },
  topSelling: {
    enabled: true,
    titleI18n: { az: '', ru: '', en: '' },
    categoryIds: [] as number[],
    productLimit: 10,
    showQuickView: false
  },
  topProducts: {
    enabled: true,
    titleI18n: { az: '', ru: '', en: '' },
    productIds: [] as number[]
  },
  featuredCategories: {
    enabled: true,
    titleI18n: { az: '', ru: '', en: '' },
    subtitleI18n: { az: '', ru: '', en: '' },
    limit: 8
  },
  featuredSellers: {
    enabled: true,
    titleI18n: { az: '', ru: '', en: '' },
    subtitleI18n: { az: '', ru: '', en: '' },
    limit: 4
  },
  sellerProducts: {
    enabled: true,
    titleI18n: { az: '', ru: '', en: '' },
    subtitleI18n: { az: '', ru: '', en: '' },
    limit: 8
  },
  trendingNow: {
    enabled: true,
    titleI18n: { az: '', ru: '', en: '' },
    subtitleI18n: { az: '', ru: '', en: '' },
    limit: 4
  },
  popularSearches: {
    enabled: true,
    titleI18n: { az: '', ru: '', en: '' },
    subtitleI18n: { az: '', ru: '', en: '' },
    limit: 8
  },
  shopByBudget: {
    enabled: true,
    titleI18n: { az: '', ru: '', en: '' },
    subtitleI18n: { az: '', ru: '', en: '' },
    cards: [
      { labelI18n: { az: '', ru: '', en: '' }, subtitleI18n: { az: '', ru: '', en: '' }, minPrice: 0, maxPrice: 50, href: '/shop?maxPrice=50' },
      { labelI18n: { az: '', ru: '', en: '' }, subtitleI18n: { az: '', ru: '', en: '' }, minPrice: 50, maxPrice: 150, href: '/shop?minPrice=50&maxPrice=150' }
    ]
  },
  bestRatedProducts: {
    enabled: true,
    titleI18n: { az: '', ru: '', en: '' },
    subtitleI18n: { az: '', ru: '', en: '' },
    limit: 8
  },
  shopByBrand: {
    enabled: true,
    titleI18n: { az: '', ru: '', en: '' },
    subtitleI18n: { az: '', ru: '', en: '' },
    cards: [
      { name: 'Apple', logo: '', href: '/shop?q=Apple' },
      { name: 'Samsung', logo: '', href: '/shop?q=Samsung' }
    ]
  },
  frequentlyBoughtTogether: {
    enabled: true,
    titleI18n: { az: '', ru: '', en: '' },
    subtitleI18n: { az: '', ru: '', en: '' },
    limit: 4
  },
  sellerTrustMetrics: {
    enabled: true,
    titleI18n: { az: '', ru: '', en: '' },
    subtitleI18n: { az: '', ru: '', en: '' },
    limit: 4
  },
  flashDeals: {
    enabled: true,
    titleI18n: { az: '', ru: '', en: '' },
    subtitleI18n: { az: '', ru: '', en: '' },
    ctaLabelI18n: { az: '', ru: '', en: '' }
  },
  verifiedSellers: {
    enabled: true,
    titleI18n: { az: '', ru: '', en: '' },
    subtitleI18n: { az: '', ru: '', en: '' },
    limit: 4
  },
  buyerProtection: {
    enabled: true,
    titleI18n: { az: '', ru: '', en: '' },
    subtitleI18n: { az: '', ru: '', en: '' },
    items: [
      { icon: 'shield', titleI18n: { az: '', ru: '', en: '' }, subtitleI18n: { az: '', ru: '', en: '' } },
      { icon: 'truck', titleI18n: { az: '', ru: '', en: '' }, subtitleI18n: { az: '', ru: '', en: '' } }
    ]
  },
  marketHighlights: {
    enabled: true,
    titleI18n: { az: '', ru: '', en: '' },
    subtitleI18n: { az: '', ru: '', en: '' }
  },
  recentlyViewed: {
    enabled: true,
    titleI18n: { az: '', ru: '', en: '' }
  }
})

const hydrate = () => {
  const cfg: any = homeStore.config
  if (!cfg) return
  form.value.ui.cardBorders = Boolean(cfg.ui?.cardBorders)
  form.value.ui.hoverLift = typeof cfg.ui?.hoverLift === 'boolean' ? cfg.ui.hoverLift : true
  form.value.ui.showRating = typeof cfg.ui?.showRating === 'boolean' ? cfg.ui.showRating : true
  form.value.ui.showRatingMobile = typeof cfg.ui?.showRatingMobile === 'boolean' ? cfg.ui.showRatingMobile : true
  form.value.ui.cardSurfaceBg = String(cfg.ui?.cardSurfaceBg || '#FFFFFF')
  form.value.ui.cardImageBg = String(cfg.ui?.cardImageBg || '#F7F8FA')
  form.value.ui.cardBorderColor = String(cfg.ui?.cardBorderColor || '#E5E7EB')
  form.value.ui.cardTitleColor = String(cfg.ui?.cardTitleColor || '#0068C9')
  form.value.ui.cardPriceColor = String(cfg.ui?.cardPriceColor || '#111827')
  form.value.ui.cardMutedColor = String(cfg.ui?.cardMutedColor || '#6B7280')
  form.value.ui.cardBadgeBg = String(cfg.ui?.cardBadgeBg || '#67B317')
  form.value.ui.cardBadgeText = String(cfg.ui?.cardBadgeText || '#FFFFFF')
  form.value.ui.cardActionBg = String(cfg.ui?.cardActionBg || '#FFD200')
  form.value.ui.cardActionText = String(cfg.ui?.cardActionText || '#111827')
  form.value.ui.cardActionHoverBg = String(cfg.ui?.cardActionHoverBg || '#F4C400')
  form.value.ui.cardSoldBarColor = String(cfg.ui?.cardSoldBarColor || '#E11D48')
  form.value.ui.quickActionBg = String(cfg.ui?.quickActionBg || '#FFFFFF')
  form.value.ui.quickActionIcon = String(cfg.ui?.quickActionIcon || '#4B5563')
  form.value.ui.countdownBg = String(cfg.ui?.countdownBg || '#D71920')
  form.value.ui.countdownText = String(cfg.ui?.countdownText || '#FFFFFF')
  form.value.promoStrip.enabled = typeof cfg.promoStrip?.enabled === 'boolean' ? cfg.promoStrip.enabled : true
  form.value.promoStrip.speedSec = Number(cfg.promoStrip?.speedSec || 30)
  form.value.promoStrip.itemsI18n = Array.isArray(cfg.promoStrip?.itemsI18n) && cfg.promoStrip.itemsI18n.length > 0 ? cfg.promoStrip.itemsI18n.map((x: any) => ({ az: String(x?.az || ''), ru: String(x?.ru || ''), en: String(x?.en || '') })) : [{ az: '', ru: '', en: '' }, { az: '', ru: '', en: '' }, { az: '', ru: '', en: '' }]
  form.value.news.enabled = Boolean(cfg.news?.enabled)
  form.value.news.days = Number(cfg.news?.days || 7)
  form.value.news.titleI18n = { ...cfg.news?.titleI18n }
  form.value.news.badgeI18n = { ...cfg.news?.badgeI18n }
  form.value.topSelling.enabled = Boolean(cfg.topSelling?.enabled)
  form.value.topSelling.titleI18n = { ...cfg.topSelling?.titleI18n }
  form.value.topSelling.categoryIds = Array.isArray(cfg.topSelling?.categoryIds) ? [...cfg.topSelling.categoryIds] : []
  form.value.topSelling.productLimit = Number(cfg.topSelling?.productLimit || 10)
  form.value.topSelling.showQuickView = Boolean(cfg.topSelling?.showQuickView)
  form.value.topProducts.enabled = Boolean(cfg.topProducts?.enabled)
  form.value.topProducts.titleI18n = { ...cfg.topProducts?.titleI18n }
  form.value.topProducts.productIds = Array.isArray(cfg.topProducts?.productIds) ? [...cfg.topProducts.productIds] : []
  form.value.featuredCategories.enabled = typeof cfg.featuredCategories?.enabled === 'boolean' ? cfg.featuredCategories.enabled : true
  form.value.featuredCategories.titleI18n = { ...cfg.featuredCategories?.titleI18n }
  form.value.featuredCategories.subtitleI18n = { ...cfg.featuredCategories?.subtitleI18n }
  form.value.featuredCategories.limit = Number(cfg.featuredCategories?.limit || 8)
  form.value.featuredSellers.enabled = typeof cfg.featuredSellers?.enabled === 'boolean' ? cfg.featuredSellers.enabled : true
  form.value.featuredSellers.titleI18n = { ...cfg.featuredSellers?.titleI18n }
  form.value.featuredSellers.subtitleI18n = { ...cfg.featuredSellers?.subtitleI18n }
  form.value.featuredSellers.limit = Number(cfg.featuredSellers?.limit || 4)
  form.value.sellerProducts.enabled = typeof cfg.sellerProducts?.enabled === 'boolean' ? cfg.sellerProducts.enabled : true
  form.value.sellerProducts.titleI18n = { ...cfg.sellerProducts?.titleI18n }
  form.value.sellerProducts.subtitleI18n = { ...cfg.sellerProducts?.subtitleI18n }
  form.value.sellerProducts.limit = Number(cfg.sellerProducts?.limit || 8)
  form.value.trendingNow.enabled = typeof cfg.trendingNow?.enabled === 'boolean' ? cfg.trendingNow.enabled : true
  form.value.trendingNow.titleI18n = { ...cfg.trendingNow?.titleI18n }
  form.value.trendingNow.subtitleI18n = { ...cfg.trendingNow?.subtitleI18n }
  form.value.trendingNow.limit = Number(cfg.trendingNow?.limit || 4)
  form.value.popularSearches.enabled = typeof cfg.popularSearches?.enabled === 'boolean' ? cfg.popularSearches.enabled : true
  form.value.popularSearches.titleI18n = { ...cfg.popularSearches?.titleI18n }
  form.value.popularSearches.subtitleI18n = { ...cfg.popularSearches?.subtitleI18n }
  form.value.popularSearches.limit = Number(cfg.popularSearches?.limit || 8)
  form.value.shopByBudget.enabled = typeof cfg.shopByBudget?.enabled === 'boolean' ? cfg.shopByBudget.enabled : true
  form.value.shopByBudget.titleI18n = { ...cfg.shopByBudget?.titleI18n }
  form.value.shopByBudget.subtitleI18n = { ...cfg.shopByBudget?.subtitleI18n }
  form.value.shopByBudget.cards = Array.isArray(cfg.shopByBudget?.cards) && cfg.shopByBudget.cards.length > 0 ? cfg.shopByBudget.cards.map((card: any) => ({
    labelI18n: { az: String(card?.labelI18n?.az || ''), ru: String(card?.labelI18n?.ru || ''), en: String(card?.labelI18n?.en || '') },
    subtitleI18n: { az: String(card?.subtitleI18n?.az || ''), ru: String(card?.subtitleI18n?.ru || ''), en: String(card?.subtitleI18n?.en || '') },
    minPrice: Number(card?.minPrice || 0),
    maxPrice: Number(card?.maxPrice || 0),
    href: String(card?.href || '/shop')
  })) : [...form.value.shopByBudget.cards]
  form.value.bestRatedProducts.enabled = typeof cfg.bestRatedProducts?.enabled === 'boolean' ? cfg.bestRatedProducts.enabled : true
  form.value.bestRatedProducts.titleI18n = { ...cfg.bestRatedProducts?.titleI18n }
  form.value.bestRatedProducts.subtitleI18n = { ...cfg.bestRatedProducts?.subtitleI18n }
  form.value.bestRatedProducts.limit = Number(cfg.bestRatedProducts?.limit || 8)
  form.value.shopByBrand.enabled = typeof cfg.shopByBrand?.enabled === 'boolean' ? cfg.shopByBrand.enabled : true
  form.value.shopByBrand.titleI18n = { ...cfg.shopByBrand?.titleI18n }
  form.value.shopByBrand.subtitleI18n = { ...cfg.shopByBrand?.subtitleI18n }
  form.value.shopByBrand.cards = Array.isArray(cfg.shopByBrand?.cards) && cfg.shopByBrand.cards.length > 0 ? cfg.shopByBrand.cards.map((card: any) => ({
    name: String(card?.name || ''),
    logo: String(card?.logo || ''),
    href: String(card?.href || '/shop')
  })) : [...form.value.shopByBrand.cards]
  form.value.frequentlyBoughtTogether.enabled = typeof cfg.frequentlyBoughtTogether?.enabled === 'boolean' ? cfg.frequentlyBoughtTogether.enabled : true
  form.value.frequentlyBoughtTogether.titleI18n = { ...cfg.frequentlyBoughtTogether?.titleI18n }
  form.value.frequentlyBoughtTogether.subtitleI18n = { ...cfg.frequentlyBoughtTogether?.subtitleI18n }
  form.value.frequentlyBoughtTogether.limit = Number(cfg.frequentlyBoughtTogether?.limit || 4)
  form.value.sellerTrustMetrics.enabled = typeof cfg.sellerTrustMetrics?.enabled === 'boolean' ? cfg.sellerTrustMetrics.enabled : true
  form.value.sellerTrustMetrics.titleI18n = { ...cfg.sellerTrustMetrics?.titleI18n }
  form.value.sellerTrustMetrics.subtitleI18n = { ...cfg.sellerTrustMetrics?.subtitleI18n }
  form.value.sellerTrustMetrics.limit = Number(cfg.sellerTrustMetrics?.limit || 4)
  form.value.flashDeals.enabled = typeof cfg.flashDeals?.enabled === 'boolean' ? cfg.flashDeals.enabled : true
  form.value.flashDeals.titleI18n = { ...cfg.flashDeals?.titleI18n }
  form.value.flashDeals.subtitleI18n = { ...cfg.flashDeals?.subtitleI18n }
  form.value.flashDeals.ctaLabelI18n = { ...cfg.flashDeals?.ctaLabelI18n }
  form.value.verifiedSellers.enabled = typeof cfg.verifiedSellers?.enabled === 'boolean' ? cfg.verifiedSellers.enabled : true
  form.value.verifiedSellers.titleI18n = { ...cfg.verifiedSellers?.titleI18n }
  form.value.verifiedSellers.subtitleI18n = { ...cfg.verifiedSellers?.subtitleI18n }
  form.value.verifiedSellers.limit = Number(cfg.verifiedSellers?.limit || 4)
  form.value.buyerProtection.enabled = typeof cfg.buyerProtection?.enabled === 'boolean' ? cfg.buyerProtection.enabled : true
  form.value.buyerProtection.titleI18n = { ...cfg.buyerProtection?.titleI18n }
  form.value.buyerProtection.subtitleI18n = { ...cfg.buyerProtection?.subtitleI18n }
  form.value.buyerProtection.items = Array.isArray(cfg.buyerProtection?.items) && cfg.buyerProtection.items.length > 0 ? cfg.buyerProtection.items.map((item: any) => ({
    icon: String(item?.icon || 'shield'),
    titleI18n: { az: String(item?.titleI18n?.az || ''), ru: String(item?.titleI18n?.ru || ''), en: String(item?.titleI18n?.en || '') },
    subtitleI18n: { az: String(item?.subtitleI18n?.az || ''), ru: String(item?.subtitleI18n?.ru || ''), en: String(item?.subtitleI18n?.en || '') }
  })) : [...form.value.buyerProtection.items]
  form.value.marketHighlights.enabled = typeof cfg.marketHighlights?.enabled === 'boolean' ? cfg.marketHighlights.enabled : true
  form.value.marketHighlights.titleI18n = { ...cfg.marketHighlights?.titleI18n }
  form.value.marketHighlights.subtitleI18n = { ...cfg.marketHighlights?.subtitleI18n }
  form.value.recentlyViewed.enabled = Boolean(cfg.recentlyViewed?.enabled)
  form.value.recentlyViewed.titleI18n = { ...cfg.recentlyViewed?.titleI18n }
}

const products = computed(() => productStore.products)

const toggleProduct = (id: number) => {
  const idx = form.value.topProducts.productIds.indexOf(id)
  if (idx === -1) form.value.topProducts.productIds.push(id)
  else form.value.topProducts.productIds.splice(idx, 1)
}

const addPromoItem = () => {
  form.value.promoStrip.itemsI18n.push({ az: '', ru: '', en: '' })
}

const removePromoItem = (idx: number) => {
  form.value.promoStrip.itemsI18n.splice(idx, 1)
  if (form.value.promoStrip.itemsI18n.length === 0) form.value.promoStrip.itemsI18n.push({ az: '', ru: '', en: '' })
}

const addBudgetCard = () => {
  form.value.shopByBudget.cards.push({ labelI18n: { az: '', ru: '', en: '' }, subtitleI18n: { az: '', ru: '', en: '' }, minPrice: 0, maxPrice: 0, href: '/shop' })
}

const removeBudgetCard = (idx: number) => {
  form.value.shopByBudget.cards.splice(idx, 1)
}

const addBrandCard = () => {
  form.value.shopByBrand.cards.push({ name: '', logo: '', href: '/shop' })
}

const removeBrandCard = (idx: number) => {
  form.value.shopByBrand.cards.splice(idx, 1)
}

const addBuyerProtectionItem = () => {
  form.value.buyerProtection.items.push({ icon: 'shield', titleI18n: { az: '', ru: '', en: '' }, subtitleI18n: { az: '', ru: '', en: '' } })
}

const removeBuyerProtectionItem = (idx: number) => {
  form.value.buyerProtection.items.splice(idx, 1)
}

const jumpToBlock = (blockId: string) => {
  if (!process.client) return
  document.getElementById(blockId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const save = async () => {
  if (saving.value) return
  saving.value = true
  try {
    await homeStore.saveConfig({
      ui: form.value.ui,
      promoStrip: form.value.promoStrip,
      news: form.value.news,
      topSelling: form.value.topSelling,
      topProducts: form.value.topProducts,
      featuredCategories: form.value.featuredCategories,
      featuredSellers: form.value.featuredSellers,
      sellerProducts: form.value.sellerProducts,
      trendingNow: form.value.trendingNow,
      popularSearches: form.value.popularSearches,
      shopByBudget: form.value.shopByBudget,
      bestRatedProducts: form.value.bestRatedProducts,
      shopByBrand: form.value.shopByBrand,
      frequentlyBoughtTogether: form.value.frequentlyBoughtTogether,
      sellerTrustMetrics: form.value.sellerTrustMetrics,
      flashDeals: form.value.flashDeals,
      verifiedSellers: form.value.verifiedSellers,
      buyerProtection: form.value.buyerProtection,
      marketHighlights: form.value.marketHighlights,
      recentlyViewed: form.value.recentlyViewed
    })
    toastStore.success('Yadda saxlanıldı')
  } catch {
    toastStore.error('Yadda saxlanılmadı')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!homeStore.hydrated) await homeStore.fetchConfig()
  if (!productStore.hydrated) await productStore.fetchProducts()
  hydrate()
})
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Ana Səhifə Bölmələri</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Yeniliklər və Top Məhsullar kimi blokları idarə edin.</p>
      </div>
      <button type="button" @click="save" :disabled="saving" :class="['px-8 py-3 rounded-2xl font-bold transition-all flex items-center justify-center', saving ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200']">
        <Save class="w-5 h-5 mr-2" /> {{ saving ? 'Yadda saxlanılır…' : 'Yadda saxla' }}
      </button>
    </div>

    <div class="flex flex-wrap gap-3">
      <button type="button" class="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-800" @click="jumpToBlock('featured-categories-editor')">
        Seçilmiş kateqoriyalar
      </button>
      <button type="button" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-rose-800" @click="jumpToBlock('flash-deals-editor')">
        Flash deals
      </button>
      <button type="button" class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-amber-800" @click="jumpToBlock('shop-by-brand-editor')">
        Brendə görə alış-veriş
      </button>
    </div>

    <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-10">
      <div class="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5">
        <div>
          <div class="text-sm font-bold text-gray-900">Kart sərhədləri</div>
          <div class="text-xs text-gray-500 font-medium">Məhsul kartlarında border istifadə olunsun.</div>
        </div>
        <label class="inline-flex items-center cursor-pointer">
          <input v-model="form.ui.cardBorders" type="checkbox" class="sr-only peer" />
          <div class="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-all">
            <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
          </div>
        </label>
      </div>

      <div class="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5">
        <div>
          <div class="text-sm font-bold text-gray-900">Hover lift</div>
          <div class="text-xs text-gray-500 font-medium">Kartın üstünə gələndə yuxarı qalxma effekti.</div>
        </div>
        <label class="inline-flex items-center cursor-pointer">
          <input v-model="form.ui.hoverLift" type="checkbox" class="sr-only peer" />
          <div class="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-all">
            <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
          </div>
        </label>
      </div>

      <div class="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5">
        <div>
          <div class="text-sm font-bold text-gray-900">Reytinqi göstər</div>
          <div class="text-xs text-gray-500 font-medium">Məhsul kartlarında reytinq bölməsi görünsün.</div>
        </div>
        <label class="inline-flex items-center cursor-pointer">
          <input v-model="form.ui.showRating" type="checkbox" class="sr-only peer" />
          <div class="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-all">
            <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
          </div>
        </label>
      </div>

      <div class="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5">
        <div>
          <div class="text-sm font-bold text-gray-900">Mobil reytinqi göstər</div>
          <div class="text-xs text-gray-500 font-medium">Telefon görünüşündə reytinq ayrıca göstərilsin və ya gizlənsin.</div>
        </div>
        <label class="inline-flex items-center cursor-pointer">
          <input v-model="form.ui.showRatingMobile" type="checkbox" class="sr-only peer" />
          <div class="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-all">
            <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
          </div>
        </label>
      </div>

      <div class="bg-gray-50 border border-gray-100 rounded-[2rem] p-6 space-y-6">
        <div>
          <div class="text-sm font-bold text-gray-900">Məhsul kartı rəngləri</div>
          <div class="text-xs text-gray-500 font-medium mt-1">Kartlar, hover düymələri, badge və countdown rənglərini buradan dəyişə bilərsiniz.</div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Kart fonu</label>
            <div class="flex items-center gap-4">
              <input v-model="form.ui.cardSurfaceBg" type="color" class="w-14 h-12 p-1 rounded-2xl bg-white border border-gray-100" />
              <input v-model="form.ui.cardSurfaceBg" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-white border border-gray-200 focus:border-blue-600 outline-none transition-all font-medium" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Şəkil fonu</label>
            <div class="flex items-center gap-4">
              <input v-model="form.ui.cardImageBg" type="color" class="w-14 h-12 p-1 rounded-2xl bg-white border border-gray-100" />
              <input v-model="form.ui.cardImageBg" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-white border border-gray-200 focus:border-blue-600 outline-none transition-all font-medium" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Kart border</label>
            <div class="flex items-center gap-4">
              <input v-model="form.ui.cardBorderColor" type="color" class="w-14 h-12 p-1 rounded-2xl bg-white border border-gray-100" />
              <input v-model="form.ui.cardBorderColor" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-white border border-gray-200 focus:border-blue-600 outline-none transition-all font-medium" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Başlıq rəngi</label>
            <div class="flex items-center gap-4">
              <input v-model="form.ui.cardTitleColor" type="color" class="w-14 h-12 p-1 rounded-2xl bg-white border border-gray-100" />
              <input v-model="form.ui.cardTitleColor" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-white border border-gray-200 focus:border-blue-600 outline-none transition-all font-medium" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Qiymət rəngi</label>
            <div class="flex items-center gap-4">
              <input v-model="form.ui.cardPriceColor" type="color" class="w-14 h-12 p-1 rounded-2xl bg-white border border-gray-100" />
              <input v-model="form.ui.cardPriceColor" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-white border border-gray-200 focus:border-blue-600 outline-none transition-all font-medium" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Köməkçi mətn</label>
            <div class="flex items-center gap-4">
              <input v-model="form.ui.cardMutedColor" type="color" class="w-14 h-12 p-1 rounded-2xl bg-white border border-gray-100" />
              <input v-model="form.ui.cardMutedColor" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-white border border-gray-200 focus:border-blue-600 outline-none transition-all font-medium" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Endirim badge fonu</label>
            <div class="flex items-center gap-4">
              <input v-model="form.ui.cardBadgeBg" type="color" class="w-14 h-12 p-1 rounded-2xl bg-white border border-gray-100" />
              <input v-model="form.ui.cardBadgeBg" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-white border border-gray-200 focus:border-blue-600 outline-none transition-all font-medium" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Endirim badge yazısı</label>
            <div class="flex items-center gap-4">
              <input v-model="form.ui.cardBadgeText" type="color" class="w-14 h-12 p-1 rounded-2xl bg-white border border-gray-100" />
              <input v-model="form.ui.cardBadgeText" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-white border border-gray-200 focus:border-blue-600 outline-none transition-all font-medium" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Səbət düyməsi fonu</label>
            <div class="flex items-center gap-4">
              <input v-model="form.ui.cardActionBg" type="color" class="w-14 h-12 p-1 rounded-2xl bg-white border border-gray-100" />
              <input v-model="form.ui.cardActionBg" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-white border border-gray-200 focus:border-blue-600 outline-none transition-all font-medium" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Səbət düyməsi yazısı</label>
            <div class="flex items-center gap-4">
              <input v-model="form.ui.cardActionText" type="color" class="w-14 h-12 p-1 rounded-2xl bg-white border border-gray-100" />
              <input v-model="form.ui.cardActionText" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-white border border-gray-200 focus:border-blue-600 outline-none transition-all font-medium" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Səbət hover fonu</label>
            <div class="flex items-center gap-4">
              <input v-model="form.ui.cardActionHoverBg" type="color" class="w-14 h-12 p-1 rounded-2xl bg-white border border-gray-100" />
              <input v-model="form.ui.cardActionHoverBg" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-white border border-gray-200 focus:border-blue-600 outline-none transition-all font-medium" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Sold progress rəngi</label>
            <div class="flex items-center gap-4">
              <input v-model="form.ui.cardSoldBarColor" type="color" class="w-14 h-12 p-1 rounded-2xl bg-white border border-gray-100" />
              <input v-model="form.ui.cardSoldBarColor" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-white border border-gray-200 focus:border-blue-600 outline-none transition-all font-medium" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Yan düymələr fonu</label>
            <div class="flex items-center gap-4">
              <input v-model="form.ui.quickActionBg" type="color" class="w-14 h-12 p-1 rounded-2xl bg-white border border-gray-100" />
              <input v-model="form.ui.quickActionBg" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-white border border-gray-200 focus:border-blue-600 outline-none transition-all font-medium" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Yan düymələr ikon rəngi</label>
            <div class="flex items-center gap-4">
              <input v-model="form.ui.quickActionIcon" type="color" class="w-14 h-12 p-1 rounded-2xl bg-white border border-gray-100" />
              <input v-model="form.ui.quickActionIcon" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-white border border-gray-200 focus:border-blue-600 outline-none transition-all font-medium" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Countdown fonu</label>
            <div class="flex items-center gap-4">
              <input v-model="form.ui.countdownBg" type="color" class="w-14 h-12 p-1 rounded-2xl bg-white border border-gray-100" />
              <input v-model="form.ui.countdownBg" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-white border border-gray-200 focus:border-blue-600 outline-none transition-all font-medium" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Countdown yazısı</label>
            <div class="flex items-center gap-4">
              <input v-model="form.ui.countdownText" type="color" class="w-14 h-12 p-1 rounded-2xl bg-white border border-gray-100" />
              <input v-model="form.ui.countdownText" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-white border border-gray-200 focus:border-blue-600 outline-none transition-all font-medium" />
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-100 pt-10 space-y-6">
        <div class="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5">
          <div>
            <div class="text-sm font-bold text-gray-900">Promo zolaq</div>
            <div class="text-xs text-gray-500 font-medium">Home-da “free delivery” tipli zolaq.</div>
          </div>
          <label class="inline-flex items-center cursor-pointer">
            <input v-model="form.promoStrip.enabled" type="checkbox" class="sr-only peer" />
            <div class="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-all">
              <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
            </div>
          </label>
        </div>
        <div>
          <div class="flex gap-2 mb-3">
            <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'az' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'az'">AZ</button>
            <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'ru' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'ru'">RU</button>
            <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'en' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'en'">EN</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Sürət (saniyə)</label>
              <input v-model.number="form.promoStrip.speedSec" type="number" min="10" max="120" class="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
            </div>
            <div class="md:col-span-2 flex items-center justify-end gap-3">
              <button type="button" class="px-5 py-3 rounded-2xl bg-gray-900 text-white font-extrabold text-xs hover:bg-black transition-all" @click="addPromoItem">Yeni sətir</button>
            </div>
          </div>

          <div class="space-y-4">
            <div v-for="(it, idx) in form.promoStrip.itemsI18n" :key="idx" class="flex items-center gap-3">
              <input v-model="it[contentLang]" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
              <button type="button" class="px-4 py-4 rounded-2xl border border-gray-200 bg-white text-gray-800 font-extrabold text-xs hover:bg-gray-50 transition-all" @click="removePromoItem(idx)">Sil</button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <Flame class="w-6 h-6 text-blue-600" />
        <h2 class="text-xl font-extrabold text-gray-900">Yeniliklər</h2>
      </div>

      <div class="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5">
        <div>
          <div class="text-sm font-bold text-gray-900">Bölmə aktivdir</div>
          <div class="text-xs text-gray-500 font-medium">Yeni əlavə edilən məhsullar 7 gün görünəcək.</div>
        </div>
        <label class="inline-flex items-center cursor-pointer">
          <input v-model="form.news.enabled" type="checkbox" class="sr-only peer" />
          <div class="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-all">
            <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
          </div>
        </label>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Gün sayı</label>
          <input v-model.number="form.news.days" type="number" min="1" max="30" class="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
        </div>
        <div class="md:col-span-2">
          <div class="flex gap-2 mb-3">
            <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'az' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'az'">AZ</button>
            <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'ru' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'ru'">RU</button>
            <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'en' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'en'">EN</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Başlıq</label>
              <input v-model="form.news.titleI18n[contentLang]" type="text" class="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Badge</label>
              <input v-model="form.news.badgeI18n[contentLang]" type="text" class="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-100 pt-10 space-y-10">
        <div class="flex items-center gap-3">
          <Crown class="w-6 h-6 text-blue-600" />
          <h2 class="text-xl font-extrabold text-gray-900">Top Selling</h2>
        </div>

        <div class="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5">
          <div>
            <div class="text-sm font-bold text-gray-900">Bölmə aktivdir</div>
            <div class="text-xs text-gray-500 font-medium">Ən çox satılan məhsullar slider kimi göstəriləcək.</div>
          </div>
          <label class="inline-flex items-center cursor-pointer">
            <input v-model="form.topSelling.enabled" type="checkbox" class="sr-only peer" />
            <div class="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-all">
              <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
            </div>
          </label>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="md:col-span-2">
            <div class="flex gap-2 mb-3">
              <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'az' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'az'">AZ</button>
              <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'ru' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'ru'">RU</button>
              <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'en' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'en'">EN</button>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Başlıq</label>
              <input v-model="form.topSelling.titleI18n[contentLang]" type="text" class="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Limit</label>
            <input v-model.number="form.topSelling.productLimit" type="number" min="1" max="40" class="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
          </div>
          <div class="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 md:col-span-3">
            <div>
              <div class="text-sm font-bold text-gray-900">Quick view</div>
              <div class="text-xs text-gray-500 font-medium">Kart üzərində “göz” düyməsi.</div>
            </div>
            <label class="inline-flex items-center cursor-pointer">
              <input v-model="form.topSelling.showQuickView" type="checkbox" class="sr-only peer" />
              <div class="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-all">
                <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <Sparkles class="w-6 h-6 text-blue-600" />
          <h2 class="text-xl font-extrabold text-gray-900">Əvvəl baxdıqlarınız</h2>
        </div>

        <div class="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5">
          <div>
            <div class="text-sm font-bold text-gray-900">Bölmə aktivdir</div>
            <div class="text-xs text-gray-500 font-medium">Cihazda baxılan məhsullar home-da görünəcək.</div>
          </div>
          <label class="inline-flex items-center cursor-pointer">
            <input v-model="form.recentlyViewed.enabled" type="checkbox" class="sr-only peer" />
            <div class="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-all">
              <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
            </div>
          </label>
        </div>

        <div>
          <div class="flex gap-2 mb-3">
            <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'az' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'az'">AZ</button>
            <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'ru' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'ru'">RU</button>
            <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'en' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'en'">EN</button>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Başlıq</label>
            <input v-model="form.recentlyViewed.titleI18n[contentLang]" type="text" class="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
          </div>
        </div>

        <div class="flex items-center gap-3">
          <Crown class="w-6 h-6 text-blue-600" />
          <h2 class="text-xl font-extrabold text-gray-900">Top Məhsullar</h2>
        </div>

        <div class="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5">
          <div>
            <div class="text-sm font-bold text-gray-900">Bölmə aktivdir</div>
            <div class="text-xs text-gray-500 font-medium">Seçilmiş məhsullar home-da görünəcək.</div>
          </div>
          <label class="inline-flex items-center cursor-pointer">
            <input v-model="form.topProducts.enabled" type="checkbox" class="sr-only peer" />
            <div class="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-all">
              <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
            </div>
          </label>
        </div>

        <div>
          <div class="flex gap-2 mb-3">
            <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'az' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'az'">AZ</button>
            <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'ru' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'ru'">RU</button>
            <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'en' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'en'">EN</button>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Başlıq</label>
            <input v-model="form.topProducts.titleI18n[contentLang]" type="text" class="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Sparkles class="w-5 h-5 text-blue-600" />
              <div class="text-sm font-bold text-gray-900">Top məhsulları seç</div>
            </div>
            <div class="text-xs font-bold text-gray-400">Seçilən: {{ form.topProducts.productIds.length }}</div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <button v-for="p in products" :key="p.id" type="button" @click="toggleProduct(p.id)" :class="['p-4 rounded-2xl border text-left transition-all flex items-center gap-4', form.topProducts.productIds.includes(p.id) ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 bg-white hover:bg-gray-50']">
              <div class="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                <img :src="p.image" :alt="p.name" class="w-full h-full object-contain" />
              </div>
              <div class="min-w-0">
                <div class="text-sm font-bold text-gray-900 truncate">{{ p.name }}</div>
                <div class="text-[10px] text-gray-500 font-medium truncate">{{ p.category }}</div>
              </div>
            </button>
          </div>
        </div>

        <div class="border-t border-gray-100 pt-10 space-y-8">
          <div class="flex items-center gap-3">
            <Sparkles class="w-6 h-6 text-blue-600" />
            <h2 class="text-xl font-extrabold text-gray-900">Modern home blokları</h2>
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div id="featured-categories-editor" class="rounded-[2rem] border border-gray-100 p-6 space-y-5">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-lg font-extrabold text-gray-900">Seçilmiş kateqoriyalar</div>
                  <div class="text-sm text-gray-500 font-medium mt-1">Kreativ kateqoriya mosaic bloku.</div>
                </div>
                <input v-model="form.featuredCategories.enabled" type="checkbox" class="w-5 h-5" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-[1fr,120px] gap-4">
                <input v-model="form.featuredCategories.titleI18n[contentLang]" type="text" placeholder="Başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
                <input v-model.number="form.featuredCategories.limit" type="number" min="1" max="12" placeholder="Limit" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
              </div>
              <textarea v-model="form.featuredCategories.subtitleI18n[contentLang]" rows="3" placeholder="Alt başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium resize-none"></textarea>
            </div>

            <div class="rounded-[2rem] border border-gray-100 p-6 space-y-5">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-lg font-extrabold text-gray-900">Seçilmiş mağazalar</div>
                  <div class="text-sm text-gray-500 font-medium mt-1">Premium satıcı vitrin bloku.</div>
                </div>
                <input v-model="form.featuredSellers.enabled" type="checkbox" class="w-5 h-5" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-[1fr,120px] gap-4">
                <input v-model="form.featuredSellers.titleI18n[contentLang]" type="text" placeholder="Başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
                <input v-model.number="form.featuredSellers.limit" type="number" min="1" max="12" placeholder="Limit" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
              </div>
              <textarea v-model="form.featuredSellers.subtitleI18n[contentLang]" rows="3" placeholder="Alt başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium resize-none"></textarea>
            </div>

            <div class="rounded-[2rem] border border-gray-100 p-6 space-y-5">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-lg font-extrabold text-gray-900">Satıcı məhsulları vitrini</div>
                  <div class="text-sm text-gray-500 font-medium mt-1">Mağaza məhsullarını modern grid ilə göstərir.</div>
                </div>
                <input v-model="form.sellerProducts.enabled" type="checkbox" class="w-5 h-5" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-[1fr,120px] gap-4">
                <input v-model="form.sellerProducts.titleI18n[contentLang]" type="text" placeholder="Başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
                <input v-model.number="form.sellerProducts.limit" type="number" min="1" max="16" placeholder="Limit" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
              </div>
              <textarea v-model="form.sellerProducts.subtitleI18n[contentLang]" rows="3" placeholder="Alt başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium resize-none"></textarea>
            </div>

            <div class="rounded-[2rem] border border-gray-100 p-6 space-y-5">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-lg font-extrabold text-gray-900">İndi trenddə</div>
                  <div class="text-sm text-gray-500 font-medium mt-1">Ən çox baxılan məhsullar üçün modern kart bloku.</div>
                </div>
                <input v-model="form.trendingNow.enabled" type="checkbox" class="w-5 h-5" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-[1fr,120px] gap-4">
                <input v-model="form.trendingNow.titleI18n[contentLang]" type="text" placeholder="Başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
                <input v-model.number="form.trendingNow.limit" type="number" min="1" max="8" placeholder="Limit" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
              </div>
              <textarea v-model="form.trendingNow.subtitleI18n[contentLang]" rows="3" placeholder="Alt başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium resize-none"></textarea>
            </div>

            <div class="rounded-[2rem] border border-gray-100 p-6 space-y-5">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-lg font-extrabold text-gray-900">Populyar axtarışlar</div>
                  <div class="text-sm text-gray-500 font-medium mt-1">Search intelligence datası ilə canlı axtarış çipləri.</div>
                </div>
                <input v-model="form.popularSearches.enabled" type="checkbox" class="w-5 h-5" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-[1fr,120px] gap-4">
                <input v-model="form.popularSearches.titleI18n[contentLang]" type="text" placeholder="Başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
                <input v-model.number="form.popularSearches.limit" type="number" min="1" max="12" placeholder="Limit" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
              </div>
              <textarea v-model="form.popularSearches.subtitleI18n[contentLang]" rows="3" placeholder="Alt başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium resize-none"></textarea>
            </div>

            <div class="rounded-[2rem] border border-gray-100 p-6 space-y-5">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-lg font-extrabold text-gray-900">Ən yüksək reytinqli məhsullar</div>
                  <div class="text-sm text-gray-500 font-medium mt-1">Reytinq və satış datasına görə seçilən məhsullar.</div>
                </div>
                <input v-model="form.bestRatedProducts.enabled" type="checkbox" class="w-5 h-5" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-[1fr,120px] gap-4">
                <input v-model="form.bestRatedProducts.titleI18n[contentLang]" type="text" placeholder="Başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
                <input v-model.number="form.bestRatedProducts.limit" type="number" min="1" max="12" placeholder="Limit" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
              </div>
              <textarea v-model="form.bestRatedProducts.subtitleI18n[contentLang]" rows="3" placeholder="Alt başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium resize-none"></textarea>
            </div>

            <div id="shop-by-brand-editor" class="rounded-[2rem] border border-gray-100 p-6 space-y-5 xl:col-span-2">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-lg font-extrabold text-gray-900">Brendə görə alış-veriş</div>
                  <div class="text-sm text-gray-500 font-medium mt-1">Homepage-də logo əsaslı brand keçidləri.</div>
                </div>
                <div class="flex items-center gap-3">
                  <button type="button" @click="addBrandCard" class="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-extrabold text-gray-700">Brend əlavə et</button>
                  <input v-model="form.shopByBrand.enabled" type="checkbox" class="w-5 h-5" />
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input v-model="form.shopByBrand.titleI18n[contentLang]" type="text" placeholder="Başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
                <textarea v-model="form.shopByBrand.subtitleI18n[contentLang]" rows="3" placeholder="Alt başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium resize-none"></textarea>
              </div>
              <div class="space-y-4">
                <div v-for="(card, idx) in form.shopByBrand.cards" :key="`brand-${idx}`" class="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-4">
                  <div class="flex items-center justify-between">
                    <div class="text-sm font-extrabold text-gray-900">Brand kartı {{ idx + 1 }}</div>
                    <button type="button" @click="removeBrandCard(idx)" class="text-xs font-extrabold uppercase tracking-[0.14em] text-red-600">Sil</button>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input v-model="card.name" type="text" placeholder="Brand adı" class="w-full px-5 py-4 rounded-2xl bg-white border border-transparent focus:border-blue-600 outline-none transition-all font-medium" />
                    <input v-model="card.logo" type="text" placeholder="Logo URL" class="w-full px-5 py-4 rounded-2xl bg-white border border-transparent focus:border-blue-600 outline-none transition-all font-medium" />
                    <input v-model="card.href" type="text" placeholder="/shop?q=Apple" class="w-full px-5 py-4 rounded-2xl bg-white border border-transparent focus:border-blue-600 outline-none transition-all font-medium" />
                  </div>
                </div>
              </div>
            </div>

            <div id="flash-deals-editor" class="rounded-[2rem] border border-gray-100 p-6 space-y-5">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-lg font-extrabold text-gray-900">Birlikdə tez-tez alınır</div>
                  <div class="text-sm text-gray-500 font-medium mt-1">Sifariş tarixçəsinə görə məhsul cütlükləri.</div>
                </div>
                <input v-model="form.frequentlyBoughtTogether.enabled" type="checkbox" class="w-5 h-5" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-[1fr,120px] gap-4">
                <input v-model="form.frequentlyBoughtTogether.titleI18n[contentLang]" type="text" placeholder="Başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
                <input v-model.number="form.frequentlyBoughtTogether.limit" type="number" min="1" max="8" placeholder="Limit" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
              </div>
              <textarea v-model="form.frequentlyBoughtTogether.subtitleI18n[contentLang]" rows="3" placeholder="Alt başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium resize-none"></textarea>
            </div>

            <div class="rounded-[2rem] border border-gray-100 p-6 space-y-5">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-lg font-extrabold text-gray-900">Satıcı etibar göstəriciləri</div>
                  <div class="text-sm text-gray-500 font-medium mt-1">Sifariş, stok və verification əsasında trust score.</div>
                </div>
                <input v-model="form.sellerTrustMetrics.enabled" type="checkbox" class="w-5 h-5" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-[1fr,120px] gap-4">
                <input v-model="form.sellerTrustMetrics.titleI18n[contentLang]" type="text" placeholder="Başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
                <input v-model.number="form.sellerTrustMetrics.limit" type="number" min="1" max="8" placeholder="Limit" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
              </div>
              <textarea v-model="form.sellerTrustMetrics.subtitleI18n[contentLang]" rows="3" placeholder="Alt başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium resize-none"></textarea>
            </div>

            <div class="rounded-[2rem] border border-gray-100 p-6 space-y-5">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-lg font-extrabold text-gray-900">Flash deals spotlight</div>
                  <div class="text-sm text-gray-500 font-medium mt-1">Top deals admin datasına bağlanan xüsusi countdown vitrin.</div>
                </div>
                <input v-model="form.flashDeals.enabled" type="checkbox" class="w-5 h-5" />
              </div>
              <input v-model="form.flashDeals.titleI18n[contentLang]" type="text" placeholder="Başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
              <textarea v-model="form.flashDeals.subtitleI18n[contentLang]" rows="3" placeholder="Alt başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium resize-none"></textarea>
              <input v-model="form.flashDeals.ctaLabelI18n[contentLang]" type="text" placeholder="CTA" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
            </div>

            <div class="rounded-[2rem] border border-gray-100 p-6 space-y-5">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-lg font-extrabold text-gray-900">Yoxlanılmış mağazalar</div>
                  <div class="text-sm text-gray-500 font-medium mt-1">PRO / featured mağazaları ayrıca önə çıxarır.</div>
                </div>
                <input v-model="form.verifiedSellers.enabled" type="checkbox" class="w-5 h-5" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-[1fr,120px] gap-4">
                <input v-model="form.verifiedSellers.titleI18n[contentLang]" type="text" placeholder="Başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
                <input v-model.number="form.verifiedSellers.limit" type="number" min="1" max="12" placeholder="Limit" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
              </div>
              <textarea v-model="form.verifiedSellers.subtitleI18n[contentLang]" rows="3" placeholder="Alt başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium resize-none"></textarea>
            </div>

            <div class="rounded-[2rem] border border-gray-100 p-6 space-y-5 xl:col-span-2">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-lg font-extrabold text-gray-900">Büdcəyə görə alış-veriş</div>
                  <div class="text-sm text-gray-500 font-medium mt-1">Qiymət intervalları üzrə birbaşa shop keçidləri.</div>
                </div>
                <div class="flex items-center gap-3">
                  <button type="button" @click="addBudgetCard" class="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-extrabold text-gray-700">Kart əlavə et</button>
                  <input v-model="form.shopByBudget.enabled" type="checkbox" class="w-5 h-5" />
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input v-model="form.shopByBudget.titleI18n[contentLang]" type="text" placeholder="Başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
                <textarea v-model="form.shopByBudget.subtitleI18n[contentLang]" rows="3" placeholder="Alt başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium resize-none"></textarea>
              </div>
              <div class="space-y-4">
                <div v-for="(card, idx) in form.shopByBudget.cards" :key="`budget-${idx}`" class="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-4">
                  <div class="flex items-center justify-between">
                    <div class="text-sm font-extrabold text-gray-900">Büdcə kartı {{ idx + 1 }}</div>
                    <button type="button" @click="removeBudgetCard(idx)" class="text-xs font-extrabold uppercase tracking-[0.14em] text-red-600">Sil</button>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input v-model="card.labelI18n[contentLang]" type="text" placeholder="Label" class="w-full px-5 py-4 rounded-2xl bg-white border border-transparent focus:border-blue-600 outline-none transition-all font-medium" />
                    <input v-model="card.subtitleI18n[contentLang]" type="text" placeholder="Alt mətn" class="w-full px-5 py-4 rounded-2xl bg-white border border-transparent focus:border-blue-600 outline-none transition-all font-medium" />
                    <input v-model.number="card.minPrice" type="number" min="0" placeholder="Min qiymət" class="w-full px-5 py-4 rounded-2xl bg-white border border-transparent focus:border-blue-600 outline-none transition-all font-medium" />
                    <input v-model.number="card.maxPrice" type="number" min="0" placeholder="Max qiymət (0 = limitsiz)" class="w-full px-5 py-4 rounded-2xl bg-white border border-transparent focus:border-blue-600 outline-none transition-all font-medium" />
                  </div>
                  <input v-model="card.href" type="text" placeholder="/shop?minPrice=..." class="w-full px-5 py-4 rounded-2xl bg-white border border-transparent focus:border-blue-600 outline-none transition-all font-medium" />
                </div>
              </div>
            </div>

            <div class="rounded-[2rem] border border-gray-100 p-6 space-y-5 xl:col-span-2">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-lg font-extrabold text-gray-900">Alıcı qorunması</div>
                  <div class="text-sm text-gray-500 font-medium mt-1">Marketplace etibar və təhlükəsizlik üstünlükləri.</div>
                </div>
                <div class="flex items-center gap-3">
                  <button type="button" @click="addBuyerProtectionItem" class="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-extrabold text-gray-700">Item əlavə et</button>
                  <input v-model="form.buyerProtection.enabled" type="checkbox" class="w-5 h-5" />
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input v-model="form.buyerProtection.titleI18n[contentLang]" type="text" placeholder="Başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
                <textarea v-model="form.buyerProtection.subtitleI18n[contentLang]" rows="3" placeholder="Alt başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium resize-none"></textarea>
              </div>
              <div class="space-y-4">
                <div v-for="(item, idx) in form.buyerProtection.items" :key="`trust-${idx}`" class="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-4">
                  <div class="flex items-center justify-between">
                    <div class="text-sm font-extrabold text-gray-900">Trust item {{ idx + 1 }}</div>
                    <button type="button" @click="removeBuyerProtectionItem(idx)" class="text-xs font-extrabold uppercase tracking-[0.14em] text-red-600">Sil</button>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select v-model="item.icon" class="w-full px-5 py-4 rounded-2xl bg-white border border-transparent focus:border-blue-600 outline-none transition-all font-medium">
                      <option value="shield">Shield</option>
                      <option value="truck">Truck</option>
                      <option value="rotate-ccw">Return</option>
                      <option value="badge-check">Verified</option>
                    </select>
                    <input v-model="item.titleI18n[contentLang]" type="text" placeholder="Başlıq" class="w-full px-5 py-4 rounded-2xl bg-white border border-transparent focus:border-blue-600 outline-none transition-all font-medium" />
                    <input v-model="item.subtitleI18n[contentLang]" type="text" placeholder="Alt mətn" class="w-full px-5 py-4 rounded-2xl bg-white border border-transparent focus:border-blue-600 outline-none transition-all font-medium" />
                  </div>
                </div>
              </div>
            </div>

            <div class="rounded-[2rem] border border-gray-100 p-6 space-y-5 xl:col-span-2">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-lg font-extrabold text-gray-900">Market highlights</div>
                  <div class="text-sm text-gray-500 font-medium mt-1">Saytın güclü tərəflərini göstərən modern statistik blok.</div>
                </div>
                <input v-model="form.marketHighlights.enabled" type="checkbox" class="w-5 h-5" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input v-model="form.marketHighlights.titleI18n[contentLang]" type="text" placeholder="Başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
                <textarea v-model="form.marketHighlights.subtitleI18n[contentLang]" rows="3" placeholder="Alt başlıq" class="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium resize-none"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
