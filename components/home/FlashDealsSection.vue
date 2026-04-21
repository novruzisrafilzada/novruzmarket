<script setup lang="ts">
import { ArrowRight, Clock3 } from 'lucide-vue-next'
import { buildProductHref } from '~/utils/product-route'
import { useTopDealsStore } from '~/stores/topDeals'

const homeStore = useHomeSectionsStore()
const productStore = useProductStore()
const topDealsStore = useTopDealsStore()
const { lang, t } = useT()
const { formatMoney } = useMoney()
const { trackHomeSectionClick } = useHomeAnalytics()

if (!homeStore.hydrated || !homeStore.config) await homeStore.fetchConfig()
if (!productStore.hydrated) await productStore.fetchProducts()
if (!topDealsStore.hydrated) await topDealsStore.fetchConfig()

const section = computed(() => homeStore.config?.flashDeals)
const title = computed(() => section.value?.titleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.titleI18n?.az || 'Flash deals')
const subtitle = computed(() => section.value?.subtitleI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.subtitleI18n?.az || '')
const cta = computed(() => section.value?.ctaLabelI18n?.[lang.value as 'az' | 'ru' | 'en'] || section.value?.ctaLabelI18n?.az || 'İndi al')
const dealProduct = computed(() => {
  const selectedId = Number(topDealsStore.config.productIds?.[0] || 0)
  return productStore.products.find((item: any) => Number(item.id) === selectedId) || productStore.products.find((item: any) => item.status === 'Aktiv') || null
})
const countdownItems = computed(() => ([
  { value: timeLeft.value.days, label: t('days') },
  { value: timeLeft.value.hours, label: t('hours') },
  { value: timeLeft.value.minutes, label: t('mins') },
  { value: timeLeft.value.seconds, label: t('secs') }
]))
const timeLeft = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let timer: ReturnType<typeof setInterval> | null = null

const computeTimeLeft = () => {
  const target = String(topDealsStore.config.endAt || '').trim()
  const date = target ? new Date(target) : null
  const diff = date ? date.getTime() - Date.now() : 0
  if (!date || !Number.isFinite(date.getTime()) || diff <= 0) {
    timeLeft.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return
  }
  const totalSeconds = Math.floor(diff / 1000)
  timeLeft.value = {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  }
}

onMounted(() => {
  computeTimeLeft()
  timer = setInterval(computeTimeLeft, 1000)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div v-if="section?.enabled && dealProduct" class="container py-10 sm:py-12">
    <NuxtLink :to="buildProductHref(dealProduct)" class="block overflow-hidden rounded-[2rem] bg-gradient-to-r from-gray-950 via-[color:var(--color-primary,#2B3E95)] to-indigo-700 p-8 text-white shadow-xl" @click="trackHomeSectionClick('flashDeals', String(dealProduct.id))">
      <div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.15fr,0.85fr]">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[color:var(--color-accent,#FACC15)]">
            <Clock3 class="h-4 w-4" />
            {{ title }}
          </div>
          <div class="mt-4 text-3xl font-extrabold leading-tight md:text-4xl">{{ dealProduct.name }}</div>
          <div v-if="subtitle" class="mt-3 max-w-2xl text-sm font-medium text-white/75 md:text-base">{{ subtitle }}</div>
          <div class="mt-6 flex flex-wrap items-end gap-4">
            <div class="text-3xl font-extrabold">{{ formatMoney(dealProduct.price) }}</div>
            <div v-if="dealProduct.oldPrice" class="text-lg font-bold text-white/50 line-through">{{ formatMoney(dealProduct.oldPrice) }}</div>
          </div>
          <div class="mt-8 inline-flex items-center gap-2 rounded-full bg-[color:var(--color-accent,#FACC15)] px-6 py-3 text-sm font-extrabold text-gray-900">
            {{ cta }}
            <ArrowRight class="h-4 w-4" />
          </div>
        </div>
        <div>
          <div class="grid grid-cols-4 gap-3">
            <div v-for="item in countdownItems" :key="item.label" class="rounded-[1.5rem] border border-white/10 bg-white/10 px-4 py-5 text-center backdrop-blur">
              <div class="text-2xl font-extrabold">{{ String(item.value).padStart(2, '0') }}</div>
              <div class="mt-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/60">{{ item.label }}</div>
            </div>
          </div>
          <div class="mt-6 rounded-[2rem] bg-white/10 p-6 backdrop-blur">
            <img :src="dealProduct.image" :alt="dealProduct.name" class="mx-auto h-56 w-full object-contain" />
          </div>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
