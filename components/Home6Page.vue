<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'

import FeaturedCategoriesSection from '~/components/home/FeaturedCategoriesSection.vue'
import BrandLogoStripSection from '~/components/home/BrandLogoStripSection.vue'
import FeaturedSellerProductsSection from '~/components/home/FeaturedSellerProductsSection.vue'
import FeaturedSellersSection from '~/components/home/FeaturedSellersSection.vue'
import MarketHighlightsSection from '~/components/home/MarketHighlightsSection.vue'
import TrendingNowSection from '~/components/home/TrendingNowSection.vue'
import { useBannerStore } from '~/stores/banners'
import { useBrandStore } from '~/stores/brands'
import { useHomeSectionsStore } from '~/stores/homeSections'
import { useSettingsStore } from '~/stores/settings'

const bannerStore = useBannerStore()
const brandStore = useBrandStore()
const homeStore = useHomeSectionsStore()
const settingsStore = useSettingsStore()
const { t, lang } = useT()

if (!homeStore.hydrated) {
  await homeStore.fetchConfig()
}
if (!settingsStore.hydrated) {
  await settingsStore.fetchSettings()
}
if (!bannerStore.hydrated) {
  await bannerStore.fetchBanners()
}

const homeBanners = computed(() => {
  const d: any = settingsStore.settings.design || {}
  return {
    layout: (d.homeBannersLayout === 'mosaic' ? 'mosaic' : 'carousel') as 'carousel' | 'mosaic'
  }
})

const bannersFor = (place: 'afterFeatures' | 'afterTopDeals' | 'afterTopProducts') => {
  const d: any = settingsStore.settings.design || {}
  const limitMap = {
    afterFeatures: 3,
    afterTopDeals: 2,
    afterTopProducts: 4
  } as const
  const limit = limitMap[place]
  const fallbackPlace = (['afterFeatures', 'afterTopDeals', 'afterTopProducts'].includes(String(d.homeBannersPlacement)) ? String(d.homeBannersPlacement) : 'afterFeatures') as any
  const active = bannerStore.banners.filter((b: any) => b.status === 'Aktiv')
  const middle = active.filter((b: any) => b.position === 'Middle')
  return middle.filter((b: any) => String(b.homePlacement || fallbackPlace) === place).slice(0, limit)
}

const bAfterFeatures = computed(() => bannersFor('afterFeatures'))
const bAfterTopDeals = computed(() => bannersFor('afterTopDeals'))
const bAfterTopProducts = computed(() => bannersFor('afterTopProducts'))
const bottomBannerMosaic = computed(() => {
  const list = bAfterTopProducts.value
  return {
    left: list[0] || null,
    centerTop: list[1] || null,
    centerBottom: list[2] || null,
    right: list[3] || null
  }
})

const promoStripItems = computed(() => {
  const cfg: any = homeStore.config
  const l = lang.value
  const items = Array.isArray(cfg?.promoStrip?.itemsI18n) ? cfg.promoStrip.itemsI18n : []
  return items.map((x: any) => String(x?.[l] || x?.az || '').trim()).filter(Boolean)
})

const promoStripSpeed = computed(() => {
  const cfg: any = homeStore.config
  const v = Number(cfg?.promoStrip?.speedSec || 30)
  return Math.max(10, Math.min(120, v))
})

const brands = computed(() => brandStore.brands.filter((b: any) => b.status === 'Aktiv'))
const bannerCtaText = (b: any) => String(b?.ctaText || t('discover_now' as any))
const bannerCtaStyle = (b: any) => ({
  backgroundColor: b?.ctaBg || '#FFFFFF',
  color: b?.ctaTextColor || '#111827'
})
</script>

<template>
  <div class="bg-[#f5f5f5]">
    <HeroSlider5 />

    <HomeFeatures />
    <FeaturedCategoriesSection />
    <FeaturedSellersSection />
    <FeaturedSellerProductsSection />
    <TrendingNowSection />
    <MarketHighlightsSection />

    <div v-if="bAfterFeatures.length" class="container py-8">
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

    <HomeTopDeals />

    <div v-if="bAfterTopDeals.length" class="container py-6">
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

    <HomeTopSelling />

    <HomeTopProducts />

    <div v-if="homeStore.config?.promoStrip?.enabled && promoStripItems.length" class="bg-[color:var(--color-primary,#2B3E95)] overflow-hidden">
      <div class="container py-3">
        <div class="flex animate-marquee whitespace-nowrap text-white font-bold text-sm" :style="{ animationDuration: promoStripSpeed + 's' }">
          <template v-for="rep in 2" :key="rep">
            <span v-for="(txt, idx) in promoStripItems" :key="`${rep}-${idx}`" class="mx-10">{{ txt }}</span>
          </template>
        </div>
      </div>
    </div>

    <div v-if="bAfterTopProducts.length" class="container py-10">
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

    <HomeNewArrivals />
    <HomeRecentlyViewed />

    <BrandLogoStripSection :brands="brands" />
  </div>
</template>

<style>
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.home-banner-card {
  position: relative;
}

.home-banner-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.06));
  pointer-events: none;
}

.home-banner-img {
  transition: transform .55s ease;
  transform: scale(1);
}

.home-banner-card:hover .home-banner-img {
  transform: scale(1.08);
}

.animate-marquee {
  animation: marquee 30s linear infinite;
  display: flex;
  width: max-content;
}
</style>
