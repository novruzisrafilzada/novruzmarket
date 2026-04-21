<script setup lang="ts">
import { 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Headphones, 
  ChevronRight,
  ChevronLeft
} from 'lucide-vue-next'

import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'

import FeaturedCategoriesSection from '~/components/home/FeaturedCategoriesSection.vue'
import BannerPlacementSection from '~/components/home/BannerPlacementSection.vue'
import PromoStripSection from '~/components/home/PromoStripSection.vue'
import AppPromoSection from '~/components/home/AppPromoSection.vue'
import PopularSearchesSection from '~/components/home/PopularSearchesSection.vue'
import ShopByBudgetSection from '~/components/home/ShopByBudgetSection.vue'
import BestRatedProductsSection from '~/components/home/BestRatedProductsSection.vue'
import ShopByBrandSection from '~/components/home/ShopByBrandSection.vue'
import FrequentlyBoughtTogetherSection from '~/components/home/FrequentlyBoughtTogetherSection.vue'
import SellerTrustMetricsSection from '~/components/home/SellerTrustMetricsSection.vue'
import FlashDealsSection from '~/components/home/FlashDealsSection.vue'
import VerifiedSellersSection from '~/components/home/VerifiedSellersSection.vue'
import BuyerProtectionSection from '~/components/home/BuyerProtectionSection.vue'
import BrandLogoStripSection from '~/components/home/BrandLogoStripSection.vue'
import FeaturedSellerProductsSection from '~/components/home/FeaturedSellerProductsSection.vue'
import FeaturedSellersSection from '~/components/home/FeaturedSellersSection.vue'
import MarketHighlightsSection from '~/components/home/MarketHighlightsSection.vue'
import TrendingNowSection from '~/components/home/TrendingNowSection.vue'
import CampaignBlocksSection from '~/components/home/CampaignBlocksSection.vue'
import CreativeProductSection from '~/components/home/CreativeProductSection.vue'
import LookbookSection from '~/components/home/LookbookSection.vue'
import UgcShowcaseSection from '~/components/home/UgcShowcaseSection.vue'
import { getPlacementBanners, getStandaloneMiddleBanners } from '~/utils/homepage-layout'
import { useBannerStore } from '~/stores/banners'
import { useBrandStore } from '~/stores/brands'
import { useHomeSectionsStore } from '~/stores/homeSections'
import { useProductStore } from '~/stores/products'
import { useSettingsStore } from '~/stores/settings'

const bannerStore = useBannerStore()
const brandStore = useBrandStore()
const homeStore = useHomeSectionsStore()
const productStore = useProductStore()
const settingsStore = useSettingsStore()
const { t, lang } = useT()
const { profileFor } = useMobileDensity()
const homeDensity = profileFor('home')

const bannersFor = (place: 'afterFeatures' | 'afterTopDeals' | 'afterTopProducts') => {
  const d: any = settingsStore.settings.design || {}
  const layout = d.homeBannersLayout === 'mosaic' ? 'mosaic' : 'carousel'
  const fallbackPlace = (['afterFeatures', 'afterTopDeals', 'afterTopProducts'].includes(String(d.homeBannersPlacement)) ? String(d.homeBannersPlacement) : 'afterFeatures') as any
  return getPlacementBanners(bannerStore.banners as any[], place, layout, fallbackPlace)
}

const brands = computed(() => brandStore.brands.filter(b => b.status === 'Aktiv'))

const appPromo = computed(() => settingsStore.settings.appPromo)

if (!homeStore.hydrated) {
  await homeStore.fetchConfig()
}
if (!productStore.hydrated) {
  await productStore.fetchProducts()
}
if (!settingsStore.hydrated) {
  await settingsStore.fetchSettings()
}
if (!bannerStore.hydrated) {
  await bannerStore.fetchBanners()
}

const promoStripItems = computed(() => {
  const cfg: any = homeStore.config
  const l = lang.value
  const items = Array.isArray(cfg?.promoStrip?.itemsI18n) ? cfg.promoStrip.itemsI18n : []
  const mapped = items.map((x: any) => String(x?.[l] || x?.az || '').trim()).filter(Boolean)
  return mapped.length ? mapped : []
})

const promoStripSpeed = computed(() => {
  const cfg: any = homeStore.config
  const v = Number(cfg?.promoStrip?.speedSec || 30)
  return Math.max(10, Math.min(120, v))
})

const homeLayout = computed(() => {
  const d: any = settingsStore.settings.design || {}
  const v = Number(d.homeLayout)
  return [2,3,4,5,6].includes(v) ? v : 1
})

const homeBanners = computed(() => {
  const d: any = settingsStore.settings.design || {}
  return {
    layout: (d.homeBannersLayout === 'mosaic' ? 'mosaic' : 'carousel') as 'carousel' | 'mosaic',
    placement: (['afterFeatures', 'afterTopDeals', 'afterTopProducts'].includes(String(d.homeBannersPlacement)) ? String(d.homeBannersPlacement) : 'afterFeatures') as 'afterFeatures' | 'afterTopDeals' | 'afterTopProducts'
  }
})

const bAfterFeatures = computed(() => bannersFor('afterFeatures'))
const bAfterTopDeals = computed(() => bannersFor('afterTopDeals'))
const bAfterTopProducts = computed(() => bannersFor('afterTopProducts'))
const middleBanners = computed(() =>
  getStandaloneMiddleBanners(bannerStore.banners as any[], 3, homeBanners.value.placement)
)
const bottomBannerMosaic = computed(() => ({
  left: bAfterTopProducts.value[0] || null,
  centerTop: bAfterTopProducts.value[1] || null,
  centerBottom: bAfterTopProducts.value[2] || null,
  right: bAfterTopProducts.value[3] || null
}))

