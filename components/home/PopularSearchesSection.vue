<script setup lang="ts">
const homeStore = useHomeSectionsStore()
const { lang } = useT()

if (!homeStore.hydrated || !homeStore.config) {
  await homeStore.fetchConfig()
}

const section = computed(() => homeStore.config?.popularSearches)
const limit = computed(() => Math.max(1, Number(section.value?.limit || 8)))
const { data: searchesData } = await useFetch(() => `/api/search/popular?limit=${limit.value}`, {
  default: () => []
})

const items = computed(() => (searchesData.value || []).filter(Boolean))
const title = computed(() => section.value?.titleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.titleI18n?.az || 'Populyar axtarışlar')
const subtitle = computed(() => section.value?.subtitleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.subtitleI18n?.az || '')
</script>

<template>
  <div v-if="section?.enabled && items.length" class="container py-10 sm:py-12">
    <div class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <div class="mb-8">
        <HomeSectionHeading :title="title" :subtitle="subtitle" />
      </div>
      <div class="flex flex-wrap gap-3">
        <NuxtLink
          v-for="term in items"
          :key="term"
          :to="`/shop?q=${encodeURIComponent(term)}`"
          class="rounded-full border border-gray-200 bg-gray-50 px-5 py-3 text-sm font-extrabold text-gray-700 transition-all hover:-translate-y-0.5 hover:border-[color:var(--color-primary,#2B3E95)] hover:bg-white hover:text-[color:var(--color-primary,#2B3E95)]"
        >
          {{ term }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
