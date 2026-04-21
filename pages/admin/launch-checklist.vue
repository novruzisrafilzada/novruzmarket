<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-vue-next'
import { usePageStore } from '~/stores/pages'
import { useSettingsStore } from '~/stores/settings'
import { useAdminPortal } from '~/composables/useAdminPortal'

definePageMeta({ layout: 'admin' })

const settingsStore = useSettingsStore()
const pageStore = usePageStore()
const { adminPath } = useAdminPortal()

if (!settingsStore.hydrated) {
  await settingsStore.fetchSettings()
}

if (!pageStore.hydrated || pageStore.pages.length === 0) {
  if (process.server) {
    const fetcher = useRequestFetch()
    const pages = await fetcher('/api/pages')
    pageStore.setPages(pages as any)
  } else {
    await pageStore.fetchPages()
  }
}

const settings = computed(() => settingsStore.settings)
const activePages = computed(() => pageStore.pages.filter((page) => page.status === 'Aktiv'))

const hasPage = (slug: string) => activePages.value.some((page) => page.slug === slug)
const hasPaymentCard = computed(() => settings.value.paymentMethods?.some((method: any) => method.key === 'card' && method.enabled))
const hasPaymentConfig = computed(() => Boolean(
  settings.value.integrations.paymentProvider === 'stripe'
  && settings.value.integrations.paymentApiKey
  && settings.value.integrations.paymentSecret
  && settings.value.integrations.paymentCallbackUrl
))
const checks = computed(() => [
  {
    title: 'Brend və əlaqə',
    items: [
      { label: 'Sayt adı daxil edilib', ok: Boolean(settings.value.siteName), href: adminPath('settings') },
      { label: 'Logo əlavə olunub', ok: Boolean(settings.value.siteLogo), href: adminPath('settings') },
      { label: 'Telefon və email doldurulub', ok: Boolean(settings.value.sitePhone && settings.value.siteEmail), href: adminPath('settings') },
      { label: 'Ünvan daxil edilib', ok: Boolean(settings.value.address), href: adminPath('settings') }
    ]
  },
  {
    title: 'Satış və ödəniş',
    items: [
      { label: 'Kart ödənişi aktivdir', ok: Boolean(hasPaymentCard.value), href: adminPath('payments') },
      { label: 'Kart ödənişi API məlumatları daxil edilib', ok: Boolean(hasPaymentConfig.value), href: adminPath('payments') },
      { label: 'Çatdırılma məzmunu mövcuddur', ok: hasPage('delivery-info') || hasPage('shipping-policy'), href: adminPath('pages') },
      { label: 'Qaytarma siyasəti mövcuddur', ok: hasPage('returns-policy'), href: adminPath('pages') }
    ]
  },
  {
    title: 'Məzmun və dəstək',
    items: [
      { label: 'Contact səhifəsi aktivdir', ok: hasPage('contact'), href: adminPath('pages') },
      { label: 'Help center səhifəsi aktivdir', ok: hasPage('help-center'), href: adminPath('pages') },
      { label: 'Privacy/Terms səhifələri aktivdir', ok: hasPage('privacy-policy') && hasPage('terms'), href: adminPath('pages') },
      { label: 'Məhsul blokları doldurulub', ok: Boolean(settings.value.productInfoBlocks?.some((block: any) => block.enabled && ((block.detailRows?.length || 0) > 0 || (block.detailCards?.length || 0) > 0 || (block.detailNotes?.length || 0) > 0))), href: adminPath('product-info-blocks') }
    ]
  },
  {
    title: 'Launch təhlükəsizliyi',
    items: [
      { label: 'Admin giriş yolu fərdiləşdirilə bilir', ok: true, href: adminPath('settings') },
      { label: 'Admin giriş məlumatları dəyişdirilə bilir', ok: true, href: adminPath('settings') },
      { label: 'SEO title və description doldurulub', ok: Boolean(settings.value.seo?.title && settings.value.seo?.description), href: adminPath('settings') },
      { label: 'OG şəkil üçün logo mövcuddur', ok: Boolean(settings.value.siteLogo), href: adminPath('settings') },
      { label: 'Açılış animasiyası və popup idarə olunur', ok: true, href: adminPath('entry-experience') }
    ]
  }
])

const totals = computed(() => {
  const items = checks.value.flatMap((section) => section.items)
  const done = items.filter((item) => item.ok).length
  return {
    total: items.length,
    done,
    pending: items.length - done,
    percent: items.length ? Math.round((done / items.length) * 100) : 0
  }
})
</script>

<template>
  <div class="space-y-8">
    <div class="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.22em] text-blue-700">
            <ShieldCheck class="w-4 h-4" />
            Launch Checklist
          </div>
          <h1 class="mt-4 text-3xl font-extrabold text-gray-900">Yayıma çıxış yoxlama siyahısı</h1>
          <p class="mt-3 max-w-3xl text-sm font-medium text-gray-500">Saytı hər kəsə açmazdan əvvəl kritik sahələri buradan yoxlayın. Hər maddə sizi birbaşa uyğun admin səhifəsinə aparır.</p>
        </div>
        <div class="rounded-[1.8rem] bg-gray-50 border border-gray-100 px-6 py-5 min-w-[220px]">
          <div class="text-xs font-bold uppercase tracking-[0.24em] text-gray-400">Hazırlıq səviyyəsi</div>
          <div class="mt-3 text-4xl font-extrabold text-gray-900">{{ totals.percent }}%</div>
          <div class="mt-2 text-sm font-medium text-gray-500">{{ totals.done }} tamamlandı · {{ totals.pending }} qalıb</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div v-for="section in checks" :key="section.title" class="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
        <h2 class="text-xl font-extrabold text-gray-900">{{ section.title }}</h2>
        <div class="mt-5 space-y-3">
          <NuxtLink
            v-for="item in section.items"
            :key="item.label"
            :to="item.href"
            class="flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 transition-all"
            :class="item.ok ? 'border-emerald-100 bg-emerald-50/70' : 'border-amber-100 bg-amber-50/70'"
          >
            <div class="flex items-start gap-3">
              <component :is="item.ok ? CheckCircle2 : AlertTriangle" class="w-5 h-5 mt-0.5" :class="item.ok ? 'text-emerald-600' : 'text-amber-600'" />
              <div>
                <div class="text-sm font-extrabold text-gray-900">{{ item.label }}</div>
                <div class="mt-1 text-xs font-medium" :class="item.ok ? 'text-emerald-700' : 'text-amber-700'">
                  {{ item.ok ? 'Hazırdır' : 'Tamamlamaq lazımdır' }}
                </div>
              </div>
            </div>
            <ExternalLink class="w-4 h-4 text-gray-400" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
