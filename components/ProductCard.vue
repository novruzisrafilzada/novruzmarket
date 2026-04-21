<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Star, ShoppingCart, Eye, Heart, Scale, BadgeCheck, X } from 'lucide-vue-next'
import { useCartStore } from '~/stores/cart'
import { useCompareStore } from '~/stores/compare'
import type { ShopProductCardSettings } from '~/stores/shopExperience'
import { useWishlistStore } from '~/stores/wishlist'
import { buildProductHref } from '~/utils/product-route'

const props = withDefaults(defineProps<{
  product: any
  trackingSection?: string
  productCardSettings?: ShopProductCardSettings
  compareEnabled?: boolean
  interactive?: boolean
}>(), {
  interactive: true
})

const cartStore = useCartStore()
const compareStore = useCompareStore()
const shopExperienceStore = useShopExperienceStore()
const wishlistStore = useWishlistStore()
const { openQuickView } = useQuickView()
const { formatMoney } = useMoney()
const { t } = useT()
const { nameOf } = useProductText()
const { trackHomeSectionClick, trackHomeSectionAddToCart } = useHomeAnalytics()
const clientReady = ref(false)
const renderTimestamp = useState('markett-render-timestamp', () => Date.now())
const cartQty = computed(() => clientReady.value ? (cartStore.items.find((item) => item.id === props.product.id)?.quantity || 0) : 0)
const cardConfig = computed(() => props.productCardSettings || shopExperienceStore.config.productCard)
const compareEnabled = computed(() => props.compareEnabled ?? shopExperienceStore.config.compareEnabled)
const isInteractive = computed(() => props.interactive)
const isPremiumLuxe = computed(() => cardConfig.value.layoutVariant === 'premium-luxe')
const cardRadiusClass = computed(() => cardConfig.value.cornerStyle === 'sharp' ? 'rounded-none' : cardConfig.value.cornerStyle === 'soft' ? 'rounded-[0.4rem]' : 'rounded-[0.55rem]')
const cardFrameClass = computed(() => isPremiumLuxe.value ? 'rounded-none' : cardRadiusClass.value)
const cardGridGapClass = computed(() => '')
const articleShellClass = computed(() => isPremiumLuxe.value
  ? 'overflow-hidden border border-slate-200 bg-white shadow-none hover:border-slate-300'
  : 'bg-white')
const articleMotionClass = computed(() => isPremiumLuxe.value
  ? 'hover:-translate-y-[4px] hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)]'
  : 'hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]')
