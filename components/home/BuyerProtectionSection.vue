<script setup lang="ts">
import { BadgeCheck, RotateCcw, ShieldCheck, Truck } from 'lucide-vue-next'

const homeStore = useHomeSectionsStore()
const { lang } = useT()

if (!homeStore.hydrated || !homeStore.config) {
  await homeStore.fetchConfig()
}

const section = computed(() => homeStore.config?.buyerProtection)
const title = computed(() => section.value?.titleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.titleI18n?.az || 'Alıcı qorunması')
const subtitle = computed(() => section.value?.subtitleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.subtitleI18n?.az || '')
const items = computed(() =>
  (section.value?.items || []).map((item: any) => ({
    icon: String(item?.icon || 'shield'),
    title: item?.titleI18n?.[lang.value as 'az' | 'ru' | 'en'] || item?.titleI18n?.az || '',
    subtitle: item?.subtitleI18n?.[lang.value as 'az' | 'ru' | 'en'] || item?.subtitleI18n?.az || ''
  })).filter((item: any) => item.title)
)

const iconMap: Record<string, any> = {
  shield: ShieldCheck,
  truck: Truck,
  'rotate-ccw': RotateCcw,
  'badge-check': BadgeCheck
}
</script>

<template>
  <div v-if="section?.enabled && items.length" class="container py-10 sm:py-12">
    <div class="rounded-[2rem] border border-gray-100 bg-slate-50/70 p-6 sm:p-8">
      <div class="mb-8">
        <HomeSectionHeading :title="title" :subtitle="subtitle" />
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div v-for="item in items" :key="`${item.icon}-${item.title}`" class="rounded-[1.5rem] border border-white bg-white p-5 shadow-sm">
          <component :is="iconMap[item.icon] || ShieldCheck" class="h-7 w-7 text-[color:var(--color-primary,#2B3E95)]" />
          <div class="mt-4 text-lg font-extrabold leading-tight text-gray-900">{{ item.title }}</div>
          <div v-if="item.subtitle" class="mt-2 text-sm font-medium text-gray-500">{{ item.subtitle }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
