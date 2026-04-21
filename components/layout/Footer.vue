<script setup lang="ts">
import { computed, ref } from 'vue'
import { 
  Facebook, 
  Youtube, 
  Instagram,
  MessageCircle,
  Phone,
  MapPin,
  Mail,
  ChevronUp
} from 'lucide-vue-next'
import { useSettingsStore } from '~/stores/settings'
import { useToastStore } from '~/stores/toast'

const settingsStore = useSettingsStore()
const { t, lang } = useT()
const toastStore = useToastStore()

const newsletterEmail = ref('')
const newsletterLoading = ref(false)

const newsletterTitle = computed(() => {
  const n: any = settingsStore.settings.newsletter
  return n?.title?.[lang.value] || n?.title?.az || ''
})
const newsletterSubtitle = computed(() => {
  const n: any = settingsStore.settings.newsletter
  return n?.subtitle?.[lang.value] || n?.subtitle?.az || ''
})
const newsletterPlaceholder = computed(() => {
  const n: any = settingsStore.settings.newsletter
  return n?.placeholder?.[lang.value] || n?.placeholder?.az || ''
})
const newsletterButton = computed(() => {
  const n: any = settingsStore.settings.newsletter
  return n?.button?.[lang.value] || n?.button?.az || ''
})

const subscribeNewsletter = async () => {
  const email = newsletterEmail.value.trim()
  if (!email) {
    toastStore.error('E-poçt daxil edin')
    return
  }
  if (!email.includes('@')) {
    toastStore.error('Düzgün e-poçt daxil edin')
    return
  }
  newsletterLoading.value = true
  try {
    await $fetch('/api/newsletter/subscribe', { method: 'POST', body: { email } })
    newsletterEmail.value = ''
    toastStore.success('Abunə olundu')
  } catch (e: any) {
    const msg = String(e?.data?.statusMessage || e?.statusMessage || e?.message || '')
    toastStore.error(msg || 'Abunəlik alınmadı')
  } finally {
    newsletterLoading.value = false
  }
}

const footerLinks = computed(() => {
  return (settingsStore.settings.footerLinkGroups || []).map((group: any) => ({
    key: String(group?.key || ''),
    title: group?.title?.[lang.value] || group?.title?.az || '',
    items: Array.isArray(group?.items)
      ? group.items.map((item: any) => ({
          label: item?.label?.[lang.value] || item?.label?.az || '',
          href: String(item?.href || '/')
        }))
      : []
  }))
})

const footerAboutText = computed(() => {
  const content: any = settingsStore.settings.footerContent
  return content?.aboutText?.[lang.value] || content?.aboutText?.az || ''
})

const footerCopyrightText = computed(() => {
  const content: any = settingsStore.settings.footerContent
  const template = content?.copyrightText?.[lang.value] || content?.copyrightText?.az || ''
  return String(template || '').replace(/\{\{\s*siteName\s*\}\}/g, settingsStore.settings.siteName || '')
})

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <footer class="bg-[color:var(--footer-bg,#030712)] pt-16 pb-8 border-t border-[color:var(--footer-border,#111827)] text-[color:var(--footer-text,#E5E7EB)]">
    <div class="container">
      <!-- Newsletter Section -->
      <div v-if="settingsStore.settings.newsletter?.enabled" class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 mb-16 flex flex-col lg:flex-row items-center justify-between text-white shadow-2xl shadow-blue-900/30 relative overflow-hidden">
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
        <div class="mb-6 lg:mb-0">
          <h3 class="text-2xl font-bold mb-2">{{ newsletterTitle }}</h3>
          <p class="text-blue-100">{{ newsletterSubtitle }}</p>
        </div>
        <form class="w-full lg:w-auto flex flex-col sm:flex-row gap-4" @submit.prevent="subscribeNewsletter">
          <input 
            v-model="newsletterEmail"
            type="email"
            :placeholder="newsletterPlaceholder"
            class="px-6 py-3 rounded-full text-gray-900 outline-none w-full sm:w-80 bg-white/95"
          />
          <button type="submit" class="bg-gray-950/90 hover:bg-black px-8 py-3 rounded-full font-bold transition-colors shadow-lg shadow-black/20" :disabled="newsletterLoading" :class="newsletterLoading ? 'opacity-60 cursor-not-allowed' : ''">
            {{ newsletterButton || t('subscribe') }}
          </button>
        </form>
      </div>

      <!-- Main Footer Links -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16">
        <div v-for="group in footerLinks" :key="group.key">
          <h4 class="font-bold text-[color:var(--footer-text,#E5E7EB)] mb-6 border-b border-[color:var(--footer-border,#111827)] pb-2">{{ group.title }}</h4>
          <ul class="space-y-4 text-sm text-[color:var(--footer-muted,#9CA3AF)]">
            <li v-for="item in group.items" :key="`${group.key}-${item.href}-${item.label}`">
              <NuxtLink :to="item.href" class="hover:text-white transition-colors">
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold text-[color:var(--footer-text,#E5E7EB)] mb-6">{{ t('footer_about_store') }}</h4>
          <p class="text-sm text-[color:var(--footer-muted,#9CA3AF)] mb-6 leading-relaxed">
            {{ footerAboutText }}
          </p>
          <div class="space-y-4 text-sm text-[color:var(--footer-muted,#9CA3AF)]">
            <div class="flex items-center">
              <Phone class="w-5 h-5 mr-3 text-blue-400" />
              <span>{{ settingsStore.settings.sitePhone }}</span>
            </div>
            <div class="flex items-start">
              <MapPin class="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />
              <span>{{ settingsStore.settings.address }}</span>
            </div>
            <div class="flex items-center">
              <Mail class="w-5 h-5 mr-3 text-blue-400" />
              <span>{{ settingsStore.settings.siteEmail }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-[color:var(--footer-border,#111827)] pt-8 flex flex-col xl:flex-row items-center xl:items-center justify-between gap-6">
        <div class="text-sm text-[color:var(--footer-muted,#9CA3AF)] text-center xl:text-left">
          {{ footerCopyrightText }}
        </div>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <div class="text-xs font-bold text-[color:var(--footer-muted,#9CA3AF)] uppercase tracking-widest mr-2">{{ t('follow_us') }}</div>
          <a :href="settingsStore.settings.socials.whatsapp" target="_blank" rel="noopener" class="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-green-500/20 hover:border-green-400/30 transition-all">
            <MessageCircle class="w-5 h-5 text-gray-200" />
          </a>
          <a :href="settingsStore.settings.socials.instagram" target="_blank" rel="noopener" class="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-pink-500/20 hover:border-pink-400/30 transition-all">
            <Instagram class="w-5 h-5 text-gray-200" />
          </a>
          <a :href="settingsStore.settings.socials.facebook" target="_blank" rel="noopener" class="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-400/30 transition-all">
            <Facebook class="w-5 h-5 text-gray-200" />
          </a>
          <a :href="settingsStore.settings.socials.youtube" target="_blank" rel="noopener" class="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-400/30 transition-all">
            <Youtube class="w-5 h-5 text-gray-200" />
          </a>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-2 opacity-85">
          <span class="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-extrabold tracking-[0.24em] text-gray-200 uppercase">Mastercard</span>
          <span class="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-extrabold tracking-[0.24em] text-gray-200 uppercase">PayPal</span>
          <span class="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-extrabold tracking-[0.24em] text-gray-200 uppercase">Visa</span>
        </div>
      </div>
    </div>

    <!-- Back to top button -->
    <button 
      @click="scrollToTop"
      class="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50 group"
    >
      <ChevronUp class="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
    </button>
  </footer>
</template>
