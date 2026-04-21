<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import 'swiper/css/effect-fade'

import { useSliderStore } from '~/stores/sliders'
import { useSettingsStore } from '~/stores/settings'
import { useBannerStore } from '~/stores/banners'
import { useHomeSectionsStore } from '~/stores/homeSections'

const sliderStore = useSliderStore()
const settingsStore = useSettingsStore()
const bannerStore = useBannerStore()
const homeStore = useHomeSectionsStore()
const { t, lang } = useT()

if (!sliderStore.hydrated) {
  await sliderStore.fetchSliders()
}
if (!settingsStore.hydrated) {
  await settingsStore.fetchSettings()
}
if (!bannerStore.hydrated) {
  await bannerStore.fetchBanners()
}
if (!homeStore.hydrated) {
  await homeStore.fetchConfig()
}

const slides = computed(() => sliderStore.sliders.filter((s: any) => s.status === 'Aktiv' || s.status === 'Active'))

const heroRightTop = computed(() => {
  const list = bannerStore.banners.filter((b: any) => b.status === 'Aktiv' && b.position === 'Middle' && b.homePlacement === 'heroRightTop')
  return list[0] || null
})

const heroRightBottom = computed(() => {
  const list = bannerStore.banners.filter((b: any) => b.status === 'Aktiv' && b.position === 'Middle' && b.homePlacement === 'heroRightBottom')
  return list[0] || null
})

const hasHeroSide = computed(() => Boolean(heroRightTop.value || heroRightBottom.value))
const bannerCtaText = (b: any) => String(b?.ctaText || t('discover_now' as any))
const bannerCtaStyle = (b: any) => ({
  backgroundColor: b?.ctaBg || '#FFFFFF',
  color: b?.ctaTextColor || '#111827'
})

const sliderCfg = computed(() => {
  const d: any = settingsStore.settings.design || {}
  const autoplayEnabled = typeof d.heroAutoplayEnabled === 'boolean' ? d.heroAutoplayEnabled : true
  return {
    autoplayEnabled,
    autoplayDelayMs: Math.max(1000, Number(d.heroAutoplayDelayMs || 4500)),
    transitionSpeedMs: Math.max(200, Number(d.heroTransitionSpeedMs || 600)),
    effect: d.heroEffect === 'fade' ? 'fade' : 'slide',
    loop: typeof d.heroLoop === 'boolean' ? d.heroLoop : true
  }
})
const safeLoop = computed(() => sliderCfg.value.loop && slides.value.length > 1)

const badgeText = (s: any) => {
  const l = lang.value
  const v = String(s?.badgeI18n?.[l] || s?.badgeI18n?.az || '').trim()
  return v
}

const sliderTitle = (s: any) => {
  const l = lang.value
  return String(s?.titleI18n?.[l] || s?.titleI18n?.az || s?.title || '').trim()
}

const sliderSubtitle = (s: any) => {
  const l = lang.value
  return String(s?.subtitleI18n?.[l] || s?.subtitleI18n?.az || s?.subtitle || '').trim()
}

const bannerTitle = (b: any) => {
  const l = lang.value
  return String(b?.titleI18n?.[l] || b?.titleI18n?.az || b?.title || '').trim()
}

const bannerSubtitle = (b: any) => {
  const l = lang.value
  return String(b?.subtitleI18n?.[l] || b?.subtitleI18n?.az || b?.subtitle || '').trim()
}

const ctaText = (s: any) => {
  const l = lang.value
  const v = String(s?.ctaTextI18n?.[l] || s?.ctaTextI18n?.az || '').trim()
  return v || String(t('discover_now' as any))
}
const goToSlideLink = (slide: any) => navigateTo(slide?.link || '/shop')

