<script setup lang="ts">
import { ChevronDown, Clock3, Mail, MapPin, MessageCircle, Phone, Sparkles } from 'lucide-vue-next'
import { usePageStore } from '~/stores/pages'
import { useSettingsStore } from '~/stores/settings'

const pageStore = usePageStore()
const settingsStore = useSettingsStore()

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

const lang = computed(() => (settingsStore.settings.language === 'ru' || settingsStore.settings.language === 'en' ? settingsStore.settings.language : 'az'))
const page = computed(() => pageStore.pages.find(p => p.slug === 'contact' && p.status === 'Aktiv') || null)
const title = computed(() => page.value?.titleI18n?.[lang.value] || page.value?.title || 'Əlaqə')
const content = computed(() => page.value?.contentI18n?.[lang.value] || page.value?.content || '')
const activeFaqIndex = ref<number | null>(0)
const contactCards = computed(() => settingsStore.settings.contactPage.infoCards.filter((card) => card.enabled))
const contactFaqs = computed(() => settingsStore.settings.contactPage.faqs.filter((faq) => faq.enabled))
const contactHours = computed(() => settingsStore.settings.contactPage.businessHours)

const resolveContactValue = (key: 'address' | 'phone' | 'email' | 'whatsapp') => {
  if (key === 'address') return settingsStore.settings.address
  if (key === 'phone') return settingsStore.settings.sitePhone
  if (key === 'email') return settingsStore.settings.siteEmail
  return settingsStore.settings.socials.whatsapp || settingsStore.settings.contactPage.primaryCtaHref
}

const resolveContactDisplayValue = (key: 'address' | 'phone' | 'email' | 'whatsapp') => {
  if (key === 'whatsapp') return settingsStore.settings.sitePhone || settingsStore.settings.contactPage.whatsappLabel
  return resolveContactValue(key)
}

const resolveContactMeta = (key: 'address' | 'phone' | 'email' | 'whatsapp') => {
  if (key === 'address') return 'Ofis və görüş nöqtəsi'
  if (key === 'phone') return 'Birbaşa satış və dəstək xətti'
  if (key === 'email') return 'Sorğu və əməkdaşlıq üçün'
  return 'Sürətli mesaj dəstəyi'
}

const resolveContactHref = (key: 'address' | 'phone' | 'email' | 'whatsapp') => {
  if (key === 'phone') return `tel:${String(settingsStore.settings.sitePhone || '').replace(/\s+/g, '')}`
  if (key === 'email') return `mailto:${settingsStore.settings.siteEmail}`
  if (key === 'whatsapp') return settingsStore.settings.socials.whatsapp || settingsStore.settings.contactPage.primaryCtaHref
  return ''
}

const resolveContactIcon = (key: 'address' | 'phone' | 'email' | 'whatsapp') => {
  if (key === 'address') return MapPin
  if (key === 'phone') return Phone
  if (key === 'email') return Mail
  return MessageCircle
}

useSiteSeo({
  title,
  description: computed(() => (content.value || '').replace(/<[^>]+>/g, '').slice(0, 180)),
  image: computed(() => page.value?.heroBgImage || ''),
  path: '/contact'
})
</script>

