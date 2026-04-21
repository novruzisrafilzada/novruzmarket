<script setup lang="ts">
import { computed, ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useProductStore } from '~/stores/products'
import { useHomeSectionsStore } from '~/stores/homeSections'

const productStore = useProductStore()
const homeStore = useHomeSectionsStore()
const { t, lang } = useT()

const sectionTitle = computed(() => {
  const cfg: any = homeStore.config
  const l = lang.value
  return cfg?.topSelling?.titleI18n?.[l] || cfg?.topSelling?.titleI18n?.az || 'Ən çox satılan məhsullar'
})
const { styleVars } = useHomeCardUi(homeStore)

const products = computed(() => {
  const cfg: any = homeStore.config
  const limit = Math.max(1, Number(cfg?.topSelling?.productLimit || 10))
  const ids = Array.isArray(cfg?.topSelling?.categoryIds) ? cfg.topSelling.categoryIds.map((x: any) => Number(x)).filter((x: any) => Number.isFinite(x)) : []
  const base = ids.length > 0 ? productStore.products.filter((p: any) => ids.includes(Number(p.categoryId))) : productStore.products
  return [...base]
    .sort((a: any, b: any) => (Number(b.sold) || 0) - (Number(a.sold) || 0))
    .slice(0, limit)
})

</script>

<template>
  <div class="container py-10 sm:py-12 lg:py-16" :style="styleVars">
    <div class="mb-8">
      <HomeSectionHeading eyebrow="Ən çox satılan" :title="sectionTitle" />
    </div>

    <div class="relative group/selling">
      <button
        id="selling-prev"
        class="flex absolute left-3 lg:left-0 top-1/2 z-20 h-10 w-10 lg:h-12 lg:w-12 lg:-translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-sm transition-all duration-300 opacity-100 pointer-events-auto lg:opacity-0 lg:pointer-events-none group-hover/selling:lg:opacity-100 group-hover/selling:lg:pointer-events-auto group-hover/selling:lg:translate-x-0 group-focus-within/selling:lg:opacity-100 group-focus-within/selling:lg:pointer-events-auto group-focus-within/selling:lg:translate-x-0 hover:bg-white"
      >
        <ChevronLeft class="w-5 h-5" />
      </button>

      <button
        id="selling-next"
        class="flex absolute right-3 lg:right-0 top-1/2 z-20 h-10 w-10 lg:h-12 lg:w-12 lg:translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-sm transition-all duration-300 opacity-100 pointer-events-auto lg:opacity-0 lg:pointer-events-none group-hover/selling:lg:opacity-100 group-hover/selling:lg:pointer-events-auto group-hover/selling:lg:translate-x-0 group-focus-within/selling:lg:opacity-100 group-focus-within/selling:lg:pointer-events-auto group-focus-within/selling:lg:translate-x-0 hover:bg-white"
      >
        <ChevronRight class="w-5 h-5" />
      </button>

      <Swiper
        :modules="[Navigation]"
        :slides-per-view="2"
        :space-between="12"
        :navigation="{
          prevEl: '#selling-prev',
          nextEl: '#selling-next'
        }"
        :breakpoints="{
          '640': { slidesPerView: 2, spaceBetween: 24 },
          '1024': { slidesPerView: 3 },
          '1280': { slidesPerView: 5 }
        }"
      >
        <SwiperSlide v-for="product in products" :key="product.id">
          <ProductCard :product="product" tracking-section="topSelling" />
        </SwiperSlide>
      </Swiper>
    </div>
  </div>
</template>