const sliderContentStyle = (s: any) => {
  const align = s?.contentAlign === 'center' ? 'center' : 'left'
  const maxWidth = Math.max(280, Number(s?.contentMaxWidth || 696))
  const offsetX = Math.max(-300, Math.min(300, Number(s?.contentOffsetX || 0)))
  const offsetY = Math.max(-300, Math.min(300, Number(s?.contentOffsetY || 0)))
  const titleDesktop = Math.max(24, Number(s?.titleFontSizeDesktop || 52))
  const titleMobile = Math.max(18, Number(s?.titleFontSizeMobile || 34))
  const ctaSpacingTop = Math.max(8, Number(s?.ctaSpacingTop || 42))

  return {
    alignItems: align === 'center' ? 'center' : 'flex-start',
    textAlign: align,
    width: `min(100%, ${maxWidth}px)`,
    maxWidth: `${maxWidth}px`,
    '--hero5-content-offset-x': `${offsetX}px`,
    '--hero5-content-offset-y': `${offsetY}px`,
    transform: `translate(var(--hero5-content-offset-x), var(--hero5-content-offset-y))`,
    '--hero5-title-size-desktop': `${titleDesktop}px`,
    '--hero5-title-size-mobile': `${titleMobile}px`,
    '--hero5-cta-spacing-top': `${ctaSpacingTop}px`
  } as any
}

const sliderContentAnimClass = (s: any) => {
  if (s?.animate === false || s?.contentAnimation === 'none') return 'anim-none'
  return s?.contentAnimation === 'fade-up' ? 'anim-up' : 'anim-left'
}

const sliderButtonAnimClass = (s: any) => {
  if (s?.animate === false || s?.buttonAnimation === 'none') return 'btn-anim-none'
  return s?.buttonAnimation === 'fade-left' ? 'btn-anim-left' : 'btn-anim-up'
}

const sliderImageShellStyle = (s: any) => {
  const offsetX = Math.max(-300, Math.min(300, Number(s?.imageOffsetX || 0)))
  const offsetY = Math.max(-300, Math.min(300, Number(s?.imageOffsetY || 0)))
  const scale = Math.max(50, Math.min(160, Number(s?.imageScale || 100))) / 100
  return {
    '--hero5-image-offset-x': `${offsetX}px`,
    '--hero5-image-offset-y': `${offsetY}px`,
    '--hero5-image-scale': `${scale}`,
    '--hero5-image-scale-mobile': `${Math.min(scale, 1.05)}`,
    transform: `translate(var(--hero5-image-offset-x), var(--hero5-image-offset-y)) scale(var(--hero5-image-scale))`
  } as any
}

const sliderImageStyle = (s: any) => {
  const desktopMaxHeight = Math.max(220, Number(s?.imageMaxHeightDesktop || 470))
  const mobileMaxHeight = Math.max(140, Number(s?.imageMaxHeightMobile || 280))
  return {
    maxHeight: `${desktopMaxHeight}px`,
    '--hero5-image-max-mobile': `${mobileMaxHeight}px`
  } as any
}

const sliderImageAnimClass = (s: any) => {
  if (s?.animate === false || s?.imageAnimation === 'none') return 'img-anim-none'
  if (s?.imageAnimation === 'zoom') return 'img-anim-zoom'
  if (s?.imageAnimation === 'slide-left-right') return 'img-anim-slide'
  return 'img-anim-float'
}

const titleLines = (s: any) => {
  const raw = sliderTitle(s)
  const normalized = raw.replace(/<br\s*\/?>/gi, '\n')
  return normalized.split(/\r?\n/).map(x => x.trim()).filter(Boolean)
}