const mediaRatioClass = computed(() => cardConfig.value.mediaRatio === 'square' ? 'aspect-square' : 'aspect-[4/4.25]')
const priceClass = computed(() => cardConfig.value.priceTone === 'dark' ? 'text-gray-950' : 'text-[color:var(--color-primary,#2B3E95)]')
const mediaSurfaceClass = computed(() => 'bg-white')
const bodySurfaceClass = computed(() => isPremiumLuxe.value ? 'border-t border-slate-200 bg-white' : '')
const mobileMetaMinimal = computed(() => cardConfig.value.mobileMetaMode === 'minimal')
const bodyClass = computed(() => {
  if (cardConfig.value.mobileDensity === 'compact' && cardConfig.value.density === 'compact') return 'px-2.5 pb-2 pt-2 sm:px-4 sm:pb-2 sm:pt-2'
  if (cardConfig.value.mobileDensity === 'compact') return 'px-2.5 pb-2 pt-2 sm:px-4 sm:pb-2.5 sm:pt-2.5'
  if (cardConfig.value.density === 'compact') return 'px-3 pb-2.5 pt-2.5 sm:px-4 sm:pb-2 sm:pt-2'
  return 'px-3 pb-2.5 pt-2.5 sm:px-4 sm:pb-2.5 sm:pt-2.5'
})
const mediaPadClass = computed(() => {
  if (cardConfig.value.mobileDensity === 'compact' && cardConfig.value.density === 'compact') return 'px-3 py-3 sm:px-5 sm:py-5'
  if (cardConfig.value.mobileDensity === 'compact') return 'px-3 py-3 sm:px-5 sm:py-6'
  if (cardConfig.value.density === 'compact') return 'px-4 py-4 sm:px-5 sm:py-5'
  return 'px-4 py-4 sm:px-5 sm:py-6'
})
const contentGapClass = computed(() => {
  if (cardConfig.value.contentSpacing === 'balanced') return cardConfig.value.density === 'compact' ? 'gap-1.5' : 'gap-2'
  return cardConfig.value.density === 'compact' ? 'gap-1' : 'gap-1.5'
})
const titleClass = computed(() => {
  if (cardConfig.value.mobileTitleLines === 1 && cardConfig.value.titleLines === 1) return 'line-clamp-1 text-[13px] sm:text-[14px] font-extrabold leading-[1.25] text-gray-900 transition-colors hover:text-[color:var(--color-primary,#2B3E95)]'
  if (cardConfig.value.mobileTitleLines === 1) return 'line-clamp-1 sm:line-clamp-2 text-[13px] sm:text-[14px] font-extrabold leading-[1.25] text-gray-900 transition-colors hover:text-[color:var(--color-primary,#2B3E95)]'
  if (cardConfig.value.titleLines === 1) return 'line-clamp-2 sm:line-clamp-1 text-[13px] sm:text-[14px] font-extrabold leading-[1.25] text-gray-900 transition-colors hover:text-[color:var(--color-primary,#2B3E95)]'
  return 'line-clamp-2 text-[13px] sm:text-[14px] font-extrabold leading-[1.25] text-gray-900 transition-colors hover:text-[color:var(--color-primary,#2B3E95)]'
})
const metaChips = computed(() => {
  const chips: Array<{ key: string, label: string, tone?: 'neutral' | 'success' | 'danger' }> = []
  if (cardConfig.value.showCategoryChip && props.product?.category) chips.push({ key: 'category', label: String(props.product.category), tone: 'neutral' })
  return chips.slice(0, 3)
})
const soldLabel = computed(() => {
  const soldCount = Math.max(0, Math.floor(Number(props.product?.sold || 0)))
  return cardConfig.value.showSoldCount && soldCount > 0 ? formatSoldLabel(props.product?.sold) : ''
})

const formatSoldLabel = (value: unknown) => [Math.max(0, Math.floor(Number(value) || 0)), String(t('sold_unit')).trim(), String(t('sold_small')).trim()].filter(Boolean).join(' ')
const discountPercent = computed(() => {
  const oldPrice = Number(props.product?.oldPrice || 0)
  const price = Number(props.product?.price || 0)
  if (!oldPrice || oldPrice <= price) return 0
  return Math.max(0, Math.round(((oldPrice - price) / oldPrice) * 100))
})
const isNewArrival = computed(() => {
  const createdAt = new Date(String(props.product?.createdAt || ''))
  if (Number.isNaN(createdAt.getTime())) return false
  return Number(renderTimestamp.value) - createdAt.getTime() <= 1000 * 60 * 60 * 24 * 30
})
const sellerScore = computed(() => {
  const raw = props.product?.sellerScore ?? props.product?.trustScore ?? props.product?.sellerTrustScore
  return raw === undefined || raw === null || raw === '' ? null : raw
})
const imageClass = computed(() => cardConfig.value.imageFit === 'cover' ? 'h-full w-full object-cover' : 'max-h-full max-w-full object-contain')
const ctaStyleVars = computed(() => ({
  '--product-card-primary-bg': cardConfig.value.primaryCtaBg,
  '--product-card-primary-text': cardConfig.value.primaryCtaText,
  '--product-card-secondary-bg': cardConfig.value.secondaryCtaBg,
  '--product-card-secondary-text': cardConfig.value.secondaryCtaText,
  '--product-card-secondary-border': cardConfig.value.secondaryCtaBorder
}))
const discountBadgeStyle = computed(() => ({
  backgroundColor: cardConfig.value.discountBadgeBg,
  color: cardConfig.value.discountBadgeText,
  borderColor: cardConfig.value.discountBadgeBg
}))
const newBadgeStyle = computed(() => ({
  backgroundColor: cardConfig.value.newBadgeBg,
  color: cardConfig.value.newBadgeText,
  borderColor: isPremiumLuxe.value ? cardConfig.value.newBadgeText : cardConfig.value.newBadgeBg
}))
const stockAvailableStyle = computed(() => ({
  backgroundColor: cardConfig.value.stockBadgeBg,
  color: cardConfig.value.stockBadgeText,
  borderColor: cardConfig.value.stockBadgeBorder
}))
const stockOutStyle = computed(() => ({
  backgroundColor: cardConfig.value.outOfStockBadgeBg,
  color: cardConfig.value.outOfStockBadgeText,
  borderColor: cardConfig.value.outOfStockBadgeBg
}))
const lowStockTextStyle = computed(() => ({
  color: cardConfig.value.lowStockText
}))
const normalizedStock = computed(() => {
  const raw = props.product?.stock
  if (raw === undefined || raw === null || raw === '') return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
})
const isOutOfStock = computed(() => normalizedStock.value !== null && normalizedStock.value <= 0)
const isLowStock = computed(() => normalizedStock.value !== null && normalizedStock.value > 0 && normalizedStock.value <= 5)
const canAddToCart = computed(() => isInteractive.value && !isOutOfStock.value)
const primaryCtaClass = computed(() => isPremiumLuxe.value
  ? 'rounded-none border border-[#FACC15] bg-[#FACC15] text-[#111827] shadow-none hover:translate-y-0 hover:border-[#D9D9D9] hover:bg-white hover:text-[#111827] text-[12px] sm:text-[13px] font-extrabold tracking-[0.02em] uppercase'
  : '')
