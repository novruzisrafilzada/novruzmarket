<script setup lang="ts">
import { BadgeCheck, ChevronRight, Store } from 'lucide-vue-next'

const homeStore = useHomeSectionsStore()
const { lang, t } = useT()

if (!homeStore.hydrated || !homeStore.config) {
  await homeStore.fetchConfig()
}

const section = computed(() => homeStore.config?.verifiedSellers)
const limit = computed(() => Math.max(1, Number(section.value?.limit || 4)))
const { data: sellersData } = await useFetch(() => `/api/sellers?limit=${limit.value}`, {
  default: () => []
})

const sellers = computed(() =>
  (sellersData.value || [])
    .filter((seller: any) => seller.isVerified)
    .slice()
    .sort((a: any, b: any) => {
      if (Number(b.isFeatured) !== Number(a.isFeatured)) return Number(b.isFeatured) - Number(a.isFeatured)
      if (Number(b.productCount || 0) !== Number(a.productCount || 0)) return Number(b.productCount || 0) - Number(a.productCount || 0)
      return Number(b.stockTotal || 0) - Number(a.stockTotal || 0)
    })
    .slice(0, limit.value)
)
const title = computed(() => section.value?.titleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.titleI18n?.az || 'Yoxlanılmış mağazalar')
const subtitle = computed(() => section.value?.subtitleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.subtitleI18n?.az || '')
</script>

<template>
  <div v-if="section?.enabled && sellers.length" class="container py-10 sm:py-12">
    <div class="mb-8">
      <HomeSectionHeading :title="title" :subtitle="subtitle">
        <template #actions>
          <NuxtLink to="/sellers" class="inline-flex items-center gap-2 text-sm font-extrabold text-blue-600 hover:underline">
            {{ t('view_stores') }}
            <ChevronRight class="w-4 h-4" />
          </NuxtLink>
        </template>
      </HomeSectionHeading>
    </div>
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <NuxtLink v-for="seller in sellers" :key="seller.id" :to="`/sellers/${seller.id}`" class="group rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/60 to-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
        <div class="flex items-start justify-between gap-4">
          <div class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/40 bg-[color:var(--color-primary,#2B3E95)] text-white shadow-lg shadow-blue-200/60">
            <img v-if="seller.profileImage" :src="seller.profileImage" alt="" class="h-full w-full object-cover" />
            <Store v-else class="w-7 h-7" />
          </div>
          <span class="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-700">
            <BadgeCheck class="w-3.5 h-3.5" />
            {{ seller.isFeatured ? (seller.featuredBadgeText || 'PRO') : t('verified') }}
          </span>
        </div>
        <div class="mt-5 text-xl font-extrabold leading-tight text-gray-900">{{ seller.shopName }}</div>
        <div class="mt-2 text-sm font-medium text-gray-500">{{ seller.name }}</div>
        <div class="mt-6 grid grid-cols-2 gap-3">
          <div class="rounded-2xl border border-emerald-100 bg-white/90 px-4 py-3">
            <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">Məhsul</div>
            <div class="mt-1 text-xl font-extrabold text-[color:var(--color-primary,#2B3E95)]">{{ seller.productCount }}</div>
          </div>
          <div class="rounded-2xl border border-emerald-100 bg-white/90 px-4 py-3">
            <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">Stok</div>
            <div class="mt-1 text-xl font-extrabold text-[color:var(--color-primary,#2B3E95)]">{{ seller.stockTotal }}</div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
