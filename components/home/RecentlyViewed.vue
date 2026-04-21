<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useHomeSectionsStore } from '~/stores/homeSections'
import { useProductStore } from '~/stores/products'

const homeStore = useHomeSectionsStore()
const productStore = useProductStore()
const { lang } = useT()
const { styleVars } = useHomeCardUi(homeStore)

const ids = ref<number[]>([])

const title = computed(() => {
  const l = lang.value
  return homeStore.config?.recentlyViewed?.titleI18n?.[l] || homeStore.config?.recentlyViewed?.titleI18n?.az || 'Əvvəl baxdıqlarınız'
})

const items = computed(() => {
  const list = ids.value.map(id => productStore.getProductById(id)).filter(Boolean) as any[]
  return list.slice(0, 8)
})

onMounted(() => {
  try {
    const raw = localStorage.getItem('recentlyViewedProductIds')
    const parsed = raw ? JSON.parse(raw) : []
    ids.value = Array.isArray(parsed) ? parsed.map((n: any) => Number(n)).filter((n: any) => Number.isFinite(n) && n > 0) : []
  } catch {
    ids.value = []
  }
})
</script>

<template>
  <div v-if="homeStore.config?.recentlyViewed?.enabled && items.length" class="container py-16" :style="styleVars">
    <div class="flex items-center justify-between mb-8">
      <h2 class="text-2xl font-bold text-gray-900 border-b-2 border-[color:var(--color-accent,#FACC15)] pb-2">{{ title }}</h2>
    </div>

    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <ProductCard v-for="p in items" :key="p.id" :product="p" tracking-section="recentlyViewed" />
    </div>
  </div>
</template>
