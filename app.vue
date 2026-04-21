<script setup lang="ts">
import { Bell, Gem, ShoppingBag, Sparkles, Star, X } from 'lucide-vue-next'

const settingsStore = useSettingsStore()
const route = useRoute()
const { lang } = useT()
const { initThemeMode } = useThemeMode()
const showWelcomeNotice = ref(false)
const showCookieConsent = ref(false)
const splashFailsafeMs = 2200
const splashInProgressKey = 'markett-splash-in-progress'
const splashSeenKey = 'markett-splash-seen'
const splashBypassKey = 'markett-splash-bypass'
const chunkRecoveryKey = 'markett-chunk-recovery'

const entryExperience = computed(() => settingsStore.settings.entryExperience)
const iconMap = {
  Sparkles,
  Bell,
  Star,
  Gem,
  ShoppingBag
} as const
const entryIcon = computed(() => iconMap[entryExperience.value?.icon || 'Sparkles'] || Sparkles)
const splashTitle = computed(() => entryExperience.value?.splashTitle?.[lang.value as 'az' | 'ru' | 'en'] || entryExperience.value?.splashTitle?.az || 'novruzmarket')
const splashSubtitle = computed(() => entryExperience.value?.splashSubtitle?.[lang.value as 'az' | 'ru' | 'en'] || entryExperience.value?.splashSubtitle?.az || '')
const popupBadge = computed(() => entryExperience.value?.popupBadge?.[lang.value as 'az' | 'ru' | 'en'] || entryExperience.value?.popupBadge?.az || '')
const popupTitle = computed(() => entryExperience.value?.popupTitle?.[lang.value as 'az' | 'ru' | 'en'] || entryExperience.value?.popupTitle?.az || '')
const popupSubtitle = computed(() => entryExperience.value?.popupSubtitle?.[lang.value as 'az' | 'ru' | 'en'] || entryExperience.value?.popupSubtitle?.az || '')
const primaryActionLabel = computed(() => entryExperience.value?.primaryActionLabel?.[lang.value as 'az' | 'ru' | 'en'] || entryExperience.value?.primaryActionLabel?.az || '')
const secondaryActionLabel = computed(() => entryExperience.value?.secondaryActionLabel?.[lang.value as 'az' | 'ru' | 'en'] || entryExperience.value?.secondaryActionLabel?.az || '')
const siteBrand = computed(() => String(settingsStore.settings.siteName || 'Novruzmarket').trim() || 'Novruzmarket')
const customCode = computed(() => settingsStore.settings.customCode || { customCss: '', headScript: '', bodyEndScript: '' })
const lazyRecentSalesPopupName = 'LazyRecentSalesPopup'
const { quickViewProductId } = useQuickView()
useSiteSeo()
const entrySurfaceStyle = computed(() => ({
  '--entry-gradient-from': entryExperience.value?.gradientFrom || '#2B3E95',
  '--entry-gradient-via': entryExperience.value?.gradientVia || '#3147A8',
  '--entry-gradient-to': entryExperience.value?.gradientTo || '#3C59D6',
  '--entry-accent': entryExperience.value?.accentColor || '#FACC15'
}))

if (!settingsStore.hydrated || !settingsStore.settings.siteName) {
  try {
    await Promise.race([
      settingsStore.fetchSettings(),
      new Promise((resolve) => setTimeout(resolve, 1200))
    ])
  } catch {
  }
}

const showSplash = ref(false)
const splashFinished = ref(true)
let splashPrimaryTimer: ReturnType<typeof setTimeout> | null = null
let splashFailsafeTimer: ReturnType<typeof setTimeout> | null = null
let splashErrorHandlerBound = false
const minSplashDurationMs = 1600
const resolvedSplashDuration = computed(() => Math.max(minSplashDurationMs, Math.min(4000, Number(entryExperience.value?.maxDurationMs || 950))))
const shouldShowWelcomePopup = computed(() => {
  const path = String(route.path || '').toLowerCase()
  if (!path) return true
  return !(
    path.startsWith('/admin') ||
    path.startsWith('/shop') ||
    path.startsWith('/product') ||
    path.startsWith('/cart') ||
    path.startsWith('/checkout') ||
    path.startsWith('/wishlist') ||
    path.startsWith('/compare')
  )
})

useHead(() => ({
  style: customCode.value.customCss.trim()
    ? [
        {
          key: 'admin-custom-css',
          children: customCode.value.customCss
        }
      ]
    : [],
  script: [
    ...(customCode.value.headScript.trim()
      ? [
          {
            key: 'admin-head-script',
            innerHTML: customCode.value.headScript
          }
        ]
      : []),
    ...(customCode.value.bodyEndScript.trim()
      ? [
          {
            key: 'admin-body-script',
            innerHTML: customCode.value.bodyEndScript,
            tagPosition: 'bodyClose' as const
          }
        ]
      : [])
  ]
}))

