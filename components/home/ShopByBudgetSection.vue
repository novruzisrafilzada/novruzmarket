<script setup lang="ts">
const homeStore = useHomeSectionsStore()
const productStore = useProductStore()
const { lang } = useT()
const { formatMoney } = useMoney()

if (!homeStore.hydrated || !homeStore.config) {
  await homeStore.fetchConfig()
}
if (!productStore.hydrated) {
  await productStore.fetchProducts()
}

const section = computed(() => homeStore.config?.shopByBudget)
const title = computed(() => section.value?.titleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.titleI18n?.az || 'Büdcəyə görə alış-veriş')
const subtitle = computed(() => section.value?.subtitleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.subtitleI18n?.az || '')
const activeProducts = computed(() => productStore.products.filter((item: any) => item.status === 'Aktiv'))
const cards = computed(() =>
  (section.value?.cards || []).map((item: any) => {
    const min = Math.max(0, Number(item?.minPrice || 0))
    const max = Math.max(0, Number(item?.maxPrice || 0))
    const matched = activeProducts.value.filter((product: any) => {
      const price = Number(product?.price || 0)
      if (price < min) return false
      if (max > 0 && price > max) return false
      return true
    })
    return {
      label: item?.labelI18n?.[lang.value as 'az' | 'ru' | 'en'] || item?.labelI18n?.az || '',
      subtitle: item?.subtitleI18n?.[lang.value as 'az' | 'ru' | 'en'] || item?.subtitleI18n?.az || '',
      href: item?.href || '/shop',
      min,
      max,
      count: matched.length
    }
  }).filter((item: any) => item.label && item.count > 0)
)
const describeRange = (min: number, max: number) => {
  if (max > 0 && min > 0) return `${formatMoney(min)} - ${formatMoney(max)}`
  if (max > 0) return `${formatMoney(max)}-ə qədər`
  return `${formatMoney(min)}+`
}
</script>

<template>
  <div v-if="section?.enabled && cards.length" class="container py-10 sm:py-12">
    <div class="mb-8">
      <HomeSectionHeading :title="title" :subtitle="subtitle" />
    </div>
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <NuxtLink
        v-for="card in cards"
        :key="`${card.label}-${card.href}`"
        :to="card.href"
        class="group rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
      >
        <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[color:var(--color-primary,#2B3E95)]">{{ describeRange(card.min, card.max) }}</div>
        <div class="mt-3 text-2xl font-extrabold leading-tight text-gray-900">{{ card.label }}</div>
        <div v-if="card.subtitle" class="mt-2 text-sm font-medium text-gray-500">{{ card.subtitle }}</div>
        <div class="mt-6 flex items-center justify-between">
          <span class="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700">{{ card.count }} məhsul</span>
          <span class="text-sm font-extrabold text-[color:var(--color-primary,#2B3E95)] transition-transform group-hover:translate-x-1">Bax</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
