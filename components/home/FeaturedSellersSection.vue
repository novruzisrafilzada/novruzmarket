<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight, Store } from 'lucide-vue-next'

const homeStore = useHomeSectionsStore()
const settingsStore = useSettingsStore()
const { lang } = useT()

if (!homeStore.hydrated || !homeStore.config) {
  await homeStore.fetchConfig()
}
await settingsStore.fetchSettings()

const promoConfig = computed(() => settingsStore.settings.sellerPromotion)
const section = computed(() => homeStore.config?.featuredSellers)
const limit = computed(() => Math.max(1, Number(section.value?.limit || promoConfig.value?.sectionLimit || 4)))
const { data: sellersData } = await useFetch(() => `/api/sellers?limit=${limit.value}`, {
  default: () => []
})

const sellers = computed(() => sellersData.value || [])
const title = computed(() => section.value?.titleI18n?.[lang.value as 'az' | 'ru' | 'en'] || promoConfig.value?.sectionTitle?.[lang.value as 'az' | 'ru' | 'en'] || promoConfig.value?.sectionTitle?.az || 'Satıcılar')
const subtitle = computed(() => section.value?.subtitleI18n?.[lang.value as 'az' | 'ru' | 'en'] || promoConfig.value?.sectionSubtitle?.[lang.value as 'az' | 'ru' | 'en'] || promoConfig.value?.sectionSubtitle?.az || '')
const cta = computed(() => promoConfig.value?.sectionCta?.[lang.value as 'az' | 'ru' | 'en'] || promoConfig.value?.sectionCta?.az || 'Hamısına bax')
const label = computed(() => promoConfig.value?.sectionLabel || 'Satıcılar')
const enabled = computed(() => Boolean(promoConfig.value?.sectionEnabled) && Boolean(section.value?.enabled) && sellers.value.length > 0)
</script>

<template>
  <div v-if="enabled" class="container py-10 sm:py-12">
    <div class="mb-8">
      <HomeSectionHeading :eyebrow="label" :title="title" :subtitle="subtitle">
        <template #actions>
          <NuxtLink to="/sellers" class="inline-flex items-center gap-2 text-sm font-extrabold text-blue-600 hover:underline">
            {{ cta }}
            <ChevronRight class="w-4 h-4" />
          </NuxtLink>
        </template>
      </HomeSectionHeading>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      <NuxtLink v-for="seller in sellers" :key="seller.id" :to="`/sellers/${seller.id}`" class="group relative overflow-hidden rounded-[2rem] border border-blue-100/70 bg-gradient-to-br from-white via-slate-50 to-blue-50/70 p-6 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all">
        <div class="absolute right-0 top-0 w-32 h-32 rounded-full bg-blue-200/20 blur-3xl"></div>
        <div class="relative flex items-start justify-between gap-4">
          <div class="w-14 h-14 rounded-2xl bg-[color:var(--color-primary,#2B3E95)] text-white flex items-center justify-center shadow-lg shadow-blue-200/60 overflow-hidden border border-white/30">
            <img v-if="seller.profileImage" :src="seller.profileImage" alt="" class="w-full h-full object-cover" />
            <Store v-else class="w-7 h-7" />
          </div>
          <span v-if="seller.isFeatured" class="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
            {{ seller.featuredBadgeText || 'PRO' }}
          </span>
        </div>
        <div class="relative mt-5 text-xl font-extrabold text-gray-900 leading-tight">{{ seller.shopName }}</div>
        <div class="relative mt-2 text-sm font-medium text-gray-500">{{ seller.name }}</div>
        <div v-if="seller.categoryNames?.length" class="relative mt-4 flex flex-wrap gap-2">
          <span v-for="categoryName in seller.categoryNames.slice(0, 3)" :key="`${seller.id}-${categoryName}`" class="px-3 py-1 rounded-full bg-white/90 border border-blue-100 text-[11px] font-extrabold text-[color:var(--color-primary,#2B3E95)]">
            {{ categoryName }}
          </span>
        </div>
        <div class="relative mt-6 grid grid-cols-2 gap-3">
          <div class="rounded-2xl bg-white/85 border border-blue-100 px-4 py-3">
            <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">Məhsul</div>
            <div class="mt-1 text-xl font-extrabold text-[color:var(--color-primary,#2B3E95)]">{{ seller.productCount }}</div>
          </div>
          <div class="rounded-2xl bg-white/85 border border-blue-100 px-4 py-3">
            <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">Stok</div>
            <div class="mt-1 text-xl font-extrabold text-[color:var(--color-primary,#2B3E95)]">{{ seller.stockTotal }}</div>
          </div>
        </div>
        <div class="relative mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-[color:var(--color-primary,#2B3E95)]">
          Mağazaya keç
          <ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
