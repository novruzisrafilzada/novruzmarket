<script setup lang="ts">
const homeStore = useHomeSectionsStore()
const { lang } = useT()
const { trackHomeSectionClick } = useHomeAnalytics()

if (!homeStore.hydrated || !homeStore.config) {
  await homeStore.fetchConfig()
}

const section = computed(() => homeStore.config?.shopByBrand)
const title = computed(() => section.value?.titleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.titleI18n?.az || 'Brendə görə alış-veriş')
const subtitle = computed(() => section.value?.subtitleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.subtitleI18n?.az || '')
const cards = computed(() => (section.value?.cards || []).filter((item: any) => item?.name && item?.href))
</script>

<template>
  <div v-if="section?.enabled && cards.length" class="container py-10 sm:py-12">
    <div class="mb-8">
      <HomeSectionHeading :title="title" :subtitle="subtitle" />
    </div>
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <NuxtLink
        v-for="card in cards"
        :key="`${card.name}-${card.href}`"
        :to="card.href"
        class="group rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
        @click="trackHomeSectionClick('shopByBrand', card.name)"
      >
        <div class="flex h-16 items-center justify-center">
          <img v-if="card.logo" :src="card.logo" :alt="card.name" class="max-h-10 w-auto object-contain grayscale transition-all group-hover:grayscale-0" />
          <div v-else class="text-lg font-extrabold text-gray-900">{{ card.name }}</div>
        </div>
        <div class="mt-4 text-center text-sm font-extrabold text-gray-700">{{ card.name }}</div>
      </NuxtLink>
    </div>
  </div>
</template>