const showBannersAfterFeatures = computed(() => homeLayout.value === 4 && bAfterFeatures.value.length > 0)
const showBannersAfterTopDeals = computed(() => homeLayout.value === 4 && bAfterTopDeals.value.length > 0)
const showBannersAfterTopProducts = computed(() => homeLayout.value === 4 && bAfterTopProducts.value.length > 0)
const bannerCtaText = (b: any) => String(b?.ctaText || t('discover_now' as any))
const bannerCtaStyle = (b: any) => ({
  backgroundColor: b?.ctaBg || '#FFFFFF',
  color: b?.ctaTextColor || '#111827'
})
const localized = (value: any) => String(value?.[lang.value] || value?.az || '')
const activeAudience = computed(() => homeStore.config?.experienceBuilder?.audienceMode || 'general')
const audienceLabel = computed(() => ({
  general: t('experience_builder'),
  new: t('new_customers'),
  returning: t('returning_customers'),
  vip: t('vip_layout')
}[activeAudience.value] || t('experience_builder')))
const campaignBlocks = computed(() =>
  (homeStore.config?.campaignBlocks || [])
    .filter((item: any) => item?.enabled && (item?.audience === 'all' || item?.audience === activeAudience.value))
    .map((item: any) => ({
      title: localized(item.titleI18n),
      subtitle: localized(item.subtitleI18n),
      cta: localized(item.ctaLabelI18n),
      href: item.href || '/shop',
      image: item.image || ''
    }))
)
const activeProducts = computed(() => productStore.products.filter((item) => item.status === 'Aktiv'))
const weeklyPickIds = computed(() => Array.isArray(homeStore.config?.storytelling?.weeklyPick?.productIds) ? homeStore.config.storytelling.weeklyPick.productIds : [])
const editorPickIds = computed(() => Array.isArray(homeStore.config?.storytelling?.editorsPick?.productIds) ? homeStore.config.storytelling.editorsPick.productIds : [])
const storyNewArrivals = computed(() => activeProducts.value.slice().sort((a, b) => Number(b.id || 0) - Number(a.id || 0)).slice(0, Number(homeStore.config?.storytelling?.newArrivals?.limit || 8)))
const storyTrending = computed(() => activeProducts.value.slice().sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0)).slice(0, Number(homeStore.config?.storytelling?.trending?.limit || 8)))
const storyWeeklyPick = computed(() => {
  const curated = activeProducts.value.filter((item) => weeklyPickIds.value.includes(item.id)).slice(0, 8)
  if (curated.length > 0) return curated
  return activeProducts.value.slice().sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0)).slice(0, 8)
})
const storyEditorsPick = computed(() => activeProducts.value.filter((item) => editorPickIds.value.includes(item.id)).slice(0, 8))
const lookbookBlocks = computed(() => (homeStore.config?.lookbook?.blocks || []).map((item: any) => ({ title: localized(item.titleI18n), subtitle: localized(item.subtitleI18n), image: item.image || '', href: item.href || '/shop' })))
const ugcCards = computed(() => (homeStore.config?.ugcShowcase?.cards || []).map((item: any) => ({ creator: item.creator || '', handle: item.handle || '', text: localized(item.textI18n), image: item.image || '', href: item.href || '/shop' })))
const supportedSectionKeys = ['hero', 'campaignBlocks', 'features', 'popularSearches', 'shopByBudget', 'shopByBrand', 'flashDeals', 'bannerAfterFeatures', 'storyNewArrivals', 'storyTrending', 'topDeals', 'bannerAfterTopDeals', 'topSelling', 'bestRatedProducts', 'frequentlyBoughtTogether', 'topProducts', 'bannerAfterTopProducts', 'storyWeeklyPick', 'storyEditorsPick', 'featuredCategories', 'featuredSellers', 'sellerTrustMetrics', 'verifiedSellers', 'sellerProducts', 'middleBanners', 'buyerProtection', 'trendingNow', 'lookbook', 'ugcShowcase', 'recentlyViewed', 'brandStrip', 'promoStrip', 'appPromo', 'marketHighlights'] as const
const defaultExperienceSectionOrder = ['hero', 'campaignBlocks', 'features', 'popularSearches', 'shopByBudget', 'shopByBrand', 'flashDeals', 'bannerAfterFeatures', 'storyNewArrivals', 'storyTrending', 'topDeals', 'bannerAfterTopDeals', 'topSelling', 'bestRatedProducts', 'frequentlyBoughtTogether', 'topProducts', 'bannerAfterTopProducts', 'storyWeeklyPick', 'storyEditorsPick', 'featuredCategories', 'featuredSellers', 'sellerTrustMetrics', 'verifiedSellers', 'sellerProducts', 'middleBanners', 'buyerProtection', 'trendingNow', 'lookbook', 'ugcShowcase', 'recentlyViewed', 'brandStrip', 'promoStrip', 'appPromo', 'marketHighlights'] as const
const experienceBackfillSectionKeys = ['features', 'popularSearches', 'shopByBudget', 'shopByBrand', 'flashDeals', 'bannerAfterFeatures', 'featuredCategories', 'sellerTrustMetrics', 'verifiedSellers', 'sellerProducts', 'middleBanners', 'buyerProtection', 'trendingNow', 'bestRatedProducts', 'frequentlyBoughtTogether', 'storyTrending', 'storyWeeklyPick', 'bannerAfterTopDeals', 'bannerAfterTopProducts', 'promoStrip', 'appPromo'] as const
const configuredExperienceSectionOrder = computed(() => {
  const configured = Array.isArray(homeStore.config?.experienceBuilder?.sectionOrder) ? homeStore.config.experienceBuilder.sectionOrder : []
  const filtered = configured.filter((item: string) => supportedSectionKeys.includes(item as any))
  const backfill = experienceBackfillSectionKeys.filter((item) => !filtered.includes(item))
  return [...new Set([...filtered, ...backfill])]
})
const hasExperienceOverride = computed(() => configuredExperienceSectionOrder.value.length > 0)
const experienceSectionOrder = computed(() => hasExperienceOverride.value ? configuredExperienceSectionOrder.value : [...defaultExperienceSectionOrder])
const isSectionConfigured = (key: string) => hasExperienceOverride.value ? supportedSectionKeys.includes(key as any) : experienceSectionOrder.value.includes(key as any)
const sectionHasContent = (key: string) => {
  if (key === 'campaignBlocks') return campaignBlocks.value.length > 0
  if (key === 'storyNewArrivals') return Boolean(homeStore.config?.storytelling?.newArrivals?.enabled) && storyNewArrivals.value.length > 0
  if (key === 'storyTrending') return Boolean(homeStore.config?.storytelling?.trending?.enabled) && storyTrending.value.length > 0
  if (key === 'storyWeeklyPick') return Boolean(homeStore.config?.storytelling?.weeklyPick?.enabled) && storyWeeklyPick.value.length > 0
  if (key === 'storyEditorsPick') return Boolean(homeStore.config?.storytelling?.editorsPick?.enabled) && storyEditorsPick.value.length > 0
  if (key === 'lookbook') return Boolean(homeStore.config?.lookbook?.enabled) && lookbookBlocks.value.length > 0
  if (key === 'ugcShowcase') return Boolean(homeStore.config?.ugcShowcase?.enabled) && ugcCards.value.length > 0
  if (key === 'brandStrip') return brands.value.length > 0
  if (key === 'bannerAfterFeatures') return bAfterFeatures.value.length > 0
  if (key === 'bannerAfterTopDeals') return bAfterTopDeals.value.length > 0
  if (key === 'bannerAfterTopProducts') return bAfterTopProducts.value.length > 0
  if (key === 'middleBanners') return middleBanners.value.length > 0
  if (key === 'promoStrip') return Boolean(homeStore.config?.promoStrip?.enabled) && promoStripItems.value.length > 0
  if (key === 'appPromo') return Boolean(appPromo.value?.enabled)
  if (key === 'popularSearches') return Boolean(homeStore.config?.popularSearches?.enabled)
  if (key === 'shopByBudget') return Boolean(homeStore.config?.shopByBudget?.enabled)
  if (key === 'shopByBrand') return Boolean(homeStore.config?.shopByBrand?.enabled)
  if (key === 'flashDeals') return Boolean(homeStore.config?.flashDeals?.enabled)
  if (key === 'bestRatedProducts') return Boolean(homeStore.config?.bestRatedProducts?.enabled)
  if (key === 'frequentlyBoughtTogether') return Boolean(homeStore.config?.frequentlyBoughtTogether?.enabled)
  if (key === 'sellerTrustMetrics') return Boolean(homeStore.config?.sellerTrustMetrics?.enabled)
  if (key === 'verifiedSellers') return Boolean(homeStore.config?.verifiedSellers?.enabled)
  if (key === 'buyerProtection') return Boolean(homeStore.config?.buyerProtection?.enabled)
  return true
}

useSiteSeo({
  title: computed(() => String(settingsStore.settings.seo?.title || settingsStore.settings.siteName || 'Novruzmarket')),
  description: computed(() => String(settingsStore.settings.seo?.description || 'Novruzmarket online marketplace')),
  path: '/'
})

</script>

