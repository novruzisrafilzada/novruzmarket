<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/effect-fade'

import { useSliderStore } from '~/stores/sliders'
import { useBannerStore } from '~/stores/banners'
import { useSettingsStore } from '~/stores/settings'

const sliderStore = useSliderStore()
const bannerStore = useBannerStore()
const settingsStore = useSettingsStore()
const { t } = useT()

const sliderColors = ['bg-[color:var(--color-primary,#2B3E95)]']
const activeRealIndex = ref(0)

const slides = computed(() => {
  return sliderStore.sliders
    .filter(s => s.status === 'Aktiv')
    .map((s, idx) => ({
      ...s,
      color: sliderColors[idx % sliderColors.length],
    }))
})

const slideBgStyle = (slide: any) => {
  const v = String(slide?.bgStyle || '').trim()
  return v ? v : null
}

const bannerBgStyle = (b: any) => {
  const v = String(b?.bgStyle || '').trim()
  return v ? v : null
}

const isSlideAnimated = (idx: number) => {
  if (!settingsStore.settings.heroAnimations) return false
  const s: any = slides.value[idx]
  return s ? (typeof s.animate === 'boolean' ? s.animate : true) : true
}

const sideBanners = computed(() => {
  const active = bannerStore.banners.filter(b => b.status === 'Aktiv')
  const preferred = active.filter(b => b.position === 'Top' || b.position === 'Middle')
  return (preferred.length ? preferred : active).slice(0, 2)
})

const onSwiper = (swiper: any) => {
  activeRealIndex.value = swiper?.realIndex ?? 0
}

const onSlideChange = (swiper: any) => {
  activeRealIndex.value = swiper?.realIndex ?? 0
}

const sliderCfg = computed(() => {
  const d: any = settingsStore.settings.design || {}
  const autoplayEnabled = typeof d.heroAutoplayEnabled === 'boolean' ? d.heroAutoplayEnabled : true
  const autoplayDelayMs = Math.max(800, Number(d.heroAutoplayDelayMs || 5000))
  const transitionSpeedMs = Math.max(100, Number(d.heroTransitionSpeedMs || 700))
  const effect = d.heroEffect === 'fade' ? 'fade' : 'slide'
  const loop = typeof d.heroLoop === 'boolean' ? d.heroLoop : true
  const pagination = typeof d.heroPagination === 'boolean' ? d.heroPagination : true
  return { autoplayEnabled, autoplayDelayMs, transitionSpeedMs, effect, loop, pagination }
})
const safeLoop = computed(() => sliderCfg.value.loop && slides.value.length > 1)

const homeLayout = computed(() => {
  const d: any = settingsStore.settings.design || {}
  const v = Number(d.homeLayout)
  return v === 2 || v === 3 ? v : 1
})

const firstHex = (s: string) => {
  const m = String(s || '').match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/)
  if (!m) return null
  const raw = m[0]
  if (raw.length === 4) {
    const r = raw[1]
    const g = raw[2]
    const b = raw[3]
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return raw
}

const isDarkHex = (hex: string) => {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return lum < 0.55
}

const toneForBg = (bg: any) => {
  const s = String(bg || '').trim()
  if (!s) return 'dark'
  const hx = firstHex(s)
  if (hx) return isDarkHex(hx) ? 'light' : 'dark'
  return 'dark'
}

const slideTitleStyle = (slide: any) => {
  const mobile = Math.max(24, Number(slide?.titleFontSizeMobile || 30))
  const desktop = Math.max(mobile, Number(slide?.titleFontSizeDesktop || 56))
  return {
    fontSize: `clamp(${mobile}px, 4.8vw, ${desktop}px)`
  }
}

const slideImageStyle = (slide: any) => {
  const mobile = Math.max(180, Number(slide?.imageMaxHeightMobile || 280))
  const desktop = Math.max(mobile, Number(slide?.imageMaxHeightDesktop || 440))
  return {
    maxHeight: `clamp(${mobile}px, 34vw, ${desktop}px)`
  }
}
</script>

