<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import { useCategoryStore } from '~/stores/categories'

const categoryStore = useCategoryStore()
const { t, lang } = useT()
const { iconFor, iconWrapStyleFor, iconColorStyleFor } = useCategoryPresentation()

if (!categoryStore.hydrated) {
  await categoryStore.fetchCategories()
}

const label = (c: any) => {
  const l = lang.value
  return c?.nameI18n?.[l] || c?.nameI18n?.az || c?.name || ''
}

const parents = computed(() => categoryStore.categories.filter((c: any) => !c.parentId))
</script>

<template>
  <div class="bg-white border border-gray-200">
    <div class="h-14 flex items-center gap-3 px-5 bg-[#FFD200] text-gray-900 font-extrabold">
      <span class="flex h-9 w-9 items-center justify-center rounded-xl border border-white/70 bg-white/70 shadow-sm" :style="iconWrapStyleFor({ id: 0 })">
        <component :is="iconFor('Package')" class="h-4.5 w-4.5" />
      </span>
      {{ t('all_categories' as any) }}
    </div>
    <div class="max-h-[calc(var(--hero-height)-56px)] overflow-auto">
      <button
        v-for="p in parents"
        :key="p.id"
        type="button"
        class="w-full text-left px-5 py-3.5 border-b border-gray-200 last:border-0 text-sm font-medium text-gray-800 hover:bg-gray-50 flex items-center gap-3"
        @click="navigateTo({ path: '/shop', query: { categoryId: String(p.id) } })"
      >
        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/70 shadow-sm" :style="iconWrapStyleFor(p)">
          <component :is="iconFor(p)" class="h-5 w-5" />
        </span>
        <span class="flex-1">{{ label(p) }}</span>
        <ChevronRight class="w-4 h-4 text-gray-400" :style="iconColorStyleFor(p)" />
      </button>
    </div>
  </div>
</template>