const clearSplashTimers = () => {
  if (splashPrimaryTimer) {
    clearTimeout(splashPrimaryTimer)
    splashPrimaryTimer = null
  }
  if (splashFailsafeTimer) {
    clearTimeout(splashFailsafeTimer)
    splashFailsafeTimer = null
  }
}

const finishSplash = (markBypass = false) => {
  clearSplashTimers()
  showSplash.value = false
  splashFinished.value = true
  if (process.client) {
    try {
      sessionStorage.removeItem(splashInProgressKey)
      sessionStorage.setItem(splashSeenKey, '1')
      if (markBypass) sessionStorage.setItem(splashBypassKey, '1')
    } catch {
    }
  }
}

const handleSplashSafeMode = () => {
  if (!entryExperience.value?.safeModeEnabled) return
  finishSplash(true)
}

const isChunkLoadError = (message: string) =>
  /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk .* failed|Failed to fetch module/i.test(message)

const recoverFromChunkError = (message: string) => {
  if (!process.client || !isChunkLoadError(message)) return
  try {
    if (sessionStorage.getItem(chunkRecoveryKey) === '1') return
    sessionStorage.setItem(chunkRecoveryKey, '1')
  } catch {
    return
  }
  const nextUrl = new URL(window.location.href)
  nextUrl.searchParams.set('_chunk_recover', String(Date.now()))
  window.location.replace(nextUrl.toString())
}

const handleChunkWindowError = (event: ErrorEvent) => recoverFromChunkError(event.message || '')
const handleChunkRejection = (event: PromiseRejectionEvent) => recoverFromChunkError(String(event.reason?.message || event.reason || ''))

const shouldRunSplash = () => {
  if (!process.client) return false
  if (!entryExperience.value?.splashEnabled) return false
  try {
    const inProgress = sessionStorage.getItem(splashInProgressKey) === '1'
    const seenInSession = sessionStorage.getItem(splashSeenKey) === '1'
    const bypass = sessionStorage.getItem(splashBypassKey) === '1'
    if (entryExperience.value?.safeModeEnabled && (inProgress || bypass)) return false
    if (entryExperience.value?.showOncePerSession && seenInSession) return false
  } catch {
  }
  return true
}

const startSplash = () => {
  if (!process.client) return
  if (!shouldRunSplash()) {
    finishSplash()
    return
  }
  try {
    sessionStorage.setItem(splashInProgressKey, '1')
  } catch {
  }
  const duration = resolvedSplashDuration.value
  splashFinished.value = false
  showSplash.value = true
  splashPrimaryTimer = window.setTimeout(() => {
    finishSplash()
  }, duration)
  splashFailsafeTimer = window.setTimeout(() => {
    finishSplash(true)
  }, Math.max(duration + 600, splashFailsafeMs))
}

onMounted(() => {
  startSplash()

  if (entryExperience.value?.safeModeEnabled && !splashErrorHandlerBound) {
    window.addEventListener('error', handleSplashSafeMode)
    window.addEventListener('unhandledrejection', handleSplashSafeMode)
    splashErrorHandlerBound = true
  }
  window.addEventListener('error', handleChunkWindowError)
  window.addEventListener('unhandledrejection', handleChunkRejection)
  try {
    if (!window.location.search.includes('_chunk_recover')) sessionStorage.removeItem(chunkRecoveryKey)
  } catch {
  }

  const noticeSeen = sessionStorage.getItem('welcomeNoticeSeen')
  if (entryExperience.value?.popupEnabled && shouldShowWelcomePopup.value && !noticeSeen) {
    window.setTimeout(() => {
      showWelcomeNotice.value = true
      sessionStorage.setItem('welcomeNoticeSeen', '1')
    }, entryExperience.value?.splashEnabled ? resolvedSplashDuration.value + 120 : 250)
  }
  try {
    showCookieConsent.value = localStorage.getItem('markett-cookie-consent') !== 'accepted'
  } catch {
  }
  initThemeMode(Boolean(settingsStore.settings.creativeSuite?.darkModeEnabled))
  document.documentElement.dataset.seasonalTheme = String(settingsStore.settings.creativeSuite?.seasonalTheme || 'none')
})

