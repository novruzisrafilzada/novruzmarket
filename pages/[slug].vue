<script setup lang="ts">
import { usePageStore } from '~/stores/pages'
import { useSettingsStore } from '~/stores/settings'

const pageStore = usePageStore()
const settingsStore = useSettingsStore()
const route = useRoute()

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
const page = computed(() => {
  const slug = String(route.params.slug || '')
  return pageStore.pages.find(p => p.slug === slug && p.status === 'Aktiv') || null
})
const title = computed(() => page.value?.titleI18n?.[lang.value] || page.value?.title || '')
const content = computed(() => page.value?.contentI18n?.[lang.value] || page.value?.content || '')
const sections = computed(() =>
  Array.isArray(page.value?.sections)
    ? page.value.sections
        .map((section: any) => ({
          title: section?.titleI18n?.[lang.value] || section?.titleI18n?.az || '',
          content: section?.contentI18n?.[lang.value] || section?.contentI18n?.az || ''
        }))
        .filter((section: any) => section.title || section.content)
    : []
)
const faqs = computed(() =>
  Array.isArray(page.value?.faqs)
    ? page.value.faqs
        .map((faq: any) => ({
          id: `${page.value?.slug || 'page'}-${faq?.questionI18n?.az || ''}`,
          question: faq?.questionI18n?.[lang.value] || faq?.questionI18n?.az || '',
          answer: faq?.answerI18n?.[lang.value] || faq?.answerI18n?.az || ''
        }))
        .filter((faq: any) => faq.question || faq.answer)
    : []
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Səhifə tapılmadı' })
}

useSiteSeo({
  title: computed(() => title.value || 'Səhifə'),
  description: computed(() => content.value || ''),
  image: computed(() => page.value?.heroBgImage || ''),
  path: computed(() => route.fullPath)
})
</script>

<template>
  <div class="bg-gray-50/50 py-16 md:py-24">
    <div class="container">
      <div v-if="!page" class="max-w-4xl mx-auto bg-white border border-gray-100 rounded-[2.5rem] p-16 text-center shadow-sm">
        <p class="text-gray-500 font-bold uppercase tracking-widest text-sm">Səhifə tapılmadı</p>
      </div>

      <div v-else-if="page.pageLayout === 'faq' && faqs.length" class="space-y-8">
        <div class="max-w-4xl mx-auto bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div
            class="px-10 md:px-14 py-12 md:py-16"
            :class="page.heroBgImage ? 'text-white bg-center bg-cover bg-no-repeat relative' : 'bg-white'"
            :style="page.heroBgImage ? { backgroundImage: `linear-gradient(rgba(15,23,42,.65), rgba(15,23,42,.65)), url(${page.heroBgImage})` } : undefined"
          >
            <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-center">{{ title }}</h1>
            <div v-if="content" class="mt-5 text-center text-gray-600 font-medium whitespace-pre-line" :class="page.heroBgImage ? 'text-white/90' : ''">
              {{ content }}
            </div>
          </div>
        </div>
        <FaqAccordionBlock :items="faqs" />
        <div v-if="sections.length" class="max-w-4xl mx-auto space-y-6">
          <section v-for="(section, index) in sections" :key="index" class="rounded-[1.75rem] bg-white border border-gray-100 p-6 shadow-sm">
            <h2 v-if="section.title" class="text-xl font-extrabold text-gray-900">{{ section.title }}</h2>
            <div v-if="section.content" class="mt-3 text-gray-700 leading-8 whitespace-pre-line font-medium">{{ section.content }}</div>
          </section>
        </div>
      </div>

      <div v-else class="max-w-5xl mx-auto bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div
          class="px-10 md:px-14 py-12 md:py-16"
          :class="page.heroBgImage ? 'text-white bg-center bg-cover bg-no-repeat relative' : 'bg-white'"
          :style="page.heroBgImage ? { backgroundImage: `linear-gradient(rgba(15,23,42,.65), rgba(15,23,42,.65)), url(${page.heroBgImage})` } : undefined"
        >
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight">{{ title }}</h1>
        </div>
        <div class="p-10 md:p-14">
          <div class="text-gray-600 leading-8 font-medium whitespace-pre-line">
            {{ content }}
          </div>
          <div v-if="sections.length" class="mt-10 space-y-6">
            <section v-for="(section, index) in sections" :key="index" class="rounded-[1.75rem] bg-gray-50 border border-gray-100 p-6">
              <h2 v-if="section.title" class="text-xl font-extrabold text-gray-900">{{ section.title }}</h2>
              <div v-if="section.content" class="mt-3 text-gray-700 leading-8 whitespace-pre-line font-medium">{{ section.content }}</div>
            </section>
          </div>
          <div v-if="faqs.length" class="mt-10">
            <FaqAccordionBlock :items="faqs" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