const secondaryCtaClass = computed(() => isPremiumLuxe.value
  ? 'rounded-none border border-slate-300 bg-white text-slate-900 shadow-none text-[10px] sm:text-[11px] font-semibold tracking-[0.08em] uppercase'
  : '')
const primaryCtaStyle = computed(() => undefined)
const secondaryCtaStyle = computed(() => isPremiumLuxe.value ? { backgroundColor: cardConfig.value.secondaryCtaBg, color: cardConfig.value.secondaryCtaText, borderColor: cardConfig.value.secondaryCtaBorder } : undefined)
const showMobileWishlist = computed(() => cardConfig.value.showWishlistAction && cardConfig.value.showMobileWishlistAction)
const showMobileSellerRow = computed(() => cardConfig.value.showSellerName && cardConfig.value.showMobileSellerName)
const stockStatusLabel = computed(() => {
  if (normalizedStock.value === null) return ''
  if (isOutOfStock.value) return t('out_of_stock')
  if (cardConfig.value.showLowStockText && isLowStock.value) return `${t('in_stock')} · Yalnız ${normalizedStock.value} ədəd qalıb`
  return t('in_stock')
})

const handleTrackedAddToCart = () => {
  if (!isInteractive.value) return
  cartStore.addToCart(props.product)
  if (props.trackingSection) trackHomeSectionAddToCart(props.trackingSection, String(props.product.id))
}

const handleTrackedIncrease = () => {
  if (!isInteractive.value) return
  cartStore.increaseQuantity(props.product.id)
  if (props.trackingSection) trackHomeSectionAddToCart(props.trackingSection, String(props.product.id))
}

const toggleWishlist = () => {
  if (!isInteractive.value || !cardConfig.value.showWishlistAction) return
  wishlistStore.toggleWishlist(props.product)
}

const toggleCompare = () => {
  if (!isInteractive.value || !cardConfig.value.showCompareAction || !compareEnabled.value) return
  compareStore.toggle(props.product)
}

const openProductQuickView = () => {
  if (!isInteractive.value || !cardConfig.value.showQuickViewAction) return
  if (props.trackingSection) trackHomeSectionClick(props.trackingSection, String(props.product.id))
  openQuickView(Number(props.product?.id || 0))
}

const isStarActive = (rating: any, i: number) => {
  const r = Math.round(Math.max(0, Math.min(5, Number(rating || 0))))
  return i <= r
}

onMounted(() => {
  clientReady.value = true
})
</script>