<template>
  <div :class="homeLayout === 3 ? '' : 'lg:bg-[color:var(--hero-section-bg-desktop,var(--color-primary,#2B3E95))]'">
    <div class="container py-4 sm:py-6 lg:py-8">
      <div :class="homeLayout === 2 ? 'flex' : 'flex gap-6'">
        <!-- Main Slider -->
        <div :class="['w-full overflow-hidden', homeLayout === 2 ? 'lg:w-full rounded-none shadow-none border-0' : homeLayout === 3 ? 'lg:w-full rounded-none lg:rounded-2xl shadow-sm border-0 lg:border lg:border-gray-100' : 'lg:w-2/3 rounded-none lg:rounded-2xl shadow-sm border-0 lg:border lg:border-gray-100']" :style="{ height: 'var(--hero-height)' }">
          <ClientOnly>
            <Swiper
              :modules="[Autoplay, Pagination, Navigation, EffectFade]"
              :slides-per-view="1"
              :loop="safeLoop"
              :effect="sliderCfg.effect"
              :speed="sliderCfg.transitionSpeedMs"
              :autoplay="sliderCfg.autoplayEnabled ? { delay: sliderCfg.autoplayDelayMs, disableOnInteraction: false } : false"
              :pagination="sliderCfg.pagination ? { clickable: true } : false"
              @swiper="onSwiper"
              @slideChange="onSlideChange"
              class="h-full"
            >
              <SwiperSlide v-for="(slide, idx) in slides" :key="slide.id">
                <div
                  v-if="homeLayout === 2"
                  class="h-full relative overflow-hidden flex items-center px-6 sm:px-10 lg:px-16"
                  :style="{ background: 'var(--hero-section-bg-desktop,var(--color-primary,#2B3E95))' }"
                >
                  <div class="relative z-10 w-full lg:w-1/2 max-w-2xl">
                    <h2
                      @click="navigateTo(slide.link || '/shop')"
                      :class="[
                        'font-extrabold leading-tight cursor-pointer text-white',
                        activeRealIndex === idx && isSlideAnimated(idx) ? 'hero-in-1' : ''
                      ]"
                      :style="slideTitleStyle(slide)"
                    >
                      {{ slide.title }}
                    </h2>
                    <p
                      :class="[
                        'text-sm sm:text-base lg:text-lg mt-4 text-white/80 font-medium leading-relaxed max-w-xl',
                        activeRealIndex === idx && isSlideAnimated(idx) ? 'hero-in-2' : ''
                      ]"
                    >
                      {{ slide.subtitle }}
                    </p>
                    <div :class="['mt-8', activeRealIndex === idx && isSlideAnimated(idx) ? 'hero-in-3' : '']">
                      <NuxtLink
                        :to="slide.link || '/shop'"
                        class="inline-flex items-center justify-center px-9 py-3.5 rounded-lg font-extrabold transition-all bg-white text-gray-900 hover:bg-white/90 shadow-xl shadow-black/20"
                      >
                        {{ t('discover_now') }}
                      </NuxtLink>
                    </div>
                  </div>
                  <div class="w-full lg:w-1/2 mt-10 lg:mt-0 flex items-center justify-center lg:absolute lg:right-0 lg:top-0 lg:h-full lg:p-10">
                    <img :src="slide.image" :alt="slide.title" :class="['max-w-[320px] sm:max-w-[520px] lg:max-w-full object-contain drop-shadow-2xl', activeRealIndex === idx && isSlideAnimated(idx) ? 'hero-img-in' : '']" :style="slideImageStyle(slide)" />
                  </div>
                </div>

                <div
                  v-else-if="homeLayout === 3"
                  class="h-full relative overflow-hidden flex items-center justify-center px-6 lg:px-10 bg-white"
                >
                  <img :src="slide.image" :alt="slide.title" class="absolute inset-0 w-full h-full object-cover opacity-10" />
                  <div class="relative z-10 max-w-3xl text-center">
                    <h2
                      @click="navigateTo(slide.link || '/shop')"
                      :class="[
                        'font-extrabold leading-tight text-gray-900 cursor-pointer',
                        activeRealIndex === idx && isSlideAnimated(idx) ? 'hero-in-1' : ''
                      ]"
                      :style="slideTitleStyle(slide)"
                    >
                      {{ slide.title }}
                    </h2>
                    <p
                      :class="[
                        'text-lg sm:text-xl mt-4 text-gray-600 font-medium leading-relaxed',
                        activeRealIndex === idx && isSlideAnimated(idx) ? 'hero-in-2' : ''
                      ]"
                    >
                      {{ slide.subtitle }}
                    </p>
                    <NuxtLink
                      :to="slide.link || '/shop'"
                      :class="[
                        'inline-flex items-center justify-center px-9 py-4 mt-8 rounded-full font-extrabold transition-all',
                        'bg-[color:var(--color-primary,#2B3E95)] text-white hover:bg-[color:var(--color-accent,#FACC15)] hover:text-[color:var(--color-primary,#2B3E95)]',
                        activeRealIndex === idx && isSlideAnimated(idx) ? 'hero-in-3' : ''
                      ]"
                    >
                      {{ t('discover_now') }}
                    </NuxtLink>
                  </div>
                </div>

                <div v-else :class="['h-full flex flex-col lg:flex-row items-start lg:items-center p-6 sm:p-8 lg:p-12 relative overflow-hidden', slide.color]" :style="slideBgStyle(slide) ? { background: slideBgStyle(slide) as any } : undefined">
                  <div
                    class="w-full lg:w-1/2 z-10 rounded-2xl p-4 sm:p-6 border backdrop-blur-md"
                    :class="toneForBg(slideBgStyle(slide)) === 'light' ? 'bg-black/25 border-white/15' : 'bg-white/70 border-white/50'"
                  >
                    <span
                      :class="[
                        'hero-subtitle font-extrabold uppercase tracking-wider text-xs sm:text-sm mb-3 sm:mb-4 block',
                        toneForBg(slideBgStyle(slide)) === 'light' ? 'text-white/80' : 'text-[color:var(--color-primary,#2B3E95)]',
                        activeRealIndex === idx && isSlideAnimated(idx) ? 'hero-in' : ''
                      ]"
                    >
                      {{ slide.subtitle }}
                    </span>
                    <h2
                      @click="navigateTo(slide.link || '/shop')"
                      :class="[
                        'hero-title font-extrabold mb-4 sm:mb-6 leading-tight cursor-pointer transition-colors',
                        toneForBg(slideBgStyle(slide)) === 'light' ? 'text-white hover:text-white/90' : 'text-gray-900 hover:text-[color:var(--color-primary,#2B3E95)]',
                        activeRealIndex === idx && isSlideAnimated(idx) ? 'hero-in-1' : ''
                      ]"
                      :style="slideTitleStyle(slide)"
                    >
                      {{ slide.title }}
                    </h2>
                    <p
                      :class="[
                        'hero-desc text-sm sm:text-base lg:text-lg mb-5 sm:mb-8 leading-relaxed font-medium',
                        toneForBg(slideBgStyle(slide)) === 'light' ? 'text-white/80' : 'text-gray-700',
                        activeRealIndex === idx && isSlideAnimated(idx) ? 'hero-in-2' : ''
                      ]"
                    >
                      {{ slide.subtitle }}
                    </p>
                    <NuxtLink
                      :to="slide.link || '/shop'"
                      :class="[
                        'inline-flex items-center justify-center px-7 sm:px-9 py-3.5 sm:py-4 rounded-full font-extrabold transition-all ring-1',
                        toneForBg(slideBgStyle(slide)) === 'light'
                          ? 'bg-white text-gray-900 ring-white/30 hover:bg-white/90 shadow-xl shadow-black/20'
                          : 'bg-[color:var(--color-primary,#2B3E95)] text-white ring-black/5 hover:bg-[color:var(--color-accent,#FACC15)] hover:text-[color:var(--color-primary,#2B3E95)] shadow-xl shadow-blue-200',
                        activeRealIndex === idx && isSlideAnimated(idx) ? 'hero-in-3' : ''
                      ]"
                    >
                      {{ t('discover_now') }}
                    </NuxtLink>
                  </div>
                  <div class="hero-blob hero-blob-1"></div>
                  <div class="hero-blob hero-blob-2"></div>
                  <div class="w-full lg:w-1/2 mt-6 lg:mt-0 flex items-center justify-center lg:absolute lg:right-0 lg:top-0 lg:h-full lg:p-8">
                    <img :src="slide.image" :alt="slide.title" :class="['max-w-[300px] sm:max-w-[420px] lg:max-w-full object-contain drop-shadow-2xl transition-transform duration-500', activeRealIndex === idx && isSlideAnimated(idx) ? 'hero-img-in' : '']" :style="slideImageStyle(slide)" />
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
            <template #fallback>
              <div class="h-full bg-white rounded-2xl flex items-center justify-center border border-gray-100">
                <div class="text-sm font-bold text-gray-400">Loading…</div>
              </div>
            </template>
          </ClientOnly>
        </div>

        <!-- Side Banners -->
        <div v-if="homeLayout === 1" class="hidden lg:flex flex-col w-1/3 gap-6">
          <div v-for="(b, idx) in sideBanners" :key="b.id" :class="['h-[238px] rounded-2xl p-8 flex items-center justify-between relative overflow-hidden group cursor-pointer border', idx === 0 ? 'bg-yellow-50 border-yellow-100' : 'bg-blue-50 border-blue-100']" :style="bannerBgStyle(b) ? { background: bannerBgStyle(b) as any } : undefined">
            <div class="z-10 rounded-2xl p-4 border backdrop-blur-md bg-white/80 border-white/50">
              <span :class="[idx === 0 ? 'text-yellow-700' : 'text-[color:var(--color-primary,#2B3E95)]', 'font-extrabold text-xs uppercase tracking-widest mb-2 block']">{{ b.title }}</span>
              <h3 class="text-2xl font-extrabold text-gray-900 mb-4 leading-tight">{{ b.subtitle }}</h3>
              <NuxtLink :to="b.link || '/shop'" class="text-sm font-extrabold border-b-2 border-gray-900 pb-1 group-hover:text-[color:var(--color-primary,#2B3E95)] group-hover:border-[color:var(--color-primary,#2B3E95)] transition-colors">{{ t('buy_now') }}</NuxtLink>
            </div>
            <img :src="b.image" :alt="b.title" class="w-40 object-contain group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.swiper-pagination-bullet-active {
  background: var(--color-accent, #FACC15) !important;
  width: 24px !important;
  border-radius: 12px !important;
}

