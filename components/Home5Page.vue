<script setup lang="ts">
import FeaturedCategoriesSection from '~/components/home/FeaturedCategoriesSection.vue'
import BannerPlacementSection from '~/components/home/BannerPlacementSection.vue'
import AppPromoSection from '~/components/home/AppPromoSection.vue'
import BrandLogoStripSection from '~/components/home/BrandLogoStripSection.vue'
import FeaturedSellerProductsSection from '~/components/home/FeaturedSellerProductsSection.vue'
import FeaturedSellersSection from '~/components/home/FeaturedSellersSection.vue'
import MarketHighlightsSection from '~/components/home/MarketHighlightsSection.vue'
import TrendingNowSection from '~/components/home/TrendingNowSection.vue'
import { getPlacementBanners, normalizeHomeBannerLayout } from '~/utils/homepage-layout'
import { useBannerStore } from '~/stores/banners'
import { useBrandStore } from '~/stores/brands'
import { useHomeSectionsStore } from '~/stores/homeSections'
import { useSettingsStore } from '~/stores/settings'

const bannerStore = useBannerStore()
const brandStore = useBrandStore()
const homeStore = useHomeSectionsStore()
const settingsStore = useSettingsStore()

if (!homeStore.hydrated) {
  await homeStore.fetchConfig()
}
if (!settingsStore.hydrated) {
  await settingsStore.fetchSettings()
}
if (!bannerStore.hydrated) {
  await bannerStore.fetchBanners()
}

const brands = computed(() => brandStore.brands.filter((b: any) => b.status === 'Aktiv'))
const appPromo = computed(() => settingsStore.settings.appPromo)
const homeBanners = computed(() => {
  const d: any = settingsStore.settings.design || {}
  return {
    layout: normalizeHomeBannerLayout(d.homeBannersLayout) as 'carousel' | 'mosaic'
  }
})

const bannersFor = (place: 'afterFeatures' | 'afterTopDeals' | 'afterTopProducts') => {
  const d: any = settingsStore.settings.design || {}
  const layout = normalizeHomeBannerLayout(d.homeBannersLayout)
  const fallbackPlace = (['afterFeatures', 'afterTopDeals', 'afterTopProducts'].includes(String(d.homeBannersPlacement)) ? String(d.homeBannersPlacement) : 'afterFeatures') as any
  return getPlacementBanners(bannerStore.banners as any[], place, layout, fallbackPlace)
}

const bAfterFeatures = computed(() => bannersFor('afterFeatures'))
const bAfterTopDeals = computed(() => bannersFor('afterTopDeals'))
const bAfterTopProducts = computed(() => bannersFor('afterTopProducts'))
</script>

<template>
  <div class="bg-white">
    <HeroSlider5 />

    <HomeFeatures />
    <FeaturedCategoriesSection />
    <FeaturedSellersSection />
    <FeaturedSellerProductsSection />
    <TrendingNowSection />
    <MarketHighlightsSection />

    <BannerPlacementSection v-if="bAfterFeatures.length" :banners="bAfterFeatures" :layout-mode="homeBanners.layout" />

    <HomeTopDeals />

    <BannerPlacementSection v-if="bAfterTopDeals.length" :banners="bAfterTopDeals" :layout-mode="homeBanners.layout" section-style="topDealsPair" />

    <HomeTopSelling />
    <HomeTopProducts />

    <BannerPlacementSection v-if="bAfterTopProducts.length" :banners="bAfterTopProducts" :layout-mode="homeBanners.layout" />

    <HomeNewArrivals />
    <HomeRecentlyViewed />

    <BrandLogoStripSection :brands="brands" />

    <AppPromoSection :promo="appPromo" />
  </div>
</template>