<template>
  <div class="bg-gray-50/50 py-16 md:py-24">
    <div class="container">
      <div class="max-w-6xl mx-auto space-y-10">
        <div class="rounded-[2.5rem] border border-gray-100 bg-white p-7 shadow-sm md:p-10">
          <div class="grid gap-8 lg:grid-cols-[1.05fr,0.95fr] lg:items-start">
            <div class="max-w-2xl">
              <div class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-blue-700">
                <Sparkles class="h-3.5 w-3.5" /> {{ settingsStore.settings.contactPage.heroBadge }}
              </div>
              <h1 class="mt-5 text-4xl font-extrabold tracking-tight text-gray-900 md:text-[52px] md:leading-[1.02]">
                {{ settingsStore.settings.contactPage.heroTitle || title }}
              </h1>
              <p class="mt-5 max-w-xl whitespace-pre-line text-[15px] font-medium leading-8 text-gray-600 md:text-base">
                {{ settingsStore.settings.contactPage.heroSubtitle || content || 'Sualınız və ya təklifiniz var? Bizimlə əlaqə saxlaya bilərsiniz.' }}
              </p>
              <div class="mt-6 flex flex-wrap gap-3">
                <NuxtLink :to="settingsStore.settings.contactPage.primaryCtaHref || '/contact'" class="inline-flex items-center justify-center rounded-2xl bg-[color:var(--color-primary,#2B3E95)] px-6 py-3 text-sm font-extrabold text-white transition-all hover:brightness-110">
                  {{ settingsStore.settings.contactPage.primaryCtaLabel }}
                </NuxtLink>
                <NuxtLink :to="settingsStore.settings.contactPage.secondaryCtaHref || '/shop'" class="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-extrabold text-gray-700 transition-all hover:border-blue-200 hover:text-blue-700">
                  {{ settingsStore.settings.contactPage.secondaryCtaLabel }}
                </NuxtLink>
              </div>
            </div>

            <div class="grid gap-4">
              <component
                :is="resolveContactHref(card.key) ? 'a' : 'div'"
                v-for="card in contactCards"
                :key="card.key"
                :href="resolveContactHref(card.key) || undefined"
                class="h-full rounded-[1.75rem] border border-gray-100 bg-gray-50 px-5 py-5 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white"
              >
                <div class="flex h-full items-center gap-4">
                  <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <component :is="resolveContactIcon(card.key)" class="h-5 w-5" />
                  </div>
                  <div class="min-w-0 flex-1 md:flex md:items-center md:justify-between md:gap-6">
                    <div class="min-w-0">
                      <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">{{ card.label }}</div>
                      <div class="mt-2 text-[15px] font-extrabold leading-7 text-gray-900 md:text-[17px]">{{ resolveContactDisplayValue(card.key) }}</div>
                    </div>
                    <div class="mt-2 text-sm font-medium leading-6 text-gray-500 md:mt-0 md:max-w-[220px] md:text-right">
                      {{ card.description || resolveContactMeta(card.key) }}
                    </div>
                  </div>
                </div>
              </component>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr,0.85fr]">
          <div class="space-y-8">
            <div class="rounded-[2.5rem] border border-gray-100 bg-white p-10 shadow-sm md:p-12">
              <h2 class="text-2xl font-extrabold text-gray-900">Əlaqə məlumatı</h2>
              <div class="mt-5 text-gray-600 leading-relaxed font-medium whitespace-pre-line">
                {{ content || 'Sualınız və ya təklifiniz var? Bizimlə əlaqə saxlaya bilərsiniz.' }}
              </div>
            </div>

            <div v-if="settingsStore.settings.googleMapsEmbedUrl" class="rounded-[2.5rem] overflow-hidden border border-gray-100 bg-white shadow-sm">
              <iframe
                :src="settingsStore.settings.googleMapsEmbedUrl"
                class="h-[360px] w-full"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                allowfullscreen
              ></iframe>
            </div>
          </div>

          <div class="space-y-8">
            <div v-if="settingsStore.settings.contactPage.showBusinessHours" class="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm">
              <div class="flex items-center gap-3">
                <Clock3 class="h-5 w-5 text-blue-600" />
                <h2 class="text-xl font-extrabold text-gray-900">İş saatları</h2>
              </div>
              <div class="mt-5 space-y-3">
                <div v-for="(row, idx) in contactHours" :key="`hour-${idx}`" class="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <span class="text-sm font-extrabold text-gray-800">{{ row.day }}</span>
                  <span class="text-sm font-medium text-gray-500">{{ row.hours }}</span>
                </div>
              </div>
            </div>

            <div v-if="settingsStore.settings.contactPage.showSocials" class="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm">
              <div class="flex items-center gap-3">
                <MessageCircle class="h-5 w-5 text-blue-600" />
                <h2 class="text-xl font-extrabold text-gray-900">{{ settingsStore.settings.contactPage.whatsappLabel }}</h2>
              </div>
              <div class="mt-5 grid grid-cols-2 gap-3">
                <a v-if="settingsStore.settings.socials.whatsapp" :href="settingsStore.settings.socials.whatsapp" target="_blank" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-center text-sm font-extrabold text-gray-800 hover:border-blue-200 hover:text-blue-700">WhatsApp</a>
                <a v-if="settingsStore.settings.socials.instagram" :href="settingsStore.settings.socials.instagram" target="_blank" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-center text-sm font-extrabold text-gray-800 hover:border-blue-200 hover:text-blue-700">Instagram</a>
                <a v-if="settingsStore.settings.socials.facebook" :href="settingsStore.settings.socials.facebook" target="_blank" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-center text-sm font-extrabold text-gray-800 hover:border-blue-200 hover:text-blue-700">Facebook</a>
                <a v-if="settingsStore.settings.socials.youtube" :href="settingsStore.settings.socials.youtube" target="_blank" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-center text-sm font-extrabold text-gray-800 hover:border-blue-200 hover:text-blue-700">YouTube</a>
              </div>
            </div>
          </div>
        </div>

        <div v-if="settingsStore.settings.contactPage.showFaq && contactFaqs.length" class="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm md:p-10">
          <div class="mb-6">
            <div class="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-600">FAQ</div>
            <h2 class="mt-2 text-2xl font-extrabold text-gray-900">Ən çox verilən suallar</h2>
          </div>
          <div class="space-y-3">
            <button
              v-for="(faq, idx) in contactFaqs"
              :key="`faq-item-${idx}`"
              type="button"
              class="w-full rounded-[1.75rem] border border-gray-100 bg-gray-50 px-5 py-4 text-left transition-all hover:border-blue-200 hover:bg-white"
              @click="activeFaqIndex = activeFaqIndex === idx ? null : idx"
            >
              <div class="flex items-center justify-between gap-4">
                <div class="text-sm font-extrabold text-gray-900">{{ faq.question }}</div>
                <ChevronDown class="h-4 w-4 text-gray-400 transition-transform" :class="activeFaqIndex === idx ? 'rotate-180' : ''" />
              </div>
              <div v-if="activeFaqIndex === idx" class="mt-3 text-sm font-medium leading-7 text-gray-600">
                {{ faq.answer }}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
