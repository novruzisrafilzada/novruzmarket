<script setup lang="ts">
const categoryStore = useCategoryStore()
const homeStore = useHomeSectionsStore()
const { lang } = useT()
const { iconFor, cardStyleFor, iconWrapStyleFor, iconColorStyleFor } = useCategoryPresentation()
const sliderRef = ref<HTMLElement | null>(null)

if (!categoryStore.hydrated || !categoryStore.categories.length) {
  await categoryStore.fetchCategories()
}
if (!homeStore.hydrated || !homeStore.config) {
  await homeStore.fetchConfig()
}

const section = computed(() => homeStore.config?.featuredCategories)
const featuredCategories = computed(() => categoryStore.categories.filter((category) => category.featuredOnHome).slice(0, Math.max(1, Number(section.value?.limit || 8))))
const displayName = (category: any) => category?.nameI18n?.[lang.value as 'az' | 'ru' | 'en'] || category?.nameI18n?.az || category?.slug || ''
const title = computed(() => section.value?.titleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.titleI18n?.az || 'Seçilmiş kateqoriyalar')
const subtitle = computed(() => section.value?.subtitleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.subtitleI18n?.az || '')

const scrollCategories = (direction: 'prev' | 'next') => {
  if (!sliderRef.value) return
  const amount = Math.max(260, Math.floor(sliderRef.value.clientWidth * 0.82))
  sliderRef.value.scrollBy({
    left: direction === 'next' ? amount : -amount,
    behavior: 'smooth'
  })
}
</script>

<template>
  <div v-if="section?.enabled && featuredCategories.length" class="container py-10 sm:py-12">
    <div class="mb-8">
      <HomeSectionHeading eyebrow="Kateqoriyalar" :title="title" :subtitle="subtitle">
        <template #actions>
          <div class="flex items-center gap-3">
            <div class="hidden sm:flex items-center gap-2">
              <button type="button" class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-[color:var(--color-primary,#2B3E95)] shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50" @click="scrollCategories('prev')">
                <span class="text-lg font-extrabold">←</span>
              </button>
              <button type="button" class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-[color:var(--color-primary,#2B3E95)] shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50" @click="scrollCategories('next')">
                <span class="text-lg font-extrabold animate-[arrowPulse_1.8s_ease-in-out_infinite]">→</span>
              </button>
            </div>
            <NuxtLink to="/shop" class="text-sm font-extrabold text-blue-600 hover:underline">Mağazaya keç</NuxtLink>
          </div>
        </template>
      </HomeSectionHeading>
    </div>

    <div ref="sliderRef" class="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-4">
      <NuxtLink
        v-for="category in featuredCategories"
        :key="category.id"
        :to="{ path: '/shop', query: { categoryId: String(category.id) } }"
        class="group relative min-h-[154px] w-[140px] shrink-0 snap-start rounded-[1.7rem] border p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-[172px] sm:p-4 lg:w-[188px]"
        :style="cardStyleFor(category)"
      >
        <div class="flex h-full flex-col">
          <div class="flex items-start justify-between gap-3">
            <div class="flex h-14 w-14 items-center justify-center rounded-[1.15rem] border border-white/70 shadow-sm sm:h-16 sm:w-16" :style="iconWrapStyleFor(category)">
              <component :is="iconFor(category)" class="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <div class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/80 shadow-sm transition-transform duration-300 group-hover:translate-x-1" :style="iconColorStyleFor(category)">
              <span class="text-base font-extrabold">→</span>
            </div>
          </div>
          <div class="mt-4 flex-1">
            <div class="text-[13px] font-black leading-5 text-gray-900 sm:text-sm">{{ displayName(category) }}</div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
@keyframes arrowPulse {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(3px); }
}
</style>
