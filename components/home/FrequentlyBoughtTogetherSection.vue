<script setup lang="ts">
import { Plus } from 'lucide-vue-next'

const homeStore = useHomeSectionsStore()
const { lang } = useT()
const { formatMoney } = useMoney()
const { trackHomeSectionClick } = useHomeAnalytics()

if (!homeStore.hydrated || !homeStore.config) {
  await homeStore.fetchConfig()
}

const section = computed(() => homeStore.config?.frequentlyBoughtTogether)
const limit = computed(() => Math.max(1, Number(section.value?.limit || 4)))
const { data: pairsData } = await useFetch(() => `/api/homepage/frequently-bought?limit=${limit.value}`, { default: () => [] })
const title = computed(() => section.value?.titleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.titleI18n?.az || 'Birlikdə tez-tez alınır')
const subtitle = computed(() => section.value?.subtitleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.subtitleI18n?.az || '')
</script>

<template>
  <div v-if="section?.enabled && (pairsData || []).length" class="container py-10 sm:py-12">
    <div class="mb-8">
      <HomeSectionHeading :title="title" :subtitle="subtitle" />
    </div>
    <div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <div v-for="pair in pairsData" :key="pair.products.map((item:any)=>item.id).join('-')" class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div class="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
          <div class="min-w-0" @click="trackHomeSectionClick('frequentlyBoughtTogether', String(pair.products[0].id))">
            <ProductCard :product="pair.products[0]" tracking-section="frequentlyBoughtTogether" />
          </div>
          <div class="flex h-12 w-12 items-center justify-center rounded-full border border-gray-100 bg-white text-[color:var(--color-primary,#2B3E95)] shadow-sm">
            <Plus class="h-5 w-5" />
          </div>
          <div class="min-w-0" @click="trackHomeSectionClick('frequentlyBoughtTogether', String(pair.products[1].id))">
            <ProductCard :product="pair.products[1]" tracking-section="frequentlyBoughtTogether" />
          </div>
        </div>
        <div class="mt-4 flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
          <div class="text-sm font-medium text-gray-500">{{ pair.count }} sifarişdə birlikdə alınıb</div>
          <div class="text-base font-extrabold text-gray-900">
            {{ formatMoney(Number(pair.products[0]?.price || 0) + Number(pair.products[1]?.price || 0)) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