onUnmounted(() => {
  clearSplashTimers()
  if (process.client && splashErrorHandlerBound) {
    window.removeEventListener('error', handleSplashSafeMode)
    window.removeEventListener('unhandledrejection', handleSplashSafeMode)
    splashErrorHandlerBound = false
  }
  if (process.client) {
    window.removeEventListener('error', handleChunkWindowError)
    window.removeEventListener('unhandledrejection', handleChunkRejection)
  }
})

watch(
  () => entryExperience.value?.splashEnabled,
  (enabled) => {
    if (!enabled) finishSplash()
  }
)

watch(
  () => settingsStore.settings.creativeSuite?.seasonalTheme,
  (value) => {
    if (process.client) {
      document.documentElement.dataset.seasonalTheme = String(value || 'none')
    }
  }
)

watch(
  () => settingsStore.settings.creativeSuite?.darkModeEnabled,
  (enabled) => {
    if (process.client) {
      initThemeMode(Boolean(enabled))
    }
  }
)

const acceptCookieConsent = () => {
  showCookieConsent.value = false
  if (process.client) {
    localStorage.setItem('markett-cookie-consent', 'accepted')
  }
}
</script>

<template>
  <div class="theme-app min-h-screen transition-colors duration-300">
    <div>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </div>
    <ProductQuickViewModal v-model="quickViewProductId" />
    <UiToastHost />
    <component :is="lazyRecentSalesPopupName" />
    <transition name="site-splash">
      <div v-if="showSplash" class="fixed inset-0 z-[120] text-white flex items-center justify-center overflow-hidden entry-splash-bg" :style="entrySurfaceStyle">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_32%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.12),transparent_28%)]"></div>
        <div class="absolute -top-20 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-white/10 blur-3xl entry-orb-spin"></div>
        <div class="relative text-center px-6">
          <div class="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-white/10 border border-white/15 shadow-2xl shadow-black/10 entry-logo-shell">
            <component :is="entryIcon" class="w-10 h-10 text-[color:var(--entry-accent)] entry-logo-icon" />
          </div>
          <div class="mt-6 text-3xl sm:text-4xl font-extrabold tracking-tight entry-copy entry-copy-delay-1">{{ splashTitle }}</div>
          <div class="mt-2 text-white/75 font-medium text-sm sm:text-base entry-copy entry-copy-delay-2">{{ splashSubtitle }}</div>
        </div>
      </div>
    </transition>
    <transition name="notice-pop">
      <div v-if="showWelcomeNotice" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]" @click="showWelcomeNotice = false"></div>
        <div class="relative z-10 w-full max-w-xl rounded-[2.25rem] bg-white shadow-2xl shadow-blue-900/15 overflow-hidden entry-popup-shell" :style="entrySurfaceStyle">
          <div class="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(135deg,var(--entry-gradient-from),var(--entry-gradient-via),var(--entry-gradient-to))] opacity-95"></div>
          <button type="button" class="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition-all text-gray-500 z-10" @click="showWelcomeNotice = false">
            <X class="w-5 h-5" />
          </button>
          <div class="relative px-6 sm:px-8 pt-8 pb-6 text-center">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 text-[11px] font-extrabold uppercase tracking-[0.22em] shadow-sm entry-copy entry-copy-delay-1" :style="{ color: entryExperience?.gradientFrom || '#2B3E95' }">
              <component :is="entryIcon" class="w-4 h-4" />
              {{ popupBadge }}
            </div>
            <div class="mt-5 text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight entry-copy entry-copy-delay-2">{{ popupTitle }}</div>
            <div class="mt-3 text-sm sm:text-base font-medium text-gray-500 max-w-lg mx-auto entry-copy entry-copy-delay-3">{{ popupSubtitle }}</div>
          </div>
          <div class="relative px-6 sm:px-8 pb-8">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NuxtLink :to="entryExperience?.primaryActionHref || '/shop'" class="group rounded-[1.9rem] border border-gray-100 bg-gradient-to-b from-white to-gray-50 hover:border-blue-200 hover:bg-blue-50/50 p-5 text-center transition-all entry-copy entry-copy-delay-4" @click="showWelcomeNotice = false">
                <div class="w-20 h-20 mx-auto rounded-[1.75rem] bg-white border border-gray-100 flex items-center justify-center shadow-sm" :style="{ color: entryExperience?.accentColor || '#FACC15' }">
                  <ShoppingBag class="w-9 h-9" />
                </div>
                <div class="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-gray-400">{{ siteBrand }}</div>
                <div class="mt-4 inline-flex items-center justify-center min-w-[150px] h-11 rounded-xl font-extrabold px-6" :style="{ backgroundColor: entryExperience?.accentColor || '#FACC15', color: entryExperience?.gradientFrom || '#2B3E95' }">
                  {{ primaryActionLabel }}
                </div>
              </NuxtLink>
              <NuxtLink :to="entryExperience?.secondaryActionHref || '/shop'" class="group rounded-[1.9rem] border border-gray-100 bg-gradient-to-b from-white to-gray-50 hover:border-blue-200 hover:bg-blue-50/50 p-5 text-center transition-all entry-copy entry-copy-delay-5" @click="showWelcomeNotice = false">
                <div class="w-20 h-20 mx-auto rounded-[1.75rem] bg-white border border-gray-100 flex items-center justify-center shadow-sm" :style="{ color: entryExperience?.accentColor || '#FACC15' }">
                  <Sparkles class="w-9 h-9" />
                </div>
                <div class="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-gray-400">{{ siteBrand }}</div>
                <div class="mt-4 inline-flex items-center justify-center min-w-[150px] h-11 rounded-xl font-extrabold px-6" :style="{ backgroundColor: entryExperience?.accentColor || '#FACC15', color: entryExperience?.gradientFrom || '#2B3E95' }">
                  {{ secondaryActionLabel }}
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <div v-if="showCookieConsent" class="fixed inset-x-4 bottom-4 z-[105] mx-auto max-w-3xl rounded-[2rem] border border-gray-200 bg-white/95 px-6 py-5 shadow-2xl backdrop-blur">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div class="text-sm font-extrabold text-gray-900">Cookie razılığı</div>
          <div class="mt-1 text-sm font-medium text-gray-500">Sayt performansı, səbət yaddaşı və daha uyğun tövsiyələr üçün cookie istifadə olunur.</div>
        </div>
        <button type="button" class="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all" @click="acceptCookieConsent">
          Qəbul et
        </button>
      </div>
    </div>
  </div>
