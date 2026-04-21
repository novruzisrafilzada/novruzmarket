<script setup lang="ts">
import { computed } from 'vue'
import { Layers, Trash2, ArrowLeftRight } from 'lucide-vue-next'
import { useCompareStore } from '~/stores/compare'
import { buildProductHref } from '~/utils/product-route'

const compareStore = useCompareStore()
const { formatMoney } = useMoney()
const { t } = useT()

useSiteSeo({
  title: computed(() => String(t('compare_page_title'))),
  description: computed(() => String(t('compare_page_desc'))),
  path: computed(() => '/compare')
})

onMounted(() => {
  compareStore.hydrate()
})
</script>

<template>
  <div class="container py-16">
    <div class="flex items-center justify-between mb-10">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">{{ t('compare_page_title') }}</h1>
        <p class="text-gray-500 font-medium mt-2">{{ t('compare_page_desc') }}</p>
      </div>
      <div class="text-sm font-bold text-gray-400">{{ t('selected_short') }}: {{ compareStore.items.length }}/4</div>
    </div>

    <div v-if="compareStore.items.length === 0" class="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
      <Layers class="w-20 h-20 text-gray-300 mx-auto mb-6" />
      <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ t('compare_empty_title') }}</h2>
      <p class="text-gray-500 mb-8 max-w-md mx-auto">{{ t('compare_empty_desc') }}</p>
      <NuxtLink to="/shop" class="bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 inline-flex items-center">
        <ArrowLeftRight class="w-5 h-5 mr-2" />
        {{ t('nav_shop') }}
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div v-for="item in compareStore.items" :key="item.id" class="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all relative group">
        <button
          type="button"
          class="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center"
          @click="compareStore.toggle(item)"
        >
          <Trash2 class="w-5 h-5" />
        </button>

        <div class="bg-gray-50 rounded-2xl p-6 aspect-[4/5] flex items-center justify-center mb-6">
          <img :src="item.image" :alt="item.name" class="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform" />
        </div>
        <h3 class="text-sm font-extrabold text-gray-900 mb-4 line-clamp-2 min-h-[40px]">{{ item.name }}</h3>
        <div class="flex items-center justify-between">
          <div class="text-lg font-extrabold text-blue-600">{{ formatMoney(item.price) }}</div>
          <NuxtLink :to="buildProductHref(item)" class="text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors">
            {{ t('view_product') }}
          </NuxtLink>
        </div>
        <div class="mt-6 pt-6 border-t border-gray-100 space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-400 font-bold">{{ t('category') }}</span>
            <span class="text-gray-700 font-bold">{{ item.category || '-' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400 font-bold">{{ t('availability') }}</span>
            <span :class="['font-bold', item.stock > 0 ? 'text-green-600' : 'text-red-600']">{{ item.stock > 0 ? t('in_stock' as any) : t('out_of_stock' as any) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
