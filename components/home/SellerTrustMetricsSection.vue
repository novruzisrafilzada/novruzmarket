<script setup lang="ts">
import { BadgeCheck, ChevronRight, Package, ShieldCheck, ShoppingBag } from 'lucide-vue-next'

const homeStore = useHomeSectionsStore()
const { lang, t } = useT()
const { trackHomeSectionClick } = useHomeAnalytics()

if (!homeStore.hydrated || !homeStore.config) {
  await homeStore.fetchConfig()
}

const section = computed(() => homeStore.config?.sellerTrustMetrics)
const limit = computed(() => Math.max(1, Number(section.value?.limit || 4)))
const { data: sellersData } = await useFetch(() => `/api/homepage/seller-trust?limit=${limit.value}`, { default: () => [] })
const title = computed(() => section.value?.titleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.titleI18n?.az || 'Satıcı etibar göstəriciləri')
const subtitle = computed(() => section.value?.subtitleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.subtitleI18n?.az || '')
</script>

<template>
  <div v-if="section?.enabled && (sellersData || []).length" class="container py-10 sm:py-12">
    <div class="mb-8">
      <HomeSectionHeading :title="title" :subtitle="subtitle" />
    </div>
    <div class="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-4">
      <NuxtLink
        v-for="seller in sellersData"
        :key="seller.id"
        :to="`/sellers/${seller.id}`"
        class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
        @click="trackHomeSectionClick('sellerTrustMetrics', String(seller.id))"
      >
        <div class="flex items-center justify-between">
          <div class="text-sm font-extrabold uppercase tracking-[0.16em] text-[color:var(--color-primary,#2B3E95)]">{{ t('trust_score') }}</div>
          <span class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-extrabold text-emerald-700">
            <BadgeCheck class="w-3.5 h-3.5" />
            {{ seller.verifiedStatus === 'Təsdiqləndi' ? t('verified') : t('seller_role') }}
          </span>
        </div>
        <div class="mt-4 text-3xl font-extrabold text-gray-900">{{ seller.score }}</div>
        <div class="mt-3 text-lg font-extrabold text-gray-900">{{ seller.shopName }}</div>
        <div class="mt-2 text-sm font-medium text-gray-500">{{ seller.name }}</div>
        <div class="mt-6 space-y-3">
          <div class="flex items-center justify-between text-sm font-medium text-gray-600">
            <span class="inline-flex items-center gap-2"><Package class="w-4 h-4 text-gray-400" /> {{ t('products_label') }}</span>
            <span class="font-extrabold text-gray-900">{{ seller.productCount }}</span>
          </div>
          <div class="flex items-center justify-between text-sm font-medium text-gray-600">
            <span class="inline-flex items-center gap-2"><ShoppingBag class="w-4 h-4 text-gray-400" /> {{ t('orders_label') }}</span>
            <span class="font-extrabold text-gray-900">{{ seller.orderCount }}</span>
          </div>
          <div class="flex items-center justify-between text-sm font-medium text-gray-600">
            <span class="inline-flex items-center gap-2"><ShieldCheck class="w-4 h-4 text-gray-400" /> {{ t('rating_label') }}</span>
            <span class="font-extrabold text-gray-900">{{ seller.ratingAvg }}</span>
          </div>
        </div>
        <div class="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-[color:var(--color-primary,#2B3E95)]">
          {{ t('view_store') }}
          <ChevronRight class="w-4 h-4" />
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
