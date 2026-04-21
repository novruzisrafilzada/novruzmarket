<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/effect-fade'

import { useSliderStore } from '~/stores/sliders'
import { useSettingsStore } from '~/stores/settings'

const sliderStore = useSliderStore()
const settingsStore = useSettingsStore()
const { t, lang } = useT()

if (!sliderStore.hydrated) {
  await sliderStore.fetchSliders()
}
if (!settingsStore.hydrated) {
  await settingsStore.fetchSettings()
}

const slides = computed(() => sliderStore.sliders.filter((s: any) => s.status === 'Aktiv' || s.status === 'Active'))

const sliderCfg = computed(() => {
  const d: any = settingsStore.settings.design || {}
  const autoplayEnabled = typeof d.heroAutoplayEnabled === 'boolean' ? d.heroAutoplayEnabled : true
  return {
    autoplayEnabled,
    autoplayDelayMs: Math.max(1000, Number(d.heroAutoplayDelayMs || 4500)),
    transitionSpeedMs: Math.max(200, Number(d.heroTransitionSpeedMs || 600))
  }
})
const safeLoop = computed(() => slides.value.length > 1)

const slideTitleStyle = (slide: any) => {
  const mobile = Math.max(24, Number(slide?.titleFontSizeMobile || 30))
  const desktop = Math.max(mobile, Number(slide?.titleFontSizeDesktop || 56))
  return {
    fontSize: `clamp(${mobile}px, 4.8vw, ${desktop}px)`
  }
}

const slideImageStyle = (slide: any) => {
  const mobile = Math.max(180, Number(slide?.imageMaxHeightMobile || 260))
  const desktop = Math.max(mobile, Number(slide?.imageMaxHeightDesktop || 480))
  return {
    maxHeight: `clamp(${mobile}px, 36vw, ${desktop}px)`
  }
}
</script>

<template>
  <div class="w-full bg-[color:var(--hero-section-bg-desktop,var(--color-primary,#2B3E95))]">
    <div class="container py-6">
      <div class="bg-[color:var(--hero-section-bg-desktop,var(--color-primary,#2B3E95))] overflow-hidden rounded-none" :style="{ height: 'var(--hero-height)' }">
        <ClientOnly>
          <Swiper
            :modules="[Autoplay, Pagination, Navigation, EffectFade]"
            :slides-per-view="1"
            :loop="safeLoop"
            effect="fade"
            :speed="sliderCfg.transitionSpeedMs"
            :autoplay="sliderCfg.autoplayEnabled ? { delay: sliderCfg.autoplayDelayMs, disableOnInteraction: false } : false"
            :pagination="{ clickable: true }"
            class="h-full"
          >
            <SwiperSlide v-for="s in slides" :key="s.id">
              <!-- Tam ekran şəkil variantı -->
              <div v-if="s.layout === 'image_full'" class="h-full relative cursor-pointer" @click="navigateTo(s.link || '/shop')">
                <img :src="s.image" :alt="s.title" class="absolute inset-0 w-full h-full" :class="s.imageFit === 'cover' ? 'object-cover' : 'object-contain'" />
              </div>
              <!-- Bölünmüş mətn + şəkil variantı -->
              <div v-else class="h-full grid grid-cols-1 lg:grid-cols-[1fr,520px] items-center gap-8 px-6 sm:px-10 lg:px-16">
                <div class="text-white">
                  <div v-if="s.badgeI18n?.az || s.badgeI18n?.ru || s.badgeI18n?.en" class="inline-flex items-center px-3 py-1 bg-[color:var(--color-accent,#FFD200)] text-gray-900 text-[11px] font-extrabold uppercase tracking-widest">
                    {{ s.badgeI18n?.[lang] || s.badgeI18n?.az }}
                  </div>
                  <div class="font-extrabold leading-tight mt-5" :style="slideTitleStyle(s)">
                    {{ s.title }}
                  </div>
                  <div class="text-base sm:text-lg text-white/80 font-medium mt-4 leading-relaxed max-w-xl">
                    {{ s.subtitle }}
                  </div>
                  <NuxtLink
                    :to="s.link || '/shop'"
                    class="inline-flex items-center justify-center mt-8 h-12 px-8 rounded-full bg-white text-gray-900 font-bold text-sm tracking-[0.04em] transition-colors"
                    :class="'hover:bg-[color:var(--color-accent,#FACC15)] hover:text-[color:var(--color-primary,#2B3E95)]'"
                  >
                    {{ s.ctaTextI18n?.[lang] || s.ctaTextI18n?.az || t('discover_now' as any) }}
                  </NuxtLink>
                </div>
                <div class="h-full flex items-center lg:items-end justify-center overflow-hidden">
                  <img :src="s.image" :alt="s.title" class="w-full object-contain" :class="s.imageFit === 'cover' ? 'object-cover' : 'object-contain'" :style="slideImageStyle(s)" />
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>