<template>
  <article class="group relative flex h-full flex-col transition-all duration-300" :class="[cardFrameClass, cardGridGapClass, articleShellClass, articleMotionClass]" :style="ctaStyleVars">
    <div class="relative">
      <NuxtLink :to="buildProductHref(product)" class="relative flex items-center justify-center overflow-hidden" :class="[mediaRatioClass, mediaPadClass, mediaSurfaceClass]" @click="props.trackingSection ? trackHomeSectionClick(props.trackingSection, String(product.id)) : undefined">
        <img :src="product.image" :alt="nameOf(product)" :class="[imageClass, isPremiumLuxe ? 'transition-transform duration-500 ease-out group-hover:scale-[1.06]' : 'transition-transform duration-500 ease-out group-hover:scale-[1.1]']" />
      </NuxtLink>
      <div class="absolute left-2 top-2 flex max-w-[58%] flex-wrap gap-1 sm:left-3 sm:top-3 sm:max-w-[70%] sm:gap-1.5">
        <span v-if="cardConfig.showDiscountBadge && (product.discount || discountPercent)" :class="[isPremiumLuxe ? 'rounded-none border px-2 py-0.5 text-[9px] font-bold shadow-none sm:px-3 sm:py-1 sm:text-[10px]' : 'rounded-full border px-2 py-0.5 text-[9px] font-extrabold shadow-sm sm:px-2.5 sm:py-1 sm:text-[10px]']" :style="discountBadgeStyle">{{ product.discount || `-${discountPercent}%` }}</span>
        <span v-if="cardConfig.showFeaturedBadge && product.featuredStatus === 'Aktiv'" :class="[isPremiumLuxe ? 'rounded-none border border-white bg-white px-2 py-0.5 text-[9px] font-semibold text-amber-700 shadow-none sm:px-3 sm:py-1 sm:text-[10px]' : 'rounded-full border border-white/80 bg-amber-100 px-2 py-0.5 text-[9px] font-extrabold text-amber-700 shadow-sm sm:px-2.5 sm:py-1 sm:text-[10px]']">{{ product.featuredBadgeText || 'PRO' }}</span>
        <span v-else-if="cardConfig.showNewBadge && isNewArrival" :class="[isPremiumLuxe ? 'rounded-none border px-2 py-0.5 text-[9px] font-semibold shadow-none sm:px-3 sm:py-1 sm:text-[10px]' : 'rounded-full border px-2 py-0.5 text-[9px] font-extrabold shadow-sm sm:px-2.5 sm:py-1 sm:text-[10px]']" :style="newBadgeStyle">{{ t('new_badge') }}</span>
      </div>
      <button
        v-if="showMobileWishlist"
        type="button"
        class="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center text-gray-700 transition-all duration-300 hover:bg-gray-50 disabled:opacity-50 md:hidden"
        :class="[isPremiumLuxe ? 'rounded-none border border-slate-200 bg-white shadow-none' : 'rounded-sm bg-white shadow-sm']"
        :disabled="!isInteractive"
        @click.stop.prevent="toggleWishlist"
      >
        <Heart class="h-3.5 w-3.5" :class="clientReady && wishlistStore.isInWishlist(product.id) ? 'fill-current text-red-600' : ''" />
      </button>
      <div v-if="cardConfig.showWishlistAction || (cardConfig.showCompareAction && compareEnabled) || cardConfig.showQuickViewAction || cardConfig.showSecondaryCta" class="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-2 opacity-0 transition-all duration-200 md:flex md:translate-x-2 md:group-hover:translate-x-0 md:group-hover:opacity-100 sm:right-3">
        <button v-if="cardConfig.showQuickViewAction" type="button" class="inline-flex h-10 w-10 items-center justify-center text-gray-700 transition-all duration-300 hover:bg-[#FACC15] hover:text-gray-900 disabled:opacity-50" :class="[isPremiumLuxe ? 'rounded-none border border-slate-200 bg-white shadow-none' : 'rounded-sm bg-white shadow-sm']" :disabled="!isInteractive" @click.stop.prevent="openProductQuickView"><Eye class="h-4 w-4" /></button>
        <NuxtLink v-else-if="cardConfig.showSecondaryCta" :to="buildProductHref(product)" class="inline-flex h-10 w-10 items-center justify-center text-gray-700 transition-all duration-300 hover:bg-[#FACC15] hover:text-gray-900" :class="[isPremiumLuxe ? 'rounded-none border border-slate-200 bg-white shadow-none' : 'rounded-sm bg-white shadow-sm']" @click="props.trackingSection ? trackHomeSectionClick(props.trackingSection, String(product.id)) : undefined">
          <Eye class="h-4 w-4" />
        </NuxtLink>
        <button v-if="cardConfig.showWishlistAction" type="button" class="inline-flex h-10 w-10 items-center justify-center text-gray-700 transition-all duration-300 hover:bg-gray-50 disabled:opacity-50" :class="[isPremiumLuxe ? 'rounded-none border border-slate-200 bg-white shadow-none' : 'rounded-sm bg-white shadow-sm']" :disabled="!isInteractive" @click.stop.prevent="toggleWishlist">
          <Heart class="h-3.5 w-3.5" :class="clientReady && wishlistStore.isInWishlist(product.id) ? 'fill-current text-red-600' : ''" />
        </button>
        <button v-if="cardConfig.showCompareAction && compareEnabled" type="button" class="inline-flex h-10 w-10 items-center justify-center text-gray-700 transition-all duration-300 hover:bg-gray-50 disabled:opacity-50" :class="[isPremiumLuxe ? 'rounded-none border border-slate-200 bg-white shadow-none' : 'rounded-sm bg-white shadow-sm']" :disabled="!isInteractive" @click.stop.prevent="toggleCompare">
          <Scale class="h-3.5 w-3.5" :class="clientReady && compareStore.has(product.id) ? 'text-blue-600' : ''" />
        </button>
      </div>
      <div v-if="(cardConfig.showBrandBadge && product.brand) || (cardConfig.showViewCount && Number(product.viewCount || 0) > 0)" class="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 sm:bottom-3 sm:left-3 sm:right-3 sm:gap-1.5">
        <span v-if="cardConfig.showBrandBadge && product.brand" :class="[isPremiumLuxe ? 'rounded-full bg-white/92 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm backdrop-blur' : 'rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-gray-700 shadow-sm']">{{ product.brand }}</span>
        <span v-if="cardConfig.showViewCount && Number(product.viewCount || 0) > 0 && !cardConfig.showBrandBadge" :class="[isPremiumLuxe ? 'inline-flex items-center gap-1 rounded-full bg-white/92 px-3 py-1 text-[10px] font-semibold text-slate-700 shadow-sm backdrop-blur' : 'inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-gray-700 shadow-sm']"><Eye class="h-3 w-3" />{{ Number(product.viewCount || 0) }}</span>
      </div>
      <div
        v-if="cardConfig.showStockBadge && normalizedStock !== null"
        class="absolute bottom-2 left-2 sm:bottom-3 sm:left-3"
        :class="'hidden sm:flex sm:flex-col sm:items-start sm:gap-1.5'"
      >
        <span
          class="inline-flex max-w-[220px] items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold leading-4 shadow-sm backdrop-blur"
          :style="isOutOfStock ? stockOutStyle : stockAvailableStyle"
        >
          <BadgeCheck v-if="!isOutOfStock" class="h-3.5 w-3.5 shrink-0" />
          <X v-else class="h-3.5 w-3.5 shrink-0" />
          <span class="whitespace-normal">{{ stockStatusLabel }}</span>
        </span>
      </div>
    </div>

    <div class="flex flex-1 flex-col" :class="[bodyClass, contentGapClass, bodySurfaceClass]">
      <div
        v-if="cardConfig.showSellerName || (cardConfig.showSellerScore && sellerScore !== null)"
        :class="[showMobileSellerRow ? 'flex' : 'hidden sm:flex', 'items-center justify-between gap-2']"
      >
        <div v-if="cardConfig.showSellerName && (product.sellerShopName || product.sellerName || product.sellerId)" :class="[isPremiumLuxe ? 'min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500' : 'min-w-0 truncate text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-600/90']">
          {{ product.sellerShopName || product.sellerName || 'Satıcı mağazası' }}
        </div>
        <div v-if="cardConfig.showSellerScore && sellerScore !== null" :class="[isPremiumLuxe ? 'inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50/80 px-2.5 py-1 text-[10px] font-semibold text-emerald-700' : 'inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-extrabold text-emerald-700']">
          <BadgeCheck class="h-3.5 w-3.5" />
          {{ sellerScore }}
        </div>
      </div>
      <NuxtLink :to="buildProductHref(product)" class="mt-1 block" :class="[titleClass, isPremiumLuxe ? 'tracking-[-0.01em]' : '']" @click="props.trackingSection ? trackHomeSectionClick(props.trackingSection, String(product.id)) : undefined">
        {{ nameOf(product) }}
      </NuxtLink>
      <div
        v-if="cardConfig.showRating || (cardConfig.showReviewCount && Number(product.reviewCount || 0) > 0)"
        class="mt-1.5 flex items-center gap-1.5"
        :class="[cardConfig.showMobileRating ? 'flex' : 'hidden sm:flex']"
      >
        <div v-if="cardConfig.showRating" class="flex items-center gap-0.5">
          <Star v-for="i in 5" :key="i" class="h-3.5 w-3.5" :class="isStarActive(product.rating, i) ? 'fill-yellow-400 text-yellow-400' : 'text-[#e8c55a]'" />
        </div>
        <span v-if="cardConfig.showReviewCount && Number(product.reviewCount || 0) > 0" :class="[cardConfig.showMobileReviewCount ? 'inline' : 'hidden sm:inline', 'text-[11px] sm:text-[12px] text-gray-400']">({{ Number(product.reviewCount || 0) }} {{ Number(product.reviewCount || 0) === 1 ? t('review') : t('reviews') }})</span>
      </div>
      <div class="mt-1.5 flex items-end gap-2" :class="isPremiumLuxe ? 'sm:gap-2.5' : ''">
        <div class="truncate leading-none" :class="[priceClass, isPremiumLuxe ? 'text-[17px] sm:text-[20px] font-semibold tracking-[-0.03em]' : 'text-[16px] sm:text-[18px] font-extrabold']">{{ formatMoney(product.price) }}</div>
        <div class="min-h-[14px] text-[11px] sm:text-[12px] leading-none line-through" :class="isPremiumLuxe ? 'font-medium text-slate-400' : 'font-bold text-gray-400'">
          <span v-if="product.oldPrice">{{ formatMoney(product.oldPrice) }}</span>
        </div>
      </div>
      <div
        v-if="cardConfig.showMobileStockBadge && normalizedStock !== null"
        class="mt-1 sm:hidden"
      >
        <span
          class="inline-flex max-w-full items-center gap-1.5 break-words rounded-full px-2.5 py-1 text-[11px] font-semibold leading-4"
          :style="{ color: isOutOfStock ? cardConfig.outOfStockBadgeText : cardConfig.stockBadgeText }"
        >
          <BadgeCheck v-if="!isOutOfStock" class="h-3.5 w-3.5" />
          <X v-else class="h-3.5 w-3.5" />
          <span class="whitespace-normal">{{ stockStatusLabel }}</span>
        </span>
      </div>
      <div v-if="soldLabel" :class="[cardConfig.showMobileSoldCount ? 'block' : 'hidden sm:block', 'mt-1 text-[12px] sm:text-[13px] font-medium text-gray-600']">
        {{ soldLabel }}
      </div>
      <div v-if="metaChips.length || isLowStock" class="mt-1 flex flex-wrap gap-1.5" :class="[cardConfig.showMobileStockBadge ? 'flex' : 'hidden sm:flex']">
        <span
          v-for="chip in metaChips"
          :key="chip.key"
          class="items-center gap-1 rounded-full px-2 py-1 text-[9px] sm:px-2.5 sm:text-[10px] font-bold"
          :class="[
            chip.key === 'category' && mobileMetaMinimal ? 'hidden sm:inline-flex' : 'inline-flex',
            'bg-gray-100 text-gray-600'
          ]"
        >
          {{ chip.label }}
        </span>
      </div>
      <div v-if="cartQty > 0" :class="[mobileMetaMinimal ? 'hidden sm:block' : 'block', 'mt-1 text-[11px] sm:text-[12px] font-bold text-gray-500']">
        {{ cartQty }} {{ t('cart_label') }}
      </div>
      <div class="mt-auto" :class="isPremiumLuxe ? 'h-2' : 'h-1.5'"></div>
    </div>

    <div class="mt-auto px-2.5 pb-2.5 sm:px-4 sm:pb-4 md:hidden">
      <div class="flex items-center gap-2">
        <NuxtLink v-if="cartQty > 0" to="/cart" class="flex h-10 w-full flex-1 items-center justify-center gap-2 bg-[#FACC15] px-3 text-[11px] font-extrabold uppercase tracking-[0.02em] text-gray-900 transition-all duration-300 hover:bg-[#ffe38a] sm:h-11 sm:px-4 sm:text-[13px]" :class="primaryCtaClass" :style="primaryCtaStyle">
          <ShoppingCart class="h-4 w-4" />
          {{ t('cart_view') }}
        </NuxtLink>
        <button
          v-else
          type="button"
          class="flex h-10 w-full flex-1 items-center justify-center gap-2 bg-[#FACC15] px-3 text-[11px] font-extrabold uppercase tracking-[0.02em] text-gray-900 transition-all duration-300 hover:bg-[#ffe38a] disabled:opacity-60 sm:h-11 sm:px-4 sm:text-[13px]"
          :class="primaryCtaClass"
          :style="primaryCtaStyle"
          :disabled="!canAddToCart"
          @click.stop.prevent="handleTrackedAddToCart"
        >
          <ShoppingCart class="h-4 w-4" />
          {{ t('add_to_cart') }}
        </button>
      </div>
    </div>

    <div class="hidden px-4 pb-4 md:block">
      <div class="pointer-events-none max-h-0 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:pointer-events-auto group-hover:max-h-32">
        <div :class="[isPremiumLuxe ? 'translate-y-4 scale-[0.99] space-y-0 border-t-0 bg-transparent pt-0 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100' : 'translate-y-5 scale-[0.98] space-y-2 border-t border-gray-100 bg-white pt-3 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100']">
          <NuxtLink v-if="cartQty > 0" to="/cart" class="flex h-11 w-full items-center justify-center gap-2 bg-[#FACC15] px-4 text-[13px] font-extrabold uppercase tracking-[0.02em] text-gray-900 transition-all duration-500 hover:bg-[#fff1b8]" :class="primaryCtaClass" :style="primaryCtaStyle">
            <ShoppingCart class="h-4 w-4" />
            {{ t('cart_view') }}
          </NuxtLink>
          <button
            v-else
            type="button"
            class="flex h-11 w-full items-center justify-center gap-2 bg-[#FACC15] px-4 text-[13px] font-extrabold uppercase tracking-[0.02em] text-gray-900 transition-all duration-500 hover:bg-[#fff1b8] disabled:opacity-60"
            :class="primaryCtaClass"
            :style="primaryCtaStyle"
            :disabled="!canAddToCart"
            @click.stop.prevent="handleTrackedAddToCart"
          >
            <ShoppingCart class="h-4 w-4" />
            {{ t('add_to_cart') }}
          </button>
          <button
            v-if="!isPremiumLuxe && showBottomSecondaryAction && cardConfig.showQuickViewAction"
            type="button"
            class="flex h-11 w-full items-center justify-center border border-gray-200 bg-white px-4 text-[13px] font-extrabold text-gray-600 transition-all duration-300 hover:border-[#FACC15] hover:bg-[#FACC15] hover:text-gray-900"
            :class="secondaryCtaClass"
            :style="secondaryCtaStyle"
            :disabled="!isInteractive"
            @click.stop.prevent="openProductQuickView"
          >
            {{ bottomSecondaryLabel }}
          </button>
        </div>
      </div>
    </div>
  </article>
</template>
