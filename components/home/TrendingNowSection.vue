<script setup lang="ts">
import { Flame, TrendingUp } from 'lucide-vue-next'
import ProductCard from '~/components/ProductCard.vue'

const { lang } = useT()
const homeStore = useHomeSectionsStore()

if (!homeStore.hydrated || !homeStore.config) {
  await homeStore.fetchConfig()
}

const { data: productsData } = await useFetch('/api/products', {
  default: () => []
})

const section = computed(() => homeStore.config?.trendingNow)
const title = computed(() => section.value?.titleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.titleI18n?.az || 'İndi trenddə')
const subtitle = computed(() => section.value?.subtitleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.subtitleI18n?.az || '')
const items = computed(() =>
  (productsData.value || [])
    .slice()
    .sort((a: any, b: any) => {
      if (Number(b.viewCount || 0) !== Number(a.viewCount || 0)) return Number(b.viewCount || 0) - Number(a.viewCount || 0)
      return Number(b.sold || 0) - Number(a.sold || 0)
    })
    .slice(0, Math.max(1, Number(section.value?.limit || 4)))
)
</script>

<template>
  <div v-if="section?.enabled && items.length" class="container py-10 sm:py-12">
    <div class="rounded-[2.5rem] bg-gradient-to-br from-[color:var(--color-primary,#2B3E95)] via-[#3147a8] to-[#3c59d6] text-white overflow-hidden shadow-xl shadow-blue-200/50">
      <div class="px-6 md:px-10 py-8 md:py-10 border-b border-white/10">
        <HomeSectionHeading eyebrow="Trenddə" :title="title" :subtitle="subtitle" inverse>
          <template #actions>
            <NuxtLink to="/shop" class="inline-flex items-center gap-2 text-sm font-extrabold text-[color:var(--color-accent,#FACC15)] hover:text-yellow-200">
              Hamısına bax
              <TrendingUp class="w-4 h-4" />
            </NuxtLink>
          </template>
        </HomeSectionHeading>
      </div>

      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4 p-4 md:p-5">
        <div v-for="(product, index) in items" :key="product.id" class="relative">
          <div class="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
            <span class="w-10 h-10 rounded-full bg-[color:var(--color-primary,#2B3E95)] text-white text-sm font-black flex items-center justify-center shadow-lg shadow-blue-900/20">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
            <span class="px-3 py-1 rounded-full bg-white/95 text-[color:var(--color-primary,#2B3E95)] border border-blue-100 text-[10px] font-extrabold shadow-sm">
              +{{ Number(product.viewCount || 0) }} baxış
            </span>
          </div>
          <ProductCard :product="product" />
        </div>
      </div>
    </div>
  </div>
</template>