</template>

<style>
:root[data-seasonal-theme='spring'] body { background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 35%); }
:root[data-seasonal-theme='summer'] body { background: linear-gradient(180deg, #fff7ed 0%, #ffffff 35%); }
:root[data-seasonal-theme='autumn'] body { background: linear-gradient(180deg, #fff7ed 0%, #ffffff 35%); }
:root[data-seasonal-theme='winter'] body { background: linear-gradient(180deg, #eff6ff 0%, #ffffff 35%); }
.theme-app {
  background: var(--theme-bg, var(--app-bg, #ffffff));
  color: var(--theme-text, var(--app-text, #1f2937));
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.site-splash-enter-active,
.site-splash-leave-active {
  transition: opacity .45s ease, transform .45s ease;
}

.site-splash-enter-from,
.site-splash-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

.notice-pop-enter-active,
.notice-pop-leave-active {
  transition: opacity .3s ease, transform .3s ease;
}

.notice-pop-enter-from,
.notice-pop-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.entry-splash-bg {
  background: linear-gradient(135deg, var(--entry-gradient-from), var(--entry-gradient-via), var(--entry-gradient-to));
}

.entry-popup-shell::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at top right, rgba(255,255,255,0.22), transparent 26%);
}

.entry-logo-shell {
  animation: entry-logo-shell-float .95s ease both;
  backdrop-filter: blur(14px);
}

.entry-logo-icon {
  animation: entry-logo-rotate .95s cubic-bezier(.22,1,.36,1) both;
  filter: drop-shadow(0 14px 24px rgba(0,0,0,.18));
}

.entry-copy {
  opacity: 0;
  filter: blur(12px);
  transform: translateY(14px);
  animation: entry-copy-rise .7s cubic-bezier(.22,1,.36,1) forwards;
}

.entry-copy-delay-1 { animation-delay: .08s; }
.entry-copy-delay-2 { animation-delay: .18s; }
.entry-copy-delay-3 { animation-delay: .28s; }
.entry-copy-delay-4 { animation-delay: .38s; }
.entry-copy-delay-5 { animation-delay: .48s; }

.entry-orb-spin {
  animation: entry-orb-spin 8s linear infinite;
}

@keyframes entry-logo-rotate {
  0% {
    opacity: 0;
    transform: scale(.72) rotate(-24deg);
    filter: blur(14px);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
    filter: blur(0);
  }
}

@keyframes entry-logo-shell-float {
  0% {
    opacity: 0;
    transform: translateY(18px) scale(.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes entry-copy-rise {
  0% {
    opacity: 0;
    filter: blur(12px);
    transform: translateY(14px);
  }
  100% {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0);
  }
}

@keyframes entry-orb-spin {
  0% { transform: translateX(-50%) rotate(0deg); }
  100% { transform: translateX(-50%) rotate(360deg); }
}
</style>