.hero-hide {
  opacity: 0;
  transform: translateY(18px);
}

.hero-in {
  animation: heroIn 600ms ease-out both;
}

.hero-in-1 {
  animation: heroIn 600ms 80ms ease-out both;
}

.hero-in-2 {
  animation: heroIn 600ms 160ms ease-out both;
}

.hero-in-3 {
  animation: heroIn 600ms 240ms ease-out both;
}

.hero-img-hide {
  opacity: 0;
  transform: translateX(24px) scale(0.96);
}

.hero-img-in {
  animation: heroImg 700ms 120ms ease-out both;
}

.hero-blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(32px);
  opacity: 0.35;
  pointer-events: none;
  animation: heroFloat 7s ease-in-out infinite;
}

.hero-blob-1 {
  width: 260px;
  height: 260px;
  left: -80px;
  top: -80px;
  background: #2563eb;
}

.hero-blob-2 {
  width: 300px;
  height: 300px;
  right: 120px;
  bottom: -120px;
  background: #f59e0b;
  animation-delay: 900ms;
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 28px;
    line-height: 1.1;
  }
  .hero-desc {
    font-size: 14px;
  }
  .hero-subtitle {
    letter-spacing: 0.12em;
  }
}

@keyframes heroIn {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes heroImg {
  from {
    opacity: 0;
    transform: translateX(24px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes heroFloat {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(0, 18px, 0) scale(1.05);
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
}
</style>
