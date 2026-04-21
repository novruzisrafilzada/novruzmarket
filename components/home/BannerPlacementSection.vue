<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'

const props = defineProps<{
  banners: Array<{
    id: number
    title: string
    subtitle: string
    titleI18n?: { az: string; ru: string; en: string }
    subtitleI18n?: { az: string; ru: string; en: string }
    image: string
    link?: string
    ctaText?: string
    ctaTextI18n?: { az: string; ru: string; en: string }
    ctaBg?: string
    ctaTextColor?: string
  }>
  compact?: boolean
  layoutMode?: 'carousel' | 'mosaic' | 'grid'
  sectionStyle?: 'default' | 'topDealsPair'
}>()

const { lang, t } = useT()

const bannerTitle = (banner: any) => String(banner?.titleI18n?.[lang.value as 'az' | 'ru' | 'en'] || banner?.titleI18n?.az || banner?.title || '').trim()
const bannerSubtitle = (banner: any) => String(banner?.subtitleI18n?.[lang.value as 'az' | 'ru' | 'en'] || banner?.subtitleI18n?.az || banner?.subtitle || '').trim()
const bannerCta = (banner: any) => String(banner?.ctaTextI18n?.[lang.value as 'az' | 'ru' | 'en'] || banner?.ctaTextI18n?.az || banner?.ctaText || t('discover_now')).trim()
</script>

