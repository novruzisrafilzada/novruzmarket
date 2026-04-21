<script setup lang="ts">
import { buildProductHref } from '~/utils/product-route'

const settingsStore = useSettingsStore()
const productStore = useProductStore()
const visible = ref(false)
const index = ref(0)

const saleItems = computed(() =>
  productStore.products
    .filter((item) => item.status === 'Aktiv')
    .sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0))
    .slice(0, 6)
)
const currentItem = computed(() => saleItems.value[index.value] || null)

onMounted(async () => {
  if (!settingsStore.hydrated) await settingsStore.fetchSettings().catch(() => {})
  if (!productStore.hydrated) await productStore.fetchProducts().catch(() => {})
  if (!settingsStore.settings.creativeSuite?.recentSalesPopupEnabled || !saleItems.value.length) return
  visible.value = true
  setInterval(() => {
    index.value = (index.value + 1) % Math.max(1, saleItems.value.length)
  }, 3800)
})
</script>

<template>
  <transition name="notice-pop">
    <NuxtLink v-if="visible && currentItem" :to="buildProductHref(currentItem)" class="fixed bottom-6 left-6 z-[104] hidden md:flex items-center gap-4 rounded-[1.7rem] border border-gray-200 bg-white/95 px-4 py-4 shadow-2xl backdrop-blur">
      <img :src="currentItem.image" :alt="currentItem.name" class="w-16 h-16 rounded-2xl object-cover bg-gray-50" />
      <div class="max-w-xs">
        <div class="text-[10px] font-extrabold uppercase tracking-[0.22em] text-blue-600">Canlı satış</div>
        <div class="mt-1 text-sm font-extrabold text-gray-900 line-clamp-1">{{ currentItem.name }}</div>
        <div class="mt-1 text-xs font-medium text-gray-500">Az öncə alındı · Stok {{ currentItem.stock ?? 0 }}</div>
      </div>
    </NuxtLink>
  </transition>
</template>
