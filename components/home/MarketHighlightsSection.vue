<script setup lang="ts">
import { Boxes, LayoutGrid, Sparkles, Store } from 'lucide-vue-next'

const { lang } = useT()
const homeStore = useHomeSectionsStore()
const categoryStore = useCategoryStore()

if (!homeStore.hydrated || !homeStore.config) {
  await homeStore.fetchConfig()
}
if (!categoryStore.hydrated || !categoryStore.categories.length) {
  await categoryStore.fetchCategories()
}

const [{ data: productsData }, { data: sellersData }] = await Promise.all([
  useFetch('/api/products', { default: () => [] }),
  useFetch('/api/sellers?limit=50', { default: () => [] })
])

const section = computed(() => homeStore.config?.marketHighlights)
const title = computed(() => section.value?.titleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.titleI18n?.az || 'Market highlights')
const subtitle = computed(() => section.value?.subtitleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.subtitleI18n?.az || '')
const cards = computed(() => [
  { label: 'Məhsul', value: (productsData.value || []).length, icon: Boxes, tone: 'from-blue-600 to-cyan-500' },
  { label: 'Mağaza', value: (sellersData.value || []).length, icon: Store, tone: 'from-violet-600 to-fuchsia-500' },
  { label: 'Kateqoriya', value: categoryStore.categories.length, icon: LayoutGrid, tone: 'from-emerald-600 to-lime-500' },
  { label: 'Önə çıxan', value: (productsData.value || []).filter((item: any) => item.featuredStatus === 'Aktiv').length, icon: Sparkles, tone: 'from-amber-500 to-orange-500' }
])
</script>

<template>
  <div v-if="section?.enabled" class="container py-10 sm:py-12">
    <div class="rounded-[2.5rem] bg-gradient-to-br from-slate-100 via-white to-blue-50 border border-gray-100 overflow-hidden p-6 md:p-10">
      <div class="max-w-2xl">
        <HomeSectionHeading eyebrow="Seçilmişlər" :title="title" :subtitle="subtitle" />
      </div>

      <div class="mt-8 grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div v-for="card in cards" :key="card.label" class="rounded-[2rem] bg-white border border-white/70 shadow-sm p-5 md:p-6">
          <div :class="['w-14 h-14 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center', card.tone]">
            <component :is="card.icon" class="w-7 h-7" />
          </div>
          <div class="mt-5 text-[11px] uppercase tracking-[0.18em] text-gray-400 font-extrabold">{{ card.label }}</div>
          <div class="mt-2 text-3xl font-extrabold text-gray-900">{{ card.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
