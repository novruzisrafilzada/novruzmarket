<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useProductStore } from '~/stores/products'
import { useTopDealsStore } from '~/stores/topDeals'
import { useHomeSectionsStore } from '~/stores/homeSections'

const productStore = useProductStore()
const topDealsStore = useTopDealsStore()
const homeStore = useHomeSectionsStore()
const { lang, t } = useT()

const { styleVars } = useHomeCardUi(homeStore)

const sectionTitle = computed(() => {
  const cfg: any = topDealsStore.config
  const l = lang.value
  return cfg?.titleI18n?.[l] || cfg?.title || 'Günün ən yaxşı təklifləri'
})

const products = computed(() => {
  const ids = topDealsStore.config.productIds || []
  const picked = ids
    .map(id => productStore.getProductById(id))
    .filter(Boolean) as any[]
  return picked.length > 0 ? picked.slice(0, 8) : productStore.products.slice(0, 5)
})

const timeLeft = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let timer: any = null

const toParts = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return { days, hours, minutes, seconds }
}

const tick = () => {
  const endAt = String(topDealsStore.config.endAt || '').trim()
  const target = endAt ? new Date(endAt).getTime() : NaN
  if (!Number.isFinite(target)) {
    timeLeft.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return
  }
  timeLeft.value = toParts(target - Date.now())
}

onMounted(() => {
  tick()
  timer = setInterval(tick, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div v-if="topDealsStore.config.enabled" class="container py-10 sm:py-12 lg:py-16" :style="styleVars">
    <div class="mb-8">
      <HomeSectionHeading eyebrow="Günün təklifləri" :title="sectionTitle">
        <template #actions>
          <div class="hidden sm:flex items-center gap-3 text-sm font-bold text-gray-700">
            <span class="whitespace-nowrap uppercase tracking-[0.16em] text-[11px] text-gray-500">{{ t('offer_ends_in' as any) }}</span>
            <div class="flex items-center gap-2">
              <div class="flex flex-col items-center">
                <div class="px-3 py-1 w-12 text-center font-extrabold bg-[color:var(--home-countdown-bg)] text-[color:var(--home-countdown-text)]">{{ String(timeLeft.days).padStart(2, '0') }}</div>
                <div class="text-[10px] font-extrabold text-[color:var(--home-card-muted)] mt-1">{{ t('days' as any) }}</div>
              </div>
              <div class="flex flex-col items-center">
                <div class="px-3 py-1 w-12 text-center font-extrabold bg-[color:var(--home-countdown-bg)] text-[color:var(--home-countdown-text)]">{{ timeLeft.hours.toString().padStart(2, '0') }}</div>
                <div class="text-[10px] font-extrabold text-[color:var(--home-card-muted)] mt-1">{{ t('hours' as any) }}</div>
              </div>
              <div class="flex flex-col items-center">
                <div class="px-3 py-1 w-12 text-center font-extrabold bg-[color:var(--home-countdown-bg)] text-[color:var(--home-countdown-text)]">{{ timeLeft.minutes.toString().padStart(2, '0') }}</div>
                <div class="text-[10px] font-extrabold text-[color:var(--home-card-muted)] mt-1">{{ t('mins' as any) }}</div>
              </div>
              <div class="flex flex-col items-center">
                <div class="px-3 py-1 w-12 text-center font-extrabold bg-[color:var(--home-countdown-bg)] text-[color:var(--home-countdown-text)]">{{ timeLeft.seconds.toString().padStart(2, '0') }}</div>
                <div class="text-[10px] font-extrabold text-[color:var(--home-card-muted)] mt-1">{{ t('secs' as any) }}</div>
              </div>
            </div>
          </div>
        </template>
      </HomeSectionHeading>
    </div>

    <div class="relative group/deals">
      <button
        id="deal-prev"
        class="flex absolute left-3 lg:left-0 top-1/2 z-20 h-10 w-10 lg:h-12 lg:w-12 lg:-translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-sm transition-all duration-300 opacity-100 pointer-events-auto lg:opacity-0 lg:pointer-events-none group-hover/deals:lg:opacity-100 group-hover/deals:lg:pointer-events-auto group-hover/deals:lg:translate-x-0 group-focus-within/deals:lg:opacity-100 group-focus-within/deals:lg:pointer-events-auto group-focus-within/deals:lg:translate-x-0 hover:bg-white"
      >
        <ChevronLeft class="w-5 h-5" />
      </button>

      <button
        id="deal-next"
        class="flex absolute right-3 lg:right-0 top-1/2 z-20 h-10 w-10 lg:h-12 lg:w-12 lg:translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-sm transition-all duration-300 opacity-100 pointer-events-auto lg:opacity-0 lg:pointer-events-none group-hover/deals:lg:opacity-100 group-hover/deals:lg:pointer-events-auto group-hover/deals:lg:translate-x-0 group-focus-within/deals:lg:opacity-100 group-focus-within/deals:lg:pointer-events-auto group-focus-within/deals:lg:translate-x-0 hover:bg-white"
      >
        <ChevronRight class="w-5 h-5" />
      </button>

      <Swiper
        :modules="[Navigation]"
        :slides-per-view="2"
        :space-between="12"
        :navigation="{
          prevEl: '#deal-prev',
          nextEl: '#deal-next'
        }"
        :breakpoints="{
          '640': { slidesPerView: 2, spaceBetween: 24 },
          '1024': { slidesPerView: 3 },
          '1280': { slidesPerView: 5 }
        }"
      >
        <SwiperSlide v-for="product in products" :key="product.id">
          <ProductCard :product="product" tracking-section="topDeals" />
        </SwiperSlide>
      </Swiper>
    </div>
  </div>
</template>
