<script setup lang="ts">
import { Store, Package, Boxes, ChevronRight } from 'lucide-vue-next'
import { buildProductHref } from '~/utils/product-route'

const route = useRoute()
const { formatMoney } = useMoney()
const { data: seller } = await useFetch(`/api/sellers/${route.params.id}`)
</script>

<template>
  <div v-if="seller" class="bg-gray-50/50 py-16 md:py-24">
    <div class="container">
      <div class="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden relative">
        <div class="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-indigo-50" :style="{ background: seller.themeColor ? `linear-gradient(135deg, white, ${seller.themeColor}22, #eef2ff)` : undefined }"></div>
        <img v-if="seller.coverImage" :src="seller.coverImage" alt="" class="absolute inset-0 w-full h-full object-cover opacity-35" />
        <div class="absolute inset-0 bg-gradient-to-r from-white/92 via-white/82 to-white/70"></div>
        <div class="relative p-8 md:p-12">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div class="max-w-3xl flex items-start gap-6">
            <div class="w-24 h-24 rounded-[2rem] bg-blue-50 text-blue-600 flex items-center justify-center overflow-hidden border border-blue-100 shrink-0">
              <img v-if="seller.profileImage" :src="seller.profileImage" alt="" class="w-full h-full object-cover" />
              <Store v-else class="w-10 h-10" />
            </div>
            <div>
            <div class="text-xs font-extrabold uppercase tracking-[0.26em] text-blue-600">{{ seller.heroLabel || 'Satıcı mağazası' }}</div>
            <h1 class="mt-4 text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">{{ seller.shopName }}</h1>
            <div class="mt-3 text-lg font-medium text-gray-500">{{ seller.name }}</div>
            <div v-if="seller.isFeatured" class="mt-4 inline-flex px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-xs font-extrabold uppercase tracking-[0.18em]">
              {{ seller.featuredBadgeText || 'PRO' }}
            </div>
            <div v-if="seller.storefrontLayout" class="mt-4 inline-flex px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold uppercase tracking-[0.18em]">
              {{ seller.storefrontLayout }}
            </div>
            <div v-if="seller.categoryNames?.length" class="mt-4 flex flex-wrap gap-2">
              <span v-for="categoryName in seller.categoryNames" :key="categoryName" class="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-extrabold text-blue-700">
                {{ categoryName }}
              </span>
            </div>
            <p v-if="seller.tagline || seller.note" class="mt-5 text-gray-700 leading-8 font-semibold">{{ seller.tagline || seller.note }}</p>
            <div v-if="seller.campaignHeadline" class="mt-3 text-xs font-extrabold uppercase tracking-[0.18em] text-gray-400">{{ seller.campaignHeadline }}</div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 lg:min-w-[320px]">
            <div class="rounded-[1.75rem] bg-gray-50 p-5">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Məhsul</div>
              <div class="mt-2 text-3xl font-extrabold text-gray-900">{{ seller.productCount }}</div>
            </div>
            <div class="rounded-[1.75rem] bg-gray-50 p-5">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Stok</div>
              <div class="mt-2 text-3xl font-extrabold text-gray-900">{{ seller.stockTotal }}</div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <div class="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <NuxtLink
          v-for="product in seller.products"
          :key="product.id"
          :to="buildProductHref(product)"
          class="bg-white border border-gray-100 rounded-[2rem] p-5 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all"
        >
          <div class="h-52 bg-gray-50 rounded-[1.5rem] overflow-hidden flex items-center justify-center p-4">
            <img :src="product.image" :alt="product.name" class="w-full h-full object-contain" />
          </div>
          <div class="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-blue-600">{{ product.category }}</div>
          <div class="mt-3 text-lg font-extrabold text-gray-900 leading-tight">{{ product.name }}</div>
          <div class="mt-4 flex items-center justify-between gap-3">
            <div class="text-2xl font-extrabold text-[color:var(--color-primary,#2B3E95)]">{{ formatMoney(product.price) }}</div>
            <div class="text-sm font-bold text-gray-400">{{ product.stock }} stok</div>
          </div>
          <div class="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-gray-700">
            Ətraflı bax
            <ChevronRight class="w-4 h-4" />
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
