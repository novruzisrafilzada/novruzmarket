<script setup lang="ts">
import { computed } from 'vue'
import { Truck, ShieldCheck, Headphones, RotateCcw } from 'lucide-vue-next'
import { useSettingsStore } from '~/stores/settings'

const settingsStore = useSettingsStore()
const { lang } = useT()

const iconMap: Record<string, any> = {
  Truck,
  ShieldCheck,
  Headphones,
  RotateCcw
}

const features = computed(() => {
  const l = lang.value
  return (settingsStore.settings.homeFeatures || [])
    .filter(f => f.enabled)
    .map((f: any) => ({
      icon: iconMap[f.icon] || Truck,
      title: f.title?.[l] || f.title?.az || '',
      description: f.description?.[l] || f.description?.az || ''
    }))
})
</script>

<template>
  <div class="container py-8 sm:py-10">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-gray-200 bg-white">
      <div
        v-for="(feature, idx) in features"
        :key="feature.title"
        :class="['flex items-center gap-4 px-6 py-6', idx % 2 === 1 ? 'sm:border-l sm:border-gray-200' : '', idx < 2 ? 'border-b border-gray-200 lg:border-b-0' : '', 'lg:border-b-0', idx > 0 ? 'lg:border-l lg:border-gray-200' : '']"
      >
        <div class="w-12 h-12 border border-gray-200 bg-white flex items-center justify-center text-[color:var(--color-primary,#2B3E95)]">
          <component :is="feature.icon" class="w-6 h-6" />
        </div>
        <div class="min-w-0">
          <div class="text-sm font-extrabold text-gray-900 leading-tight truncate">{{ feature.title }}</div>
          <div class="text-xs text-gray-500 font-medium leading-relaxed mt-1 line-clamp-2">{{ feature.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