<template>
  <div :class="['bg-white', `home-density-${homeDensity}`]">
    <template v-for="sectionKey in experienceSectionOrder" :key="sectionKey">
        <HeroSlider v-if="sectionKey === 'hero' && homeLayout === 4" />
        <HeroSlider5 v-else-if="sectionKey === 'hero' && (homeLayout === 5 || homeLayout === 6)" />
        <HomeHeroSlider v-else-if="sectionKey === 'hero'" />
        <CampaignBlocksSection
          v-else-if="sectionKey === 'campaignBlocks' && sectionHasContent(sectionKey)"
          :audience-label="audienceLabel"
          :blocks="campaignBlocks"
        />
        <CreativeProductSection
          v-else-if="sectionKey === 'storyNewArrivals' && sectionHasContent(sectionKey)"
          badge="Storytelling"
          :title="localized(homeStore.config?.storytelling?.newArrivals?.titleI18n)"
          :subtitle="localized(homeStore.config?.storytelling?.newArrivals?.subtitleI18n)"
          :products="storyNewArrivals"
        />
        <CreativeProductSection
          v-else-if="sectionKey === 'storyTrending' && sectionHasContent(sectionKey)"
          badge="Trend edit"
          :title="localized(homeStore.config?.storytelling?.trending?.titleI18n)"
          :subtitle="localized(homeStore.config?.storytelling?.trending?.subtitleI18n)"
          :products="storyTrending"
        />
        <CreativeProductSection
          v-else-if="sectionKey === 'storyWeeklyPick' && sectionHasContent(sectionKey)"
          badge="Weekly curation"
          :title="localized(homeStore.config?.storytelling?.weeklyPick?.titleI18n)"
          :subtitle="localized(homeStore.config?.storytelling?.weeklyPick?.subtitleI18n)"
          :products="storyWeeklyPick"
        />
        <CreativeProductSection
          v-else-if="sectionKey === 'storyEditorsPick' && sectionHasContent(sectionKey)"
          badge="Editor’s pick"
          :title="localized(homeStore.config?.storytelling?.editorsPick?.titleI18n)"
          :subtitle="localized(homeStore.config?.storytelling?.editorsPick?.subtitleI18n)"
          :products="storyEditorsPick"
        />
        <HomeFeatures v-else-if="sectionKey === 'features'" />
        <PopularSearchesSection v-else-if="sectionKey === 'popularSearches' && sectionHasContent(sectionKey)" />
        <ShopByBudgetSection v-else-if="sectionKey === 'shopByBudget' && sectionHasContent(sectionKey)" />
        <ShopByBrandSection v-else-if="sectionKey === 'shopByBrand' && sectionHasContent(sectionKey)" />
        <FlashDealsSection v-else-if="sectionKey === 'flashDeals' && sectionHasContent(sectionKey)" />
        <BannerPlacementSection v-else-if="sectionKey === 'bannerAfterFeatures' && sectionHasContent(sectionKey)" :banners="bAfterFeatures" :compact="homeLayout === 6" :layout-mode="homeBanners.layout" />
        <FeaturedCategoriesSection v-else-if="sectionKey === 'featuredCategories'" />
        <FeaturedSellersSection v-else-if="sectionKey === 'featuredSellers'" />
        <SellerTrustMetricsSection v-else-if="sectionKey === 'sellerTrustMetrics' && sectionHasContent(sectionKey)" />
        <VerifiedSellersSection v-else-if="sectionKey === 'verifiedSellers' && sectionHasContent(sectionKey)" />
        <FeaturedSellerProductsSection v-else-if="sectionKey === 'sellerProducts'" />
        <BannerPlacementSection v-else-if="sectionKey === 'middleBanners' && sectionHasContent(sectionKey)" :banners="middleBanners" layout-mode="grid" />
        <BuyerProtectionSection v-else-if="sectionKey === 'buyerProtection' && sectionHasContent(sectionKey)" />
        <TrendingNowSection v-else-if="sectionKey === 'trendingNow'" />
        <MarketHighlightsSection v-else-if="sectionKey === 'marketHighlights'" />
        <HomeTopDeals v-else-if="sectionKey === 'topDeals'" />
        <BannerPlacementSection v-else-if="sectionKey === 'bannerAfterTopDeals' && sectionHasContent(sectionKey)" :banners="bAfterTopDeals" :compact="homeLayout === 6" :layout-mode="homeBanners.layout" section-style="topDealsPair" />
        <HomeTopSelling v-else-if="sectionKey === 'topSelling'" />
        <BestRatedProductsSection v-else-if="sectionKey === 'bestRatedProducts' && sectionHasContent(sectionKey)" />
        <FrequentlyBoughtTogetherSection v-else-if="sectionKey === 'frequentlyBoughtTogether' && sectionHasContent(sectionKey)" />
        <HomeTopProducts v-else-if="sectionKey === 'topProducts'" />
        <BannerPlacementSection
          v-else-if="sectionKey === 'bannerAfterTopProducts' && sectionHasContent(sectionKey)"
          :banners="bAfterTopProducts"
          :compact="homeLayout === 6"
          :layout-mode="homeLayout === 6 ? 'mosaic' : homeBanners.layout"
        />
        <HomeNewArrivals v-else-if="sectionKey === 'newArrivals'" />
        <HomeRecentlyViewed v-else-if="sectionKey === 'recentlyViewed'" />
        <LookbookSection
          v-else-if="sectionKey === 'lookbook' && sectionHasContent(sectionKey)"
          :title="localized(homeStore.config?.lookbook?.titleI18n)"
          :subtitle="localized(homeStore.config?.lookbook?.subtitleI18n)"
          :blocks="lookbookBlocks"
        />
        <UgcShowcaseSection
          v-else-if="sectionKey === 'ugcShowcase' && sectionHasContent(sectionKey)"
          :title="localized(homeStore.config?.ugcShowcase?.titleI18n)"
          :subtitle="localized(homeStore.config?.ugcShowcase?.subtitleI18n)"
          :cards="ugcCards"
        />
        <BrandLogoStripSection v-else-if="sectionKey === 'brandStrip' && sectionHasContent(sectionKey)" :brands="brands" />
        <PromoStripSection v-else-if="sectionKey === 'promoStrip' && sectionHasContent(sectionKey)" :items="promoStripItems" :speed="promoStripSpeed" :dark="homeLayout === 6" />
        <AppPromoSection v-else-if="sectionKey === 'appPromo' && sectionHasContent(sectionKey)" :promo="appPromo" />
    </template>

      <div v-if="homeLayout === 6">
        <div v-if="!isSectionConfigured('bannerAfterFeatures') && bAfterFeatures.length" class="container py-8">
          <div v-if="homeBanners.layout === 'carousel' && bAfterFeatures.length >= 3" class="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
            <div v-for="b in bAfterFeatures.slice(0, 3)" :key="b.id" class="home-banner-card relative h-[148px] sm:h-[170px] lg:h-[180px] overflow-hidden cursor-pointer rounded-[2px]" @click="navigateTo(b.link || '/shop')">
              <img :src="b.image" :alt="b.title" class="home-banner-img w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/5"></div>
              <div class="absolute inset-0 flex flex-col justify-center px-7 text-white">
                <div class="text-[11px] font-extrabold text-[color:var(--color-accent,#FACC15)] uppercase tracking-[0.2em]">{{ b.title }}</div>
                <div class="mt-2 text-[23px] sm:text-[24px] font-bold leading-[1.15] max-w-[14rem]">{{ b.subtitle }}</div>
                <div class="banner-cta-pill mt-4 inline-flex items-center justify-center h-10 px-5 text-[10px] font-extrabold uppercase tracking-[0.18em] w-fit" :style="bannerCtaStyle(b)">{{ bannerCtaText(b) }}</div>
              </div>
            </div>
          </div>
          <ClientOnly v-else>
            <Swiper :slides-per-view="1" :space-between="16" :breakpoints="{ '640': { slidesPerView: 2 }, '1024': { slidesPerView: 3 } }">
              <SwiperSlide v-for="b in bAfterFeatures" :key="b.id">
                <div class="home-banner-card relative h-[148px] sm:h-[170px] lg:h-[180px] overflow-hidden cursor-pointer rounded-[2px]" @click="navigateTo(b.link || '/shop')">
                  <img :src="b.image" :alt="b.title" class="home-banner-img w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-black/5"></div>
                  <div class="absolute inset-0 flex flex-col justify-center px-7 text-white">
                    <div class="text-[11px] font-extrabold text-[color:var(--color-accent,#FACC15)] uppercase tracking-[0.2em]">{{ b.title }}</div>
                    <div class="mt-2 text-[23px] sm:text-[24px] font-bold leading-[1.15] max-w-[14rem]">{{ b.subtitle }}</div>
                    <div class="banner-cta-pill mt-4 inline-flex items-center justify-center h-10 px-5 text-[10px] font-extrabold uppercase tracking-[0.18em] w-fit" :style="bannerCtaStyle(b)">{{ bannerCtaText(b) }}</div>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
          </ClientOnly>
        </div>

        <div v-if="!isSectionConfigured('bannerAfterTopDeals') && bAfterTopDeals.length" class="container py-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            <div v-for="b in bAfterTopDeals.slice(0, 2)" :key="b.id" class="home-banner-card relative h-[132px] sm:h-[148px] lg:h-[160px] overflow-hidden cursor-pointer" @click="navigateTo(b.link || '/shop')">
              <img :src="b.image" :alt="b.title" class="home-banner-img w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/10"></div>
              <div class="absolute inset-0 flex flex-col justify-center px-7 text-white">
                <div class="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[color:var(--color-accent,#FACC15)]">{{ b.title }}</div>
                <div class="mt-2 text-[20px] sm:text-[22px] font-bold leading-[1.2] max-w-[15rem]">{{ b.subtitle }}</div>
                <div class="banner-cta-pill mt-4 inline-flex items-center justify-center h-9 px-5 text-[10px] font-extrabold uppercase tracking-[0.18em] w-fit" :style="bannerCtaStyle(b)">{{ bannerCtaText(b) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!isSectionConfigured('promoStrip') && homeStore.config?.promoStrip?.enabled && promoStripItems.length" class="bg-[color:var(--color-primary,#2B3E95)] overflow-hidden">
          <div class="container py-3">
            <div class="flex animate-marquee whitespace-nowrap text-white font-bold text-sm" :style="{ animationDuration: promoStripSpeed + 's' }">
              <template v-for="rep in 2" :key="rep">
                <span v-for="(txt, idx) in promoStripItems" :key="`${rep}-${idx}`" class="mx-10">{{ txt }}</span>
              </template>
            </div>
          </div>
        </div>

        <div v-if="!isSectionConfigured('bannerAfterTopProducts') && bAfterTopProducts.length" class="container py-10">
          <div v-if="bottomBannerMosaic.left && bottomBannerMosaic.centerTop && bottomBannerMosaic.centerBottom && bottomBannerMosaic.right" class="grid grid-cols-1 lg:grid-cols-[1fr,1fr,1fr] gap-4 lg:gap-5">
            <div class="home-banner-card relative h-[320px] overflow-hidden cursor-pointer" @click="navigateTo(bottomBannerMosaic.left.link || '/shop')">
              <img :src="bottomBannerMosaic.left.image" :alt="bottomBannerMosaic.left.title" class="home-banner-img w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/5"></div>
              <div class="absolute inset-0 flex flex-col items-center justify-start text-center px-8 pt-7 text-white">
                <div class="inline-flex items-center px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] bg-[color:var(--color-accent,#FACC15)] text-gray-900">{{ bottomBannerMosaic.left.title }}</div>
                <div class="mt-4 text-[17px] leading-[1.35] font-medium max-w-[15rem]">{{ bottomBannerMosaic.left.subtitle }}</div>
                <div class="banner-cta-pill mt-4 inline-flex items-center justify-center h-10 px-5 text-[10px] font-extrabold uppercase tracking-[0.18em]" :style="bannerCtaStyle(bottomBannerMosaic.left)">{{ bannerCtaText(bottomBannerMosaic.left) }}</div>
              </div>
            </div>
            <div class="grid grid-rows-2 gap-4 lg:gap-5">
              <div class="home-banner-card relative h-[148px] overflow-hidden cursor-pointer" @click="navigateTo(bottomBannerMosaic.centerTop.link || '/shop')">
                <img :src="bottomBannerMosaic.centerTop.image" :alt="bottomBannerMosaic.centerTop.title" class="home-banner-img w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/5"></div>
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center px-8 text-white">
                  <div class="text-[18px] font-medium leading-tight">{{ bottomBannerMosaic.centerTop.title }}</div>
                  <div class="mt-2 text-xs opacity-90">{{ bottomBannerMosaic.centerTop.subtitle }}</div>
                  <div class="banner-cta-pill mt-4 inline-flex items-center justify-center h-8 px-5 text-[10px] font-extrabold uppercase tracking-[0.16em]" :style="bannerCtaStyle(bottomBannerMosaic.centerTop)">{{ bannerCtaText(bottomBannerMosaic.centerTop) }}</div>
                </div>
              </div>
              <div class="home-banner-card relative h-[148px] overflow-hidden cursor-pointer" @click="navigateTo(bottomBannerMosaic.centerBottom.link || '/shop')">
                <img :src="bottomBannerMosaic.centerBottom.image" :alt="bottomBannerMosaic.centerBottom.title" class="home-banner-img w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/10"></div>
                <div class="absolute inset-0 flex flex-col justify-end px-7 pb-6 text-white">
                  <div class="text-[18px] font-medium leading-tight max-w-[13rem]">{{ bottomBannerMosaic.centerBottom.title }}</div>
                  <div class="mt-2 text-xs opacity-90">{{ bottomBannerMosaic.centerBottom.subtitle }}</div>
                  <div class="banner-cta-pill mt-4 inline-flex items-center justify-center h-8 px-5 text-[10px] font-extrabold uppercase tracking-[0.16em] w-fit" :style="bannerCtaStyle(bottomBannerMosaic.centerBottom)">{{ bannerCtaText(bottomBannerMosaic.centerBottom) }}</div>
                </div>
              </div>
            </div>
            <div class="home-banner-card relative h-[320px] overflow-hidden cursor-pointer" @click="navigateTo(bottomBannerMosaic.right.link || '/shop')">
              <img :src="bottomBannerMosaic.right.image" :alt="bottomBannerMosaic.right.title" class="home-banner-img w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/5"></div>
              <div class="absolute inset-0 flex flex-col items-center justify-start text-center px-8 pt-7 text-white">
                <div class="inline-flex items-center px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] bg-[color:var(--color-accent,#FACC15)] text-gray-900">{{ bottomBannerMosaic.right.title }}</div>
                <div class="mt-4 text-[17px] leading-[1.35] font-medium max-w-[15rem]">{{ bottomBannerMosaic.right.subtitle }}</div>
                <div class="banner-cta-pill mt-4 inline-flex items-center justify-center h-10 px-5 text-[10px] font-extrabold uppercase tracking-[0.18em]" :style="bannerCtaStyle(bottomBannerMosaic.right)">{{ bannerCtaText(bottomBannerMosaic.right) }}</div>
              </div>
            </div>
          </div>
          <div v-else-if="bAfterTopProducts.length >= 3" class="grid grid-cols-1 lg:grid-cols-[1fr,1fr,1fr] gap-4 lg:gap-5">
            <div v-for="b in bAfterTopProducts.slice(0, 3)" :key="b.id" class="home-banner-card relative h-[220px] lg:h-[300px] overflow-hidden cursor-pointer" @click="navigateTo(b.link || '/shop')">
              <img :src="b.image" :alt="b.title" class="home-banner-img w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/10"></div>
              <div class="absolute inset-0 flex flex-col justify-center px-8 text-white">
                <div class="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[color:var(--color-accent,#FACC15)]">{{ b.title }}</div>
                <div class="mt-4 text-[18px] lg:text-[20px] leading-tight font-bold max-w-[16rem]">{{ b.subtitle }}</div>
                <div class="banner-cta-pill mt-4 inline-flex items-center justify-center h-10 px-5 text-[10px] font-extrabold uppercase tracking-[0.16em] w-fit" :style="bannerCtaStyle(b)">{{ bannerCtaText(b) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="homeLayout === 5">
        <div v-if="!isSectionConfigured('bannerAfterFeatures') && bAfterFeatures.length" class="container py-10 sm:py-12">
          <ClientOnly>
            <Swiper v-if="homeBanners.layout === 'carousel'" :slides-per-view="1" :space-between="16" :breakpoints="{ '640': { slidesPerView: 2 }, '1024': { slidesPerView: 3 } }" class="mt-6">
              <SwiperSlide v-for="b in bAfterFeatures" :key="b.id">
                <div class="relative overflow-hidden h-[200px] max-w-[546px] w-full mx-auto cursor-pointer border border-gray-200 bg-white" @click="navigateTo(b.link || '/shop')">
                  <img :src="b.image" :alt="b.title" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent flex flex-col justify-center px-7 text-white">
                    <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ b.title }}</div>
                    <div class="text-xl font-extrabold mt-2 leading-tight max-w-[18rem]">{{ b.subtitle }}</div>
                    <div class="banner-cta-pill mt-5 inline-flex items-center justify-center h-10 px-5 text-[10px] font-extrabold uppercase tracking-[0.18em] w-fit" :style="bannerCtaStyle(b)">{{ bannerCtaText(b) }}</div>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
          </ClientOnly>
        </div>

        <div v-if="!isSectionConfigured('bannerAfterTopDeals') && bAfterTopDeals.length" class="container py-10 sm:py-12">
          <ClientOnly>
            <Swiper v-if="homeBanners.layout === 'carousel'" :slides-per-view="1" :space-between="16" :breakpoints="{ '640': { slidesPerView: 2 }, '1024': { slidesPerView: 3 } }" class="mt-6">
              <SwiperSlide v-for="b in bAfterTopDeals" :key="b.id">
                <div class="relative overflow-hidden h-[200px] max-w-[546px] w-full mx-auto cursor-pointer border border-gray-200 bg-white" @click="navigateTo(b.link || '/shop')">
                  <img :src="b.image" :alt="b.title" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent flex flex-col justify-center px-7 text-white">
                    <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ b.title }}</div>
                    <div class="text-xl font-extrabold mt-2 leading-tight max-w-[18rem]">{{ b.subtitle }}</div>
                    <div class="banner-cta-pill mt-5 inline-flex items-center justify-center h-10 px-5 text-[10px] font-extrabold uppercase tracking-[0.18em] w-fit" :style="bannerCtaStyle(b)">{{ bannerCtaText(b) }}</div>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
          </ClientOnly>
        </div>

        <div v-if="!isSectionConfigured('bannerAfterTopProducts') && bAfterTopProducts.length" class="container py-10 sm:py-12">
          <ClientOnly>
            <Swiper v-if="homeBanners.layout === 'carousel'" :slides-per-view="1" :space-between="16" :breakpoints="{ '640': { slidesPerView: 2 }, '1024': { slidesPerView: 3 } }" class="mt-6">
              <SwiperSlide v-for="b in bAfterTopProducts" :key="b.id">
                <div class="relative overflow-hidden h-[200px] max-w-[546px] w-full mx-auto cursor-pointer border border-gray-200 bg-white" @click="navigateTo(b.link || '/shop')">
                  <img :src="b.image" :alt="b.title" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent flex flex-col justify-center px-7 text-white">
                    <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ b.title }}</div>
                    <div class="text-xl font-extrabold mt-2 leading-tight max-w-[18rem]">{{ b.subtitle }}</div>
                    <div class="banner-cta-pill mt-5 inline-flex items-center justify-center h-10 px-5 text-[10px] font-extrabold uppercase tracking-[0.18em] w-fit" :style="bannerCtaStyle(b)">{{ bannerCtaText(b) }}</div>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
          </ClientOnly>
        </div>

        <div v-if="!isSectionConfigured('appPromo') && appPromo.enabled" class="container py-16">
          <div class="bg-blue-600 rounded-3xl p-12 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative">
            <div class="absolute -top-24 -left-24 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
            <div class="absolute -bottom-24 -right-24 w-64 h-64 bg-white rounded-full opacity-10 blur-3xl"></div>

            <div class="lg:w-1/2 text-white relative z-10">
              <h2 class="text-4xl font-extrabold mb-6 leading-tight">{{ appPromo.title }}</h2>
              <p class="text-blue-100 text-lg mb-10 leading-relaxed">{{ appPromo.subtitle }}</p>
              <div class="flex flex-wrap gap-4">
                <a :href="appPromo.androidLink" class="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold flex items-center hover:bg-gray-100 transition-all shadow-lg">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/2560px-Google_Play_Store_badge_EN.svg.png" alt="Play Store" class="h-6" />
                </a>
                <a :href="appPromo.iosLink" class="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold flex items-center hover:bg-black transition-all shadow-lg border border-gray-800">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/2560px-Download_on_the_App_Store_Badge.svg.png" alt="App Store" class="h-6" />
                </a>
              </div>
            </div>
            <div class="lg:w-1/2 flex justify-center relative z-10">
              <img :src="appPromo.image" :alt="appPromo.title" class="w-64 rounded-[3rem] border-8 border-gray-900 shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="homeLayout === 4">

      <HomeFeatures v-if="!isSectionConfigured('features')" />
      <FeaturedCategoriesSection v-if="!isSectionConfigured('featuredCategories')" />
      <FeaturedSellersSection v-if="!isSectionConfigured('featuredSellers')" />
      <FeaturedSellerProductsSection v-if="!isSectionConfigured('sellerProducts')" />
      <TrendingNowSection v-if="!isSectionConfigured('trendingNow')" />
      <MarketHighlightsSection v-if="!isSectionConfigured('marketHighlights')" />

      <div v-if="!isSectionConfigured('bannerAfterFeatures') && showBannersAfterFeatures" class="container py-10 sm:py-12">
        <ClientOnly>
          <Swiper v-if="homeBanners.layout === 'carousel'" :slides-per-view="1" :space-between="16" :breakpoints="{ '640': { slidesPerView: 2 }, '1024': { slidesPerView: 3 } }" class="mt-6">
            <SwiperSlide v-for="b in bAfterFeatures" :key="b.id">
              <div class="relative overflow-hidden h-[200px] max-w-[546px] w-full mx-auto cursor-pointer border border-gray-200 bg-white" @click="navigateTo(b.link || '/shop')">
                <img :src="b.image" :alt="b.title" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent flex flex-col justify-center px-7 text-white">
                  <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ b.title }}</div>
                  <div class="text-xl font-extrabold mt-2 leading-tight max-w-[18rem]">{{ b.subtitle }}</div>
                  <div class="banner-cta-pill mt-5 inline-flex items-center justify-center h-10 px-5 text-[10px] font-extrabold uppercase tracking-[0.18em] w-fit" :style="bannerCtaStyle(b)">{{ bannerCtaText(b) }}</div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>

          <div v-else class="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr,1.4fr] gap-6">
            <div v-if="bAfterFeatures[0]" class="relative overflow-hidden h-[200px] lg:h-[420px] border border-gray-200 bg-white cursor-pointer" @click="navigateTo(bAfterFeatures[0].link || '/shop')">
              <img :src="bAfterFeatures[0].image" :alt="bAfterFeatures[0].title" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/25"></div>
              <div class="absolute inset-0 flex flex-col justify-center px-8 text-white">
                <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ bAfterFeatures[0].title }}</div>
                <div class="text-2xl font-extrabold mt-2 leading-tight">{{ bAfterFeatures[0].subtitle }}</div>
              </div>
            </div>
            <div class="grid grid-rows-2 gap-6">
              <div v-if="bAfterFeatures[1]" class="relative overflow-hidden h-[200px] border border-gray-200 bg-white cursor-pointer" @click="navigateTo(bAfterFeatures[1].link || '/shop')">
                <img :src="bAfterFeatures[1].image" :alt="bAfterFeatures[1].title" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/25"></div>
                <div class="absolute inset-0 flex flex-col justify-center px-8 text-white">
                  <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ bAfterFeatures[1].title }}</div>
                  <div class="text-xl font-extrabold mt-2 leading-tight">{{ bAfterFeatures[1].subtitle }}</div>
                </div>
              </div>
              <div v-if="bAfterFeatures[2]" class="relative overflow-hidden h-[200px] border border-gray-200 bg-white cursor-pointer" @click="navigateTo(bAfterFeatures[2].link || '/shop')">
                <img :src="bAfterFeatures[2].image" :alt="bAfterFeatures[2].title" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/25"></div>
                <div class="absolute inset-0 flex flex-col justify-center px-8 text-white">
                  <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ bAfterFeatures[2].title }}</div>
                  <div class="text-xl font-extrabold mt-2 leading-tight">{{ bAfterFeatures[2].subtitle }}</div>
                </div>
              </div>
            </div>
            <div v-if="bAfterFeatures[3]" class="relative overflow-hidden h-[200px] lg:h-[420px] border border-gray-200 bg-white cursor-pointer" @click="navigateTo(bAfterFeatures[3].link || '/shop')">
              <img :src="bAfterFeatures[3].image" :alt="bAfterFeatures[3].title" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/25"></div>
              <div class="absolute inset-0 flex flex-col justify-center px-8 text-white">
                <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ bAfterFeatures[3].title }}</div>
                <div class="text-2xl font-extrabold mt-2 leading-tight">{{ bAfterFeatures[3].subtitle }}</div>
              </div>
            </div>
          </div>
        </ClientOnly>
      </div>

      <HomeTopDeals v-if="!isSectionConfigured('topDeals')" />

      <template v-if="homeLayout !== 4">
        <HomeFeatures v-if="!isSectionConfigured('features')" />
        <FeaturedCategoriesSection v-if="!isSectionConfigured('featuredCategories')" />
        <FeaturedSellersSection v-if="!isSectionConfigured('featuredSellers')" />
        <FeaturedSellerProductsSection v-if="!isSectionConfigured('sellerProducts')" />
        <TrendingNowSection v-if="!isSectionConfigured('trendingNow')" />
        <MarketHighlightsSection v-if="!isSectionConfigured('marketHighlights')" />
      </template>

      <div v-if="!isSectionConfigured('bannerAfterTopDeals') && showBannersAfterTopDeals" class="container py-10 sm:py-12">
        <ClientOnly>
          <Swiper v-if="homeBanners.layout === 'carousel'" :slides-per-view="1" :space-between="16" :breakpoints="{ '640': { slidesPerView: 2 }, '1024': { slidesPerView: 3 } }" class="mt-6">
            <SwiperSlide v-for="b in bAfterTopDeals" :key="b.id">
              <div class="relative overflow-hidden h-[200px] max-w-[546px] w-full mx-auto cursor-pointer border border-gray-200 bg-white" @click="navigateTo(b.link || '/shop')">
                <img :src="b.image" :alt="b.title" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent flex flex-col justify-center px-7 text-white">
                  <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ b.title }}</div>
                  <div class="text-xl font-extrabold mt-2 leading-tight max-w-[18rem]">{{ b.subtitle }}</div>
                  <div class="banner-cta-pill mt-5 inline-flex items-center justify-center h-10 px-5 text-[10px] font-extrabold uppercase tracking-[0.18em] w-fit" :style="bannerCtaStyle(b)">{{ bannerCtaText(b) }}</div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
          <div v-else class="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr,1.4fr] gap-6">
            <div v-if="bAfterTopDeals[0]" class="relative overflow-hidden h-[200px] lg:h-[420px] border border-gray-200 bg-white cursor-pointer" @click="navigateTo(bAfterTopDeals[0].link || '/shop')">
              <img :src="bAfterTopDeals[0].image" :alt="bAfterTopDeals[0].title" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/25"></div>
              <div class="absolute inset-0 flex flex-col justify-center px-8 text-white">
                <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ bAfterTopDeals[0].title }}</div>
                <div class="text-2xl font-extrabold mt-2 leading-tight">{{ bAfterTopDeals[0].subtitle }}</div>
              </div>
            </div>
            <div class="grid grid-rows-2 gap-6">
              <div v-if="bAfterTopDeals[1]" class="relative overflow-hidden h-[200px] border border-gray-200 bg-white cursor-pointer" @click="navigateTo(bAfterTopDeals[1].link || '/shop')">
                <img :src="bAfterTopDeals[1].image" :alt="bAfterTopDeals[1].title" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/25"></div>
                <div class="absolute inset-0 flex flex-col justify-center px-8 text-white">
                  <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ bAfterTopDeals[1].title }}</div>
                  <div class="text-xl font-extrabold mt-2 leading-tight">{{ bAfterTopDeals[1].subtitle }}</div>
                </div>
              </div>
              <div v-if="bAfterTopDeals[2]" class="relative overflow-hidden h-[200px] border border-gray-200 bg-white cursor-pointer" @click="navigateTo(bAfterTopDeals[2].link || '/shop')">
                <img :src="bAfterTopDeals[2].image" :alt="bAfterTopDeals[2].title" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/25"></div>
                <div class="absolute inset-0 flex flex-col justify-center px-8 text-white">
                  <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ bAfterTopDeals[2].title }}</div>
                  <div class="text-xl font-extrabold mt-2 leading-tight">{{ bAfterTopDeals[2].subtitle }}</div>
                </div>
              </div>
            </div>
            <div v-if="bAfterTopDeals[3]" class="relative overflow-hidden h-[200px] lg:h-[420px] border border-gray-200 bg-white cursor-pointer" @click="navigateTo(bAfterTopDeals[3].link || '/shop')">
              <img :src="bAfterTopDeals[3].image" :alt="bAfterTopDeals[3].title" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/25"></div>
              <div class="absolute inset-0 flex flex-col justify-center px-8 text-white">
                <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ bAfterTopDeals[3].title }}</div>
                <div class="text-2xl font-extrabold mt-2 leading-tight">{{ bAfterTopDeals[3].subtitle }}</div>
              </div>
            </div>
          </div>
        </ClientOnly>
      </div>

      <div v-if="!isSectionConfigured('promoStrip') && homeStore.config?.promoStrip?.enabled && promoStripItems.length" class="border-y border-gray-200 bg-white overflow-hidden">
        <div class="container py-4">
          <div class="flex animate-marquee whitespace-nowrap text-gray-800 font-extrabold text-sm uppercase tracking-widest" :style="{ animationDuration: promoStripSpeed + 's' }">
            <template v-for="rep in 2" :key="rep">
              <span v-for="(txt, idx) in promoStripItems" :key="`${rep}-${idx}`" class="mx-10 flex items-center">
                <span class="w-2 h-2 bg-[color:var(--color-accent,#FFD200)] mr-4"></span>
                {{ txt }}
              </span>
            </template>
          </div>
        </div>
      </div>

      <HomeTopSelling v-if="!isSectionConfigured('topSelling')" />
      <HomeTopProducts v-if="!isSectionConfigured('topProducts')" />

      <div v-if="!isSectionConfigured('bannerAfterTopProducts') && showBannersAfterTopProducts" class="container py-10 sm:py-12">
        <ClientOnly>
          <Swiper v-if="homeBanners.layout === 'carousel'" :slides-per-view="1" :space-between="16" :breakpoints="{ '640': { slidesPerView: 2 }, '1024': { slidesPerView: 3 } }" class="mt-6">
            <SwiperSlide v-for="b in bAfterTopProducts" :key="b.id">
              <div class="relative overflow-hidden h-[200px] max-w-[546px] w-full mx-auto cursor-pointer border border-gray-200 bg-white" @click="navigateTo(b.link || '/shop')">
                <img :src="b.image" :alt="b.title" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent flex flex-col justify-center px-7 text-white">
                  <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ b.title }}</div>
                  <div class="text-xl font-extrabold mt-2 leading-tight max-w-[18rem]">{{ b.subtitle }}</div>
                  <div class="banner-cta-pill mt-5 inline-flex items-center justify-center h-10 px-5 text-[10px] font-extrabold uppercase tracking-[0.18em] w-fit" :style="bannerCtaStyle(b)">{{ bannerCtaText(b) }}</div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
          <div v-else class="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr,1.4fr] gap-6">
            <div v-if="bAfterTopProducts[0]" class="relative overflow-hidden h-[200px] lg:h-[420px] border border-gray-200 bg-white cursor-pointer" @click="navigateTo(bAfterTopProducts[0].link || '/shop')">
              <img :src="bAfterTopProducts[0].image" :alt="bAfterTopProducts[0].title" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/25"></div>
              <div class="absolute inset-0 flex flex-col justify-center px-8 text-white">
                <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ bAfterTopProducts[0].title }}</div>
                <div class="text-2xl font-extrabold mt-2 leading-tight">{{ bAfterTopProducts[0].subtitle }}</div>
              </div>
            </div>
            <div class="grid grid-rows-2 gap-6">
              <div v-if="bAfterTopProducts[1]" class="relative overflow-hidden h-[200px] border border-gray-200 bg-white cursor-pointer" @click="navigateTo(bAfterTopProducts[1].link || '/shop')">
                <img :src="bAfterTopProducts[1].image" :alt="bAfterTopProducts[1].title" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/25"></div>
                <div class="absolute inset-0 flex flex-col justify-center px-8 text-white">
                  <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ bAfterTopProducts[1].title }}</div>
                  <div class="text-xl font-extrabold mt-2 leading-tight">{{ bAfterTopProducts[1].subtitle }}</div>
                </div>
              </div>
              <div v-if="bAfterTopProducts[2]" class="relative overflow-hidden h-[200px] border border-gray-200 bg-white cursor-pointer" @click="navigateTo(bAfterTopProducts[2].link || '/shop')">
                <img :src="bAfterTopProducts[2].image" :alt="bAfterTopProducts[2].title" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/25"></div>
                <div class="absolute inset-0 flex flex-col justify-center px-8 text-white">
                  <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ bAfterTopProducts[2].title }}</div>
                  <div class="text-xl font-extrabold mt-2 leading-tight">{{ bAfterTopProducts[2].subtitle }}</div>
                </div>
              </div>
            </div>
            <div v-if="bAfterTopProducts[3]" class="relative overflow-hidden h-[200px] lg:h-[420px] border border-gray-200 bg-white cursor-pointer" @click="navigateTo(bAfterTopProducts[3].link || '/shop')">
              <img :src="bAfterTopProducts[3].image" :alt="bAfterTopProducts[3].title" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/25"></div>
              <div class="absolute inset-0 flex flex-col justify-center px-8 text-white">
                <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ bAfterTopProducts[3].title }}</div>
                <div class="text-2xl font-extrabold mt-2 leading-tight">{{ bAfterTopProducts[3].subtitle }}</div>
              </div>
            </div>
          </div>
        </ClientOnly>
      </div>
      <HomeNewArrivals v-if="!isSectionConfigured('newArrivals')" />
      <HomeRecentlyViewed v-if="!isSectionConfigured('recentlyViewed')" />

      <BrandLogoStripSection v-if="!isSectionConfigured('brandStrip')" :brands="brands" />

      <div v-if="!isSectionConfigured('appPromo') && appPromo.enabled" class="container py-16">
        <div class="bg-blue-600 rounded-3xl p-12 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative">
          <div class="absolute -top-24 -left-24 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
          <div class="absolute -bottom-24 -right-24 w-64 h-64 bg-white rounded-full opacity-10 blur-3xl"></div>
          
          <div class="lg:w-1/2 text-white relative z-10">
            <h2 class="text-4xl font-extrabold mb-6 leading-tight">{{ appPromo.title }}</h2>
            <p class="text-blue-100 text-lg mb-10 leading-relaxed">{{ appPromo.subtitle }}</p>
            <div class="flex flex-wrap gap-4">
              <a :href="appPromo.androidLink" class="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold flex items-center hover:bg-gray-100 transition-all shadow-lg">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/2560px-Google_Play_Store_badge_EN.svg.png" alt="Play Store" class="h-6" />
              </a>
              <a :href="appPromo.iosLink" class="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold flex items-center hover:bg-black transition-all shadow-lg border border-gray-800">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/2560px-Download_on_the_App_Store_Badge.svg.png" alt="App Store" class="h-6" />
              </a>
            </div>
          </div>
          <div class="lg:w-1/2 flex justify-center relative z-10">
            <img :src="appPromo.image" alt="App Mockup" class="w-64 rounded-[3rem] border-8 border-gray-900 shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-500" />
          </div>
        </div>
      </div>
      </div>

    <div v-else-if="homeLayout === 3">
      <HomeFeatures v-if="!isSectionConfigured('features')" />

      <div v-if="!isSectionConfigured('middleBanners')" class="container py-10 sm:py-12">
        <ClientOnly>
          <Swiper :slides-per-view="1" :space-between="16" :breakpoints="{ '640': { slidesPerView: 2 }, '1024': { slidesPerView: 3 } }" class="mt-6">
            <SwiperSlide v-for="b in middleBanners" :key="b.id">
              <div class="relative overflow-hidden h-[200px] max-w-[546px] w-full mx-auto cursor-pointer border border-gray-200 bg-white" @click="navigateTo(b.link || '/shop')">
                <img :src="b.image" :alt="b.title" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent flex flex-col justify-center px-7 text-white">
                  <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FACC15)]">{{ b.title }}</div>
                  <div class="text-xl font-extrabold mt-2 leading-tight max-w-[18rem]">{{ b.subtitle }}</div>
                  <div class="banner-cta-pill mt-5 inline-flex items-center justify-center h-10 px-5 text-[10px] font-extrabold uppercase tracking-[0.18em] w-fit" :style="bannerCtaStyle(b)">{{ bannerCtaText(b) }}</div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
          <template #fallback>
            <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="b in middleBanners" :key="b.id" class="h-48 sm:h-56 border border-gray-200 bg-white"></div>
            </div>
          </template>
        </ClientOnly>
      </div>

      <HomeTopDeals v-if="!isSectionConfigured('topDeals')" />

      <div v-if="!isSectionConfigured('promoStrip') && homeStore.config?.promoStrip?.enabled && promoStripItems.length" class="border-y border-gray-200 bg-white overflow-hidden">
        <div class="container py-4">
          <div class="flex animate-marquee whitespace-nowrap text-gray-800 font-extrabold text-sm uppercase tracking-widest" :style="{ animationDuration: promoStripSpeed + 's' }">
            <template v-for="rep in 2" :key="rep">
              <span v-for="(txt, idx) in promoStripItems" :key="`${rep}-${idx}`" class="mx-10 flex items-center">
                <span class="w-2 h-2 bg-[color:var(--color-accent,#FACC15)] mr-4"></span>
                {{ txt }}
              </span>
            </template>
          </div>
        </div>
      </div>

      <HomeTopSelling v-if="!isSectionConfigured('topSelling')" />
      <HomeTopProducts v-if="!isSectionConfigured('topProducts')" />
      <HomeNewArrivals v-if="!isSectionConfigured('newArrivals')" />
      <HomeRecentlyViewed v-if="!isSectionConfigured('recentlyViewed')" />

      <BrandLogoStripSection v-if="!isSectionConfigured('brandStrip')" :brands="brands" />

      <div v-if="!isSectionConfigured('appPromo') && appPromo.enabled" class="container py-16">
        <div class="bg-blue-600 rounded-3xl p-12 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative">
          <div class="absolute -top-24 -left-24 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
          <div class="absolute -bottom-24 -right-24 w-64 h-64 bg-white rounded-full opacity-10 blur-3xl"></div>
          
          <div class="lg:w-1/2 text-white relative z-10">
            <h2 class="text-4xl font-extrabold mb-6 leading-tight">{{ appPromo.title }}</h2>
            <p class="text-blue-100 text-lg mb-10 leading-relaxed">{{ appPromo.subtitle }}</p>
            <div class="flex flex-wrap gap-4">
              <a :href="appPromo.androidLink" class="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold flex items-center hover:bg-gray-100 transition-all shadow-lg">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/2560px-Google_Play_Store_badge_EN.svg.png" alt="Play Store" class="h-6" />
              </a>
              <a :href="appPromo.iosLink" class="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold flex items-center hover:bg-black transition-all shadow-lg border border-gray-800">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/2560px-Download_on_the_App_Store_Badge.svg.png" alt="App Store" class="h-6" />
              </a>
            </div>
          </div>
          <div class="lg:w-1/2 flex justify-center relative z-10">
            <img :src="appPromo.image" alt="App Mockup" class="w-64 rounded-[3rem] border-8 border-gray-900 shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-500" />
          </div>
        </div>
      </div>
    </div>

    <template v-else>
      <HomeFeatures v-if="!isSectionConfigured('features')" />

      <div v-if="!isSectionConfigured('middleBanners')" class="container py-10 sm:py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="b in middleBanners" :key="b.id" class="relative overflow-hidden h-56 sm:h-60 group cursor-pointer border border-gray-200 bg-white">
          <img :src="b.image" :alt="b.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent flex flex-col justify-center px-8 text-white">
            <span class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FACC15)]">{{ b.title }}</span>
            <h3 class="text-2xl font-extrabold mt-2 leading-tight max-w-[18rem]">{{ b.subtitle }}</h3>
            <NuxtLink :to="b.link || '/shop'" class="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-white hover:text-white/90 transition-colors w-fit">
              <span class="banner-cta-pill inline-flex items-center justify-center h-10 px-5 text-[10px] font-extrabold uppercase tracking-[0.18em]" :style="bannerCtaStyle(b)">{{ bannerCtaText(b) }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
      </div>

      <HomeTopDeals v-if="!isSectionConfigured('topDeals')" />

      <HomeNewArrivals v-if="!isSectionConfigured('newArrivals')" />

      <HomeRecentlyViewed v-if="!isSectionConfigured('recentlyViewed')" />

      <div v-if="!isSectionConfigured('promoStrip') && homeStore.config?.promoStrip?.enabled && promoStripItems.length" class="border-y border-gray-200 bg-white overflow-hidden">
      <div class="container py-4">
        <div class="flex animate-marquee whitespace-nowrap text-gray-800 font-extrabold text-sm uppercase tracking-widest" :style="{ animationDuration: promoStripSpeed + 's' }">
          <template v-for="rep in 2" :key="rep">
            <span v-for="(txt, idx) in promoStripItems" :key="`${rep}-${idx}`" class="mx-10 flex items-center">
              <span class="w-2 h-2 bg-[color:var(--color-accent,#FACC15)] mr-4"></span>
              {{ txt }}
            </span>
          </template>
        </div>
      </div>
      </div>

      <HomeTopSelling v-if="!isSectionConfigured('topSelling')" />

      <HomeTopProducts v-if="!isSectionConfigured('topProducts')" />

      <BrandLogoStripSection v-if="!isSectionConfigured('brandStrip')" :brands="brands" />

      <div v-if="!isSectionConfigured('appPromo') && appPromo.enabled" class="container py-16">
      <div class="bg-blue-600 rounded-3xl p-12 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative">
        <div class="absolute -top-24 -left-24 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
        <div class="absolute -bottom-24 -right-24 w-64 h-64 bg-white rounded-full opacity-10 blur-3xl"></div>
        
        <div class="lg:w-1/2 text-white relative z-10">
          <h2 class="text-4xl font-extrabold mb-6 leading-tight">{{ appPromo.title }}</h2>
          <p class="text-blue-100 text-lg mb-10 leading-relaxed">{{ appPromo.subtitle }}</p>
          <div class="flex flex-wrap gap-4">
            <a :href="appPromo.androidLink" class="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold flex items-center hover:bg-gray-100 transition-all shadow-lg">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/2560px-Google_Play_Store_badge_EN.svg.png" alt="Play Store" class="h-6" />
            </a>
            <a :href="appPromo.iosLink" class="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold flex items-center hover:bg-black transition-all shadow-lg border border-gray-800">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/2560px-Download_on_the_App_Store_Badge.svg.png" alt="App Store" class="h-6" />
            </a>
          </div>
        </div>
        <div class="lg:w-1/2 flex justify-center relative z-10">
          <img :src="appPromo.image" alt="App Mockup" class="w-64 rounded-[3rem] border-8 border-gray-900 shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-500" />
        </div>
      </div>
      </div>
    </template>
  </div>
</template>

<style>
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-marquee {
  animation: marquee 30s linear infinite;
  display: flex;
  width: max-content;
}
@media (max-width: 767px) {
  .home-density-compact :is(.container.py-16, .container.py-20) {
    padding-top: 2.5rem;
    padding-bottom: 2.5rem;
  }
  .home-density-compact h2.text-4xl {
    font-size: 1.875rem;
    line-height: 2.2rem;
  }
  .home-density-compact .text-2xl.font-extrabold {
    font-size: 1.25rem;
    line-height: 1.7rem;
  }
}
</style>