const slideBgImage = (s: any) => {
  const raw = String(s?.bgStyle || '').trim()
  if (!raw) return ''

  if (/^url\(/i.test(raw)) {
    const inside = raw.replace(/^url\((['"]?)(.*)\1\)\s*$/i, '$2').trim()
    return inside || String(s?.image || '')
  }

  if (/^(https?:\/\/|\/)/i.test(raw)) return raw

  return ''
}

</script>

<template>
  <div class="w-full hero5-wrap relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none hero5-bg"></div>
    <div class="mx-auto max-w-[1338px] px-4">
      <div class="py-6">
        <div class="grid grid-cols-1 gap-6 items-stretch relative z-10" :class="hasHeroSide ? 'lg:grid-cols-[1070px,1fr]' : 'lg:grid-cols-1'">
          <div class="overflow-hidden hero5-slider">
            <ClientOnly>
              <Swiper
                :modules="[Autoplay, Pagination, Navigation, EffectFade]"
                :slides-per-view="1"
                :loop="safeLoop"
                :speed="sliderCfg.transitionSpeedMs"
                :effect="sliderCfg.effect"
                :autoplay="sliderCfg.autoplayEnabled ? { delay: sliderCfg.autoplayDelayMs, disableOnInteraction: false } : false"
                :pagination="{ clickable: true }"
                class="h-full"
              >
                <SwiperSlide
                  v-for="s in slides"
                  :key="s.id"
                  class="swiper-slide single-slider slider-height d-flex align-items-center"
                  :style="s.layout === 'image_full' && slideBgImage(s) ? { backgroundImage: `url(${slideBgImage(s)})` } : undefined"
                >
                  <div v-if="s.layout === 'image_full'" class="h-full relative cursor-pointer overflow-hidden" @click="navigateTo(s.link || '/shop')">
                    <div class="w-full h-full flex items-center justify-center" :style="sliderImageShellStyle(s)">
                      <img :src="s.image" :alt="s.title" class="absolute inset-0 w-full h-full" :class="[s.imageFit === 'cover' ? 'object-cover' : 'object-contain', sliderImageAnimClass(s)]" />
                    </div>
                  </div>

                  <div v-else class="w-full">
                    <div class="hero5-inner">
                      <div class="row hero5-row">
                        <div class="col-xl-5 relative z-20">
                          <div class="slider-content-shell" :style="sliderContentStyle(s)">
                            <div class="slider-content" :class="sliderContentAnimClass(s)">
                              <div class="slider-top-btn" data-animation="fadeInLeft" data-delay="1.5s" v-if="badgeText(s)">
                                <button type="button" class="st-btn b-radius" @click.stop.prevent="goToSlideLink(s)">{{ badgeText(s) }}</button>
                              </div>
                              <h2 data-animation="fadeInLeft" data-delay="1.7s" class="pt-15 slider-title pb-5">
                                <template v-for="(line, i) in titleLines(s)" :key="i">
                                  {{ line }}<br v-if="i !== titleLines(s).length - 1" />
                                </template>
                              </h2>
                              <p class="pr-20 slider_text" data-animation="fadeInLeft" data-delay="1.9s">{{ sliderSubtitle(s) }}</p>
                              <div class="slider-bottom-btn mt-75" :class="sliderButtonAnimClass(s)">
                                <button type="button" class="st-btn-b b-radius" data-animation="fadeInUp" data-delay="1.15s" @click.stop.prevent="goToSlideLink(s)">{{ ctaText(s) }}</button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div v-if="s.image && slideBgImage(s) !== s.image" class="mt-8 xl:hidden flex justify-center pointer-events-none">
                          <div class="hero5-media-shell w-full pointer-events-none" :style="sliderImageShellStyle(s)">
                            <img :src="s.image" :alt="s.title" class="hero5-product" :class="sliderImageAnimClass(s)" :style="sliderImageStyle(s)" />
                          </div>
                        </div>
                        <div v-if="s.image && slideBgImage(s) !== s.image" class="col-xl-7 hero5-media pointer-events-none">
                          <div class="hero5-media-shell pointer-events-none" :style="sliderImageShellStyle(s)">
                            <img :src="s.image" :alt="s.title" class="hero5-product" :class="sliderImageAnimClass(s)" :style="sliderImageStyle(s)" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              </Swiper>
            </ClientOnly>
          </div>

          <div v-if="hasHeroSide" class="hidden lg:flex flex-col gap-6 hero5-side">
            <div v-if="heroRightTop" class="h-1/2 bg-transparent overflow-hidden cursor-pointer" @click="navigateTo(heroRightTop.link || '/shop')">
              <div class="h-full grid grid-cols-[1fr,120px] items-center gap-4 p-6">
                <div class="text-white">
                  <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FACC15)]">{{ bannerTitle(heroRightTop) }}</div>
                  <div class="text-xl font-extrabold mt-3 leading-tight">{{ bannerSubtitle(heroRightTop) }}</div>
                  <div class="banner-cta-pill mt-4 inline-flex items-center justify-center h-10 px-5 text-sm font-bold tracking-[0.04em] rounded-full" :style="bannerCtaStyle(heroRightTop)">{{ bannerCtaText(heroRightTop) }}</div>
                </div>
                <img :src="heroRightTop.image" :alt="bannerTitle(heroRightTop)" class="w-full h-full object-contain" />
              </div>
            </div>
            <div v-if="heroRightBottom" class="h-1/2 bg-transparent overflow-hidden cursor-pointer" @click="navigateTo(heroRightBottom.link || '/shop')">
              <div class="h-full grid grid-cols-[1fr,120px] items-center gap-4 p-6">
                <div class="text-white">
                  <div class="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[color:var(--color-accent,#FACC15)]">{{ bannerTitle(heroRightBottom) }}</div>
                  <div class="text-xl font-extrabold mt-3 leading-tight">{{ bannerSubtitle(heroRightBottom) }}</div>
                  <div class="banner-cta-pill mt-4 inline-flex items-center justify-center h-10 px-5 text-sm font-bold tracking-[0.04em] rounded-full" :style="bannerCtaStyle(heroRightBottom)">{{ bannerCtaText(heroRightBottom) }}</div>
                </div>
                <img :src="heroRightBottom.image" :alt="bannerTitle(heroRightBottom)" class="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:global(.swiper-pagination) {
  bottom: 18px !important;
}

:global(.swiper-pagination-bullet) {
  width: 18px;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.45);
  opacity: 1;
}

:global(.swiper-pagination-bullet-active) {
  background: #ffffff;
}

.hero5-bg {
  background: none;
  opacity: 0;
}

.hero5-wrap {
  background: var(--hero-section-bg-desktop, var(--header-nav-bg, #0d47a1));
  font-family: 'Rubik', sans-serif;
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  box-sizing: border-box;
  --bs-gutter-x: 0;
  --bs-gutter-y: 0;
  --bs-blue: #0d6efd;
  --bs-indigo: #6610f2;
  --bs-purple: #6f42c1;
  --bs-pink: #d63384;
  --bs-red: #dc3545;
  --bs-orange: #fd7e14;
  --bs-yellow: #ffc107;
  --bs-green: #198754;
  --bs-teal: #20c997;
  --bs-cyan: #0dcaf0;
  --bs-black: #000;
  --bs-white: #fff;
  --bs-gray: #6c757d;
  --bs-gray-dark: #343a40;
  --bs-gray-100: #f8f9fa;
  --bs-gray-200: #e9ecef;
  --bs-gray-300: #dee2e6;
  --bs-gray-400: #ced4da;
  --bs-gray-500: #adb5bd;
  --bs-gray-600: #6c757d;
  --bs-gray-700: #495057;
  --bs-gray-800: #343a40;
  --bs-gray-900: #212529;
  --bs-primary: #0d6efd;
  --bs-secondary: #6c757d;
  --bs-success: #198754;
  --bs-info: #0dcaf0;
  --bs-warning: #ffc107;
  --bs-danger: #dc3545;
  --bs-light: #f8f9fa;
  --bs-dark: #212529;
  --bs-font-sans-serif: Rubik, sans-serif;
  --bs-body-font-family: var(--bs-font-sans-serif);
  --bs-body-font-size: 1rem;
  --bs-body-font-weight: 400;
  --bs-body-line-height: 1.625;
  --bs-body-color: #666;
  --bs-body-bg: #fff;
}


.hero5-slider {
  width: 100%;
  max-width: 100%;
  height: var(--hero-height-desktop, 500px);
}

.hero5-slider :global(.swiper),
.hero5-slider :global(.swiper-wrapper),
.hero5-slider :global(.swiper-slide) {
  height: 100%;
}

.hero5-side {
  height: var(--hero-height-desktop, 500px);
}

@media (max-width: 1024px) {
  .hero5-slider {
    height: auto;
    min-height: var(--hero-height-mobile, 420px);
  }
  .hero5-side {
    height: auto;
  }
}

.hero5-inner {
  height: 100%;
  --bs-gutter-x: 1.5rem;
  --bs-gutter-y: 0;
  padding: 0 64px;
}

@media (max-width: 1024px) {
  .hero5-inner {
    padding: 28px 18px 20px;
  }
}

.hero5-row {
  height: 100%;
  align-items: center;
  justify-content: space-between;
}

.col-xl-7 {
  width: 100%;
}

@media (min-width: 1200px) {
  .col-xl-7 {
    flex: 0 0 auto;
    width: 56%;
  }
}

.hero5-media {
  display: none;
}

@media (min-width: 1200px) {
  .hero5-media {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.hero5-product {
  max-height: 470px;
  max-width: 100%;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 22px 28px rgba(0, 0, 0, 0.25));
}

.hero5-media-shell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  transition: transform 0.25s ease;
}

@keyframes hero5Float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.hero5-float {
  animation: hero5Float 3.8s ease-in-out infinite;
}

@keyframes hero5Zoom {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}

@keyframes hero5SlideImage {
  from { opacity: 0; transform: translateX(-60px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes hero5InLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes hero5InUp {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes hero5InLeftToRight {
  from { opacity: 0; transform: translateX(-60px); }
  to { opacity: 1; transform: translateX(0); }
}

.swiper-slide .slider-content.anim-left {
  opacity: 0;
  transform: translateX(-40px);
}

.swiper-slide-active .slider-content.anim-left {
  animation: hero5InLeft 0.9s ease forwards;
}

.swiper-slide .slider-content.anim-up {
  opacity: 0;
  transform: translateY(22px);
}

.swiper-slide-active .slider-content.anim-up {
  animation: hero5InUp 0.9s ease forwards;
}

.swiper-slide .slider-bottom-btn.btn-anim-up {
  opacity: 0;
  transform: translateY(18px);
}

.swiper-slide-active .slider-bottom-btn.btn-anim-up {
  animation: hero5InUp 0.7s ease forwards;
  animation-delay: 0.25s;
}

.swiper-slide .slider-bottom-btn.btn-anim-left {
  opacity: 0;
  transform: translateX(-28px);
}

.swiper-slide-active .slider-bottom-btn.btn-anim-left {
  animation: hero5InLeft 0.7s ease forwards;
  animation-delay: 0.25s;
}

.swiper-slide .hero5-product.img-anim-slide {
  opacity: 0;
  transform: translateX(-60px);
}

.swiper-slide-active .hero5-product.img-anim-slide {
  animation: hero5InLeftToRight 0.95s ease forwards;
}

.hero5-product.img-anim-float {
  animation: hero5Float 3.8s ease-in-out infinite;
}

.hero5-product.img-anim-zoom {
  animation: hero5Zoom 4s ease-in-out infinite;
}

.hero5-product.img-anim-none,
.slider-content.anim-none,
.slider-bottom-btn.btn-anim-none {
  opacity: 1;
  transform: none;
  animation: none;
}

.single-slider {
  list-style: none;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  display: flex !important;
  align-items: center !important;
  flex-shrink: 0;
  height: 100%;
  position: relative;
  min-height: var(--hero-height-desktop, 500px);
  background-position: top;
  background-repeat: no-repeat;
  background-size: cover;
  transition: all 10.5s cubic-bezier(0, 0, 0.2, 1);
  backface-visibility: hidden;
  transform: translateZ(0);
}

.slider-height {
  height: var(--hero-height-desktop, 500px);
}

@media (max-width: 1024px) {
  .slider-height {
    height: auto;
    min-height: var(--hero-height-mobile, 420px);
  }
}

.d-flex {
  display: flex;
}

.align-items-center {
  align-items: center;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin-left: calc(var(--bs-gutter-x) * -0.5);
  margin-right: calc(var(--bs-gutter-x) * -0.5);
  margin-top: calc(var(--bs-gutter-y) * -1);
}

.row > * {
  box-sizing: border-box;
  flex-shrink: 0;
  width: 100%;
  max-width: 100%;
  padding-left: calc(var(--bs-gutter-x) * 0.5);
  padding-right: calc(var(--bs-gutter-x) * 0.5);
  margin-top: var(--bs-gutter-y);
}

.col-xl-5 {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.col-xl-7 {
  width: 100%;
}

@media (min-width: 1200px) {
  .col-xl-5 {
    flex: 0 0 auto;
    width: 42%;
    justify-content: flex-start;
  }
}

.slider-content-shell {
  display: flex;
  width: min(100%, 696px);
  max-width: 696px;
  transition: transform 0.25s ease;
}

.slider-content {
  list-style: none;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: inherit;
  justify-content: center;
  text-align: inherit;
  color: #ffffff;
  font-family: Rubik, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 26px;
  --bs-gutter-x: 1.5rem;
  --bs-gutter-y: 0;
  width: 100%;
  min-height: 293px;
}

@media (min-width: 1200px) {
  .slider-content-shell {
    max-width: 696px;
  }
  .slider-content {
    padding-left: 46px;
  }
}

.slider-top-btn .st-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 14px;
  background: #ffd200;
  color: #222;
  font-weight: 800;
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  text-decoration: none;
}

.slider-title {
  font-size: var(--hero5-title-size-desktop, 52px);
  line-height: 1.06;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #ffffff;
  margin: 0;
  max-width: 620px;
}

.slider_text {
  font-size: 15px;
  line-height: 1.6;
  font-weight: 500;
  opacity: 0.85;
  color: #ffffff;
  margin: 0;
  max-width: 430px;
}

.st-btn-b {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 0 56px;
  background: #ffffff;
  color: #111827;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.04em;
  text-decoration: none;
  border-radius: 999px;
  transition: background-color 150ms ease, color 150ms ease, transform 150ms ease;
}

.st-btn-b:hover {
  background: #eab308;
  color: #111827;
  transform: translateY(-1px);
}

.b-radius {
  border-radius: 2px;
}

.pt-15 {
  padding-top: 15px;
}

.pb-5 {
  padding-bottom: 5px;
}

.pr-20 {
  padding-right: 20px;
}

.mt-75 {
  margin-top: var(--hero5-cta-spacing-top, 42px);
}

@media (max-width: 1024px) {
  .slider-title {
    font-size: calc(var(--hero5-title-size-desktop, 52px) * 0.85);
  }
  .hero5-product {
    max-height: var(--hero5-image-max-mobile, 280px);
  }
}

@media (max-width: 640px) {
  .hero5-wrap {
    padding-top: 6px;
  }
  .hero5-slider {
    min-height: 0;
    height: auto;
  }
  .slider-bg {
    min-height: clamp(320px, 58vh, 430px);
    background-position: center top;
  }
  .slider-content-shell {
    width: 100%;
    max-width: 100%;
    transform: translate(0, var(--hero5-content-offset-y, 0px)) !important;
  }
  .slider-content {
    min-height: 0;
    padding: 10px 4px 0;
    align-items: flex-start;
  }
  .slider-title {
    font-size: min(var(--hero5-title-size-mobile, 34px), 28px);
    max-width: 210px;
    padding-bottom: 10px;
  }
  .slider_text {
    max-width: 170px;
    font-size: 13px;
    line-height: 1.4;
    padding-right: 0;
  }
  .mt-75 {
    margin-top: 16px;
  }
  .st-btn-b {
    height: 40px;
    padding: 0 24px;
    font-size: 12px;
  }
  .hero5-media-shell {
    width: 100%;
    display: flex;
    justify-content: center;
    transform: translate(0, var(--hero5-image-offset-y, 0px)) scale(var(--hero5-image-scale-mobile, 1)) !important;
  }
  .hero5-product {
    max-height: min(var(--hero5-image-max-mobile, 280px), 220px);
    max-width: min(58vw, 210px);
  }
}
</style>
