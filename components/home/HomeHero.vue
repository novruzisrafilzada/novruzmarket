<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

import { useSliderStore } from '~/stores/sliders'
import { useT } from '#imports'

const sliderStore = useSliderStore()
const { t, lang } = useT()

if (!sliderStore.hydrated) await sliderStore.fetchSliders()

const slides = computed(() => sliderStore.sliders.filter(s => s.status === 'Aktiv'))
const safeLoop = computed(() => slides.value.length > 1)

/**
 * NUXT IMAGE PATH İZAHI:
 * 1. Şəkillərinizi "public/img/" qovluğuna qoyun.
 * 2. Kodda onları "/img/slider-1.png" kimi çağırın.
 * 3. Əgər məlumat bazasından (API) gəlirsə, tam URL olduğundan əmin olun.
 */
const fallbackImage = 'https://duka-market-vue.vercel.app/img/slider-1.png'
</script>

<template>
  <div class="duka-hero-area bg-[color:var(--color-primary)] overflow-hidden">
    <ClientOnly>
      <Swiper
        :modules="[Autoplay, Pagination, EffectFade]"
        :slides-per-view="1"
        :loop="safeLoop"
        effect="fade"
        :autoplay="{ delay: 5000, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
        class="hero-slider-active"
      >
        <SwiperSlide v-for="(s, idx) in slides" :key="s.id">
          <div class="container">
            <div class="row align-items-center min-h-[450px] sm:min-h-[550px] lg:min-h-[650px] flex flex-wrap">
              <!-- Sol Tərəf: Mətnlər -->
              <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 w-full lg:w-1/2">
                <div class="slider-content text-center lg:text-left pt-12 lg:pt-0">
                  <span class="duka-badge inline-block bg-[#FFD200] text-[#1F2937] text-[11px] font-extrabold uppercase tracking-[2px] px-[15px] py-[5px] mb-[25px] rounded-[3px]">
                    {{ t('hero_badge') }}
                  </span>
                  <h2 class="slider-title text-white text-[36px] sm:text-[50px] lg:text-[70px] font-black leading-[1.1] mb-[20px] uppercase tracking-[-1px]">
                    {{ t('hero_title') }}
                  </h2>
                  <p class="slider-desc text-white/80 text-[16px] sm:text-[18px] lg:text-[20px] font-medium mb-[45px] max-w-[500px] mx-auto lg:mx-0">
                    {{ t('hero_subtitle') }}
                  </p>
                  <div class="slider-btn">
                    <NuxtLink 
                      :to="s.link || '/shop'" 
                      class="tp-btn-white inline-block bg-white text-[#1F2937] text-[14px] font-black uppercase tracking-[1px] px-[45px] py-[18px] transition-all duration-300 hover:bg-[#FFD200] hover:text-[#1F2937] rounded-[3px] shadow-lg"
                    >
                      {{ t('discover_now') }}
                    </NuxtLink>
                  </div>
                </div>
              </div>

              <!-- Sağ Tərəf: Şəkil -->
              <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 w-full lg:w-1/2">
                <div class="slider-thumb flex justify-center lg:justify-end mt-12 lg:mt-0 relative overflow-visible">
                  <div class="thumb-inner relative z-10 scale-110 lg:scale-125">
                    <!-- Arxa fon parıltısı -->
                    <div class="absolute inset-0 bg-white/5 blur-[80px] rounded-full scale-150 animate-pulse"></div>
                    <img 
                      :src="s.image || fallbackImage" 
                      :alt="s.title" 
                      class="relative z-10 max-h-[300px] sm:max-h-[400px] lg:max-h-[550px] w-auto object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.4)] transition-transform duration-1000 hover:scale-105"
                      @error="(e: any) => e.target.src = fallbackImage"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </ClientOnly>
  </div>
</template>

<style scoped>
/* Dukamarket Orijinal Stilləri */
.duka-hero-area {
  position: relative;
  z-index: 1;
}

.slider-title {
  animation: fadeInUp 0.8s ease backwards;
}
.slider-desc {
  animation: fadeInUp 0.8s 0.2s ease backwards;
}
.duka-badge {
  animation: fadeInUp 0.8s 0.1s ease backwards;
}
.slider-btn {
  animation: fadeInUp 0.8s 0.4s ease backwards;
}
.slider-thumb img {
  animation: zoomIn 1.2s ease backwards;
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes zoomIn {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Pagination Dots */
:deep(.swiper-pagination) {
  bottom: 40px !important;
}

:deep(.swiper-pagination-bullet) {
  width: 12px;
  height: 6px;
  background: white;
  opacity: 0.2;
  border-radius: 3px;
  transition: all 0.3s ease;
  margin: 0 5px !important;
}

:deep(.swiper-pagination-bullet-active) {
  width: 30px;
  background: white;
  opacity: 1;
}

/* Bootstrap Uyğunluğu (Əgər layihədə yoxdursa) */
.row {
  display: flex;
  flex-wrap: wrap;
}
.align-items-center {
  align-items: center;
}
</style>
