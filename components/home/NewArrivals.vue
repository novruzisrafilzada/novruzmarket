<script setup lang="ts">
import { computed } from 'vue'
import { useProductStore } from '~/stores/products'
import { useHomeSectionsStore } from '~/stores/homeSections'

const productStore = useProductStore()
const homeStore = useHomeSectionsStore()
const { lang } = useT()
const { styleVars } = useHomeCardUi(homeStore)

const days = computed(() => Math.max(1, Number(homeStore.config?.news?.days || 7)))

const items = computed(() => {
  const ms = days.value * 24 * 60 * 60 * 1000
  const now = Date.now()
  return productStore.products
    .filter((p: any) => {
      const ts = p?.createdAt ? new Date(p.createdAt).getTime() : NaN
      if (!Number.isFinite(ts)) return false
      return now - ts <= ms
    })
    .sort((a: any, b: any) => {
      const ta = new Date(a.createdAt).getTime()
      const tb = new Date(b.createdAt).getTime()
      return tb - ta
    })
    .slice(0, 8)
})

const title = computed(() => {
  const l = lang.value
  return homeStore.config?.news?.titleI18n?.[l] || homeStore.config?.news?.titleI18n?.az || 'Yeniliklər'
})
const badge = computed(() => {
  const l = lang.value
  return homeStore.config?.news?.badgeI18n?.[l] || homeStore.config?.news?.badgeI18n?.az || 'YENİLİK'
})

</script>

<template>
  <div v-if="homeStore.config?.news?.enabled && items.length" class="container py-16" :style="styleVars">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-2xl font-bold text-gray-900 border-b-2 border-[color:var(--color-accent,#FACC15)] pb-2">{{ title }}</h2>
    </div>

    <div class="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <div v-for="p in items" :key="p.id" class="relative">
        <div class="absolute left-3 top-3 z-10 pointer-events-none">
          <span class="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-[10px] font-extrabold text-[color:var(--color-primary,#2B3E95)] shadow-sm">
            {{ badge }}
          </span>
        </div>
        <ProductCard :product="p" tracking-section="newArrivals" />
      </div>
    </div>
  </div>
</template>