<template>
  <div v-if="props.banners.length" class="container py-10 sm:py-12">
    <div v-if="props.sectionStyle === 'topDealsPair'" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5">
      <NuxtLink
        v-for="banner in props.banners.slice(0, 2)"
        :key="banner.id"
        :to="banner.link || '/shop'"
        class="group relative h-[132px] overflow-hidden rounded-[2px] border border-gray-200 bg-white sm:h-[148px] lg:h-[160px]"
      >
        <img :src="banner.image" :alt="bannerTitle(banner)" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div class="absolute inset-0 bg-gradient-to-r from-black/72 via-black/30 to-transparent" />
        <div class="absolute inset-0 flex flex-col justify-center px-7 text-white">
          <div class="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[color:var(--color-accent,#FACC15)]">{{ bannerTitle(banner) }}</div>
          <div class="mt-2 max-w-[15rem] text-[20px] font-bold leading-[1.2] sm:text-[22px]">{{ bannerSubtitle(banner) }}</div>
          <div class="mt-2 text-xs font-semibold opacity-90">{{ bannerCta(banner) }}</div>
        </div>
      </NuxtLink>
    </div>

    <div v-else-if="props.compact && props.layoutMode !== 'mosaic'" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5 xl:grid-cols-3">
      <NuxtLink
        v-for="banner in props.banners.slice(0, 3)"
        :key="banner.id"
        :to="banner.link || '/shop'"
        class="home-banner-card group relative h-[148px] overflow-hidden rounded-[2px] sm:h-[170px] lg:h-[180px]"
      >
        <img :src="banner.image" :alt="bannerTitle(banner)" class="home-banner-img h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div class="absolute inset-0 bg-black/5" />
        <div class="absolute inset-0 flex flex-col justify-center px-7 text-white">
          <div class="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[color:var(--color-accent,#FACC15)]">{{ bannerTitle(banner) }}</div>
          <div class="mt-2 max-w-[14rem] text-[23px] font-bold leading-[1.15] sm:text-[24px]">{{ bannerSubtitle(banner) }}</div>
          <span class="banner-cta-pill mt-4 inline-flex h-10 w-fit items-center justify-center px-5 text-[10px] font-extrabold uppercase tracking-[0.18em]" :style="{ backgroundColor: banner.ctaBg || '#FFFFFF', color: banner.ctaTextColor || '#111827' }">
            {{ bannerCta(banner) }}
          </span>
        </div>
      </NuxtLink>
    </div>

    <ClientOnly v-else-if="props.layoutMode === 'carousel'">
      <Swiper :slides-per-view="1" :space-between="16" :breakpoints="{ '640': { slidesPerView: 2 }, '1024': { slidesPerView: 3 } }" class="mt-6">
        <SwiperSlide v-for="banner in props.banners" :key="banner.id">
          <NuxtLink :to="banner.link || '/shop'" class="group relative block h-[200px] w-full max-w-[546px] overflow-hidden border border-gray-200 bg-white mx-auto">
            <img :src="banner.image" :alt="bannerTitle(banner)" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div class="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
            <div class="absolute inset-0 flex flex-col justify-center px-7 text-white">
              <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ bannerTitle(banner) }}</div>
              <div class="mt-2 max-w-[18rem] text-xl font-extrabold leading-tight">{{ bannerSubtitle(banner) }}</div>
              <span class="banner-cta-pill mt-5 inline-flex h-10 w-fit items-center justify-center px-5 text-[10px] font-extrabold uppercase tracking-[0.18em]" :style="{ backgroundColor: banner.ctaBg || '#FFFFFF', color: banner.ctaTextColor || '#111827' }">
                {{ bannerCta(banner) }}
              </span>
            </div>
          </NuxtLink>
        </SwiperSlide>
      </Swiper>
    </ClientOnly>

    <div v-else-if="props.layoutMode === 'mosaic' && props.banners.length >= 4" class="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr,1fr,1.4fr]">
      <NuxtLink :to="props.banners[0].link || '/shop'" class="relative overflow-hidden border border-gray-200 bg-white h-[200px] lg:h-[420px]">
        <img :src="props.banners[0].image" :alt="bannerTitle(props.banners[0])" class="h-full w-full object-cover" />
        <div class="absolute inset-0 bg-black/25" />
        <div class="absolute inset-0 flex flex-col justify-center px-8 text-white">
          <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ bannerTitle(props.banners[0]) }}</div>
          <div class="mt-2 text-2xl font-extrabold leading-tight">{{ bannerSubtitle(props.banners[0]) }}</div>
        </div>
      </NuxtLink>
      <div class="grid grid-rows-2 gap-6">
        <NuxtLink v-for="banner in props.banners.slice(1, 3)" :key="banner.id" :to="banner.link || '/shop'" class="relative overflow-hidden border border-gray-200 bg-white h-[200px]">
          <img :src="banner.image" :alt="bannerTitle(banner)" class="h-full w-full object-cover" />
          <div class="absolute inset-0 bg-black/25" />
          <div class="absolute inset-0 flex flex-col justify-center px-8 text-white">
            <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ bannerTitle(banner) }}</div>
            <div class="mt-2 text-xl font-extrabold leading-tight">{{ bannerSubtitle(banner) }}</div>
          </div>
        </NuxtLink>
      </div>
      <NuxtLink :to="props.banners[3].link || '/shop'" class="relative overflow-hidden border border-gray-200 bg-white h-[200px] lg:h-[420px]">
        <img :src="props.banners[3].image" :alt="bannerTitle(props.banners[3])" class="h-full w-full object-cover" />
        <div class="absolute inset-0 bg-black/25" />
        <div class="absolute inset-0 flex flex-col justify-center px-8 text-white">
          <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FFD200)]">{{ bannerTitle(props.banners[3]) }}</div>
          <div class="mt-2 text-2xl font-extrabold leading-tight">{{ bannerSubtitle(props.banners[3]) }}</div>
        </div>
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <NuxtLink
        v-for="banner in props.banners"
        :key="banner.id"
        :to="banner.link || '/shop'"
        class="group relative h-56 overflow-hidden border border-gray-200 bg-white sm:h-60"
      >
        <img :src="banner.image" :alt="bannerTitle(banner)" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
        <div class="absolute inset-0 flex flex-col justify-center px-8 text-white">
          <span class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FACC15)]">{{ bannerTitle(banner) }}</span>
          <h3 class="mt-2 max-w-[18rem] text-2xl font-extrabold leading-tight">{{ bannerSubtitle(banner) }}</h3>
          <span class="banner-cta-pill mt-5 inline-flex h-10 w-fit items-center justify-center px-5 text-[10px] font-extrabold uppercase tracking-[0.18em]" :style="{ backgroundColor: banner.ctaBg || '#FFFFFF', color: banner.ctaTextColor || '#111827' }">
            {{ bannerCta(banner) }}
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
