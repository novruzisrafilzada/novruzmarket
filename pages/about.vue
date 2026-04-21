<script setup lang="ts">
import { computed } from 'vue'
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

const page = computed(() => pageStore.pages.find(p => p.slug === 'about' && p.status === 'Aktiv') || null)
const lang = computed(() => (settingsStore.settings.language === 'ru' || settingsStore.settings.language === 'en' ? settingsStore.settings.language : 'az'))
const title = computed(() => page.value?.titleI18n?.[lang.value] || page.value?.title || 'Haqqımızda')
const content = computed(() => page.value?.contentI18n?.[lang.value] || page.value?.content || '')
const heroBg = computed(() => String(page.value?.heroBgImage || '').trim())

useSiteSeo({
  title,
  description: computed(() => (content.value || '').replace(/<[^>]+>/g, '').slice(0, 180)),
  image: heroBg,
  path: '/about'
})
</script>

<template>
  <div>
    <section class="relative overflow-hidden">
      <div class="absolute inset-0" :style="heroBg ? { backgroundImage: `url(${heroBg})` } : undefined" :class="heroBg ? 'bg-center bg-cover' : 'bg-[color:var(--color-primary,#2B3E95)]'"></div>
      <div class="absolute inset-0 bg-black/55"></div>
      <div class="container relative py-16 sm:py-20 lg:py-24">
        <div class="max-w-3xl mx-auto text-center text-white">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">{{ title }}</h1>
          <p class="mt-5 text-sm sm:text-base text-white/80 font-medium">
            {{ (content || '').replace(/<[^>]+>/g, '').slice(0, 140) }}
          </p>
          <div class="mt-8 flex items-center justify-center gap-3">
            <NuxtLink to="/shop" class="px-8 py-3.5 rounded-2xl bg-[color:var(--color-accent,#FACC15)] text-gray-900 font-extrabold text-sm hover:brightness-95 transition-all">
              Mağazaya keç
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <div class="container py-12">
      <div class="max-w-5xl mx-auto bg-[var(--theme-surface,#FFFFFF)] border border-[var(--theme-border,#E5E7EB)] rounded-[2.5rem] p-8 sm:p-10 md:p-12 shadow-sm text-[var(--theme-text,#0F172A)]">
        <div class="prose max-w-none" v-html="content || 'Duka Market haqqında ətraflı məlumat...'"></div>
      </div>
    </div>
  </div>
</template>
