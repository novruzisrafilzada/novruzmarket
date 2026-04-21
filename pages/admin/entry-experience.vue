<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Bell, Eye, Gem, Play, Save, ShoppingBag, Sparkles, Star, User, X } from 'lucide-vue-next'
import { useSettingsStore } from '~/stores/settings'
import { useToastStore } from '~/stores/toast'

definePageMeta({ layout: 'admin' })

const settingsStore = useSettingsStore()
const toastStore = useToastStore()
const { settings } = storeToRefs(settingsStore)

const previewSplash = ref(false)
const previewPopup = ref(false)
const iconOptions = [
  { label: 'Sparkles', value: 'Sparkles', icon: Sparkles },
  { label: 'Bell', value: 'Bell', icon: Bell },
  { label: 'Star', value: 'Star', icon: Star },
  { label: 'Gem', value: 'Gem', icon: Gem },
  { label: 'ShoppingBag', value: 'ShoppingBag', icon: ShoppingBag }
] as const
const iconMap = {
  Sparkles,
  Bell,
  Star,
  Gem,
  ShoppingBag
} as const

onMounted(async () => {
  if (!settingsStore.hydrated || !settingsStore.settings.siteName) {
    await settingsStore.fetchSettings()
  }
})

const previewIcon = computed(() => iconMap[settings.value.entryExperience.icon || 'Sparkles'] || Sparkles)
const primaryPreviewLabel = computed(() => settings.value.entryExperience.primaryActionLabel.az || 'Kəşf et')
const secondaryPreviewLabel = computed(() => settings.value.entryExperience.secondaryActionLabel.az || 'Bax')
const previewBadge = computed(() => settings.value.entryExperience.popupBadge.az || 'Yeni bildiriş')
const previewSplashTitle = computed(() => settings.value.entryExperience.splashTitle.az || 'novruzmarket')
const previewSplashSubtitle = computed(() => settings.value.entryExperience.splashSubtitle.az || 'Yeni vitrin yüklənir...')
const entrySurfaceStyle = computed(() => ({
  '--entry-gradient-from': settings.value.entryExperience.gradientFrom || '#2B3E95',
  '--entry-gradient-via': settings.value.entryExperience.gradientVia || '#3147A8',
  '--entry-gradient-to': settings.value.entryExperience.gradientTo || '#3C59D6',
  '--entry-accent': settings.value.entryExperience.accentColor || '#FACC15'
}))

const showSplashPreview = () => {
  previewSplash.value = true
  window.setTimeout(() => {
    previewSplash.value = false
  }, 950)
}

const showPopupPreview = () => {
  previewPopup.value = true
}

const saveSettings = async () => {
  try {
    await settingsStore.saveSettings()
    toastStore.success('Açılış animasiyası ayarları yadda saxlanıldı')
  } catch {
    toastStore.error('Ayarlar yadda saxlanılmadı')
  }
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Açılış Animasiya Paneli</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Splash və açılış popup-ını həm idarə et, həm də admin paneldən birbaşa önizləmədə gör.</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <button @click="showSplashPreview" class="px-6 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 text-sm font-bold hover:border-blue-200 hover:text-blue-600 transition-all flex items-center gap-2">
          <Play class="w-4 h-4" />
          Splash önizlə
        </button>
        <button @click="showPopupPreview" class="px-6 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 text-sm font-bold hover:border-blue-200 hover:text-blue-600 transition-all flex items-center gap-2">
          <Eye class="w-4 h-4" />
          Popup önizlə
        </button>
        <button @click="saveSettings" class="px-6 py-3 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
          <Save class="w-4 h-4" />
          Yadda saxla
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 2xl:grid-cols-[1.1fr,0.9fr] gap-8">
      <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-6">
        <div class="flex items-center gap-3">
          <Sparkles class="w-6 h-6 text-blue-600" />
          <div>
            <div class="text-xl font-bold text-gray-900">Açılış davranışı</div>
            <div class="text-sm font-medium text-gray-500 mt-1">Sayt ilk açılarkən nə göstəriləcəyini buradan idarə et.</div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4">
            <div>
              <div class="text-sm font-bold text-gray-900">Açılış splash animasiyası</div>
              <div class="text-xs font-medium text-gray-500 mt-1">Sayt açılarkən qısa brand animasiyası göstərilir.</div>
            </div>
            <input v-model="settings.entryExperience.splashEnabled" type="checkbox" class="w-5 h-5" />
          </label>
          <label class="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4">
            <div>
              <div class="text-sm font-bold text-gray-900">Splash safe mode</div>
              <div class="text-xs font-medium text-gray-500 mt-1">Problem aşkarlansa splash avtomatik bypass olunur.</div>
            </div>
            <input v-model="settings.entryExperience.safeModeEnabled" type="checkbox" class="w-5 h-5" />
          </label>
          <label class="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4">
            <div>
              <div class="text-sm font-bold text-gray-900">Açılış popup bildirişi</div>
              <div class="text-xs font-medium text-gray-500 mt-1">Splash-dən sonra kampaniya və ya yönləndirmə popup-ı çıxır.</div>
            </div>
            <input v-model="settings.entryExperience.popupEnabled" type="checkbox" class="w-5 h-5" />
          </label>
          <label class="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4">
            <div>
              <div class="text-sm font-bold text-gray-900">Bir sessiyada bir dəfə</div>
              <div class="text-xs font-medium text-gray-500 mt-1">Eyni tab daxilində splash təkrar göstərilmir.</div>
            </div>
            <input v-model="settings.entryExperience.showOncePerSession" type="checkbox" class="w-5 h-5" />
          </label>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input v-model.number="settings.entryExperience.maxDurationMs" type="number" min="300" max="4000" step="50" placeholder="Splash duration ms" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input v-model="settings.entryExperience.splashTitle.az" type="text" placeholder="Splash başlıq (AZ)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
          <input v-model="settings.entryExperience.splashTitle.ru" type="text" placeholder="Splash başlıq (RU)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
          <input v-model="settings.entryExperience.splashTitle.en" type="text" placeholder="Splash başlıq (EN)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <textarea v-model="settings.entryExperience.splashSubtitle.az" rows="3" placeholder="Splash alt mətn (AZ)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"></textarea>
          <textarea v-model="settings.entryExperience.splashSubtitle.ru" rows="3" placeholder="Splash alt mətn (RU)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"></textarea>
          <textarea v-model="settings.entryExperience.splashSubtitle.en" rows="3" placeholder="Splash alt mətn (EN)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input v-model="settings.entryExperience.popupBadge.az" type="text" placeholder="Popup badge (AZ)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
          <input v-model="settings.entryExperience.popupBadge.ru" type="text" placeholder="Popup badge (RU)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
          <input v-model="settings.entryExperience.popupBadge.en" type="text" placeholder="Popup badge (EN)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input v-model="settings.entryExperience.popupTitle.az" type="text" placeholder="Başlıq (AZ)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
          <input v-model="settings.entryExperience.popupTitle.ru" type="text" placeholder="Başlıq (RU)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
          <input v-model="settings.entryExperience.popupTitle.en" type="text" placeholder="Başlıq (EN)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <textarea v-model="settings.entryExperience.popupSubtitle.az" rows="3" placeholder="Alt başlıq (AZ)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"></textarea>
          <textarea v-model="settings.entryExperience.popupSubtitle.ru" rows="3" placeholder="Alt başlıq (RU)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"></textarea>
          <textarea v-model="settings.entryExperience.popupSubtitle.en" rows="3" placeholder="Alt başlıq (EN)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"></textarea>
        </div>

        <div class="rounded-2xl border border-gray-100 p-5 space-y-5">
          <div class="text-sm font-bold text-gray-900">İkon və rəng seçimi</div>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button
              v-for="option in iconOptions"
              :key="option.value"
              type="button"
              @click="settings.entryExperience.icon = option.value"
              :class="['rounded-2xl border p-4 flex flex-col items-center justify-center gap-3 transition-all', settings.entryExperience.icon === option.value ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-blue-200']"
            >
              <component :is="option.icon" class="w-6 h-6" />
              <span class="text-xs font-bold">{{ option.label }}</span>
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <label class="space-y-2">
              <span class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Gradient start</span>
              <input v-model="settings.entryExperience.gradientFrom" type="color" class="w-full h-12 bg-white border border-gray-100 rounded-2xl p-2" />
            </label>
            <label class="space-y-2">
              <span class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Gradient orta</span>
              <input v-model="settings.entryExperience.gradientVia" type="color" class="w-full h-12 bg-white border border-gray-100 rounded-2xl p-2" />
            </label>
            <label class="space-y-2">
              <span class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Gradient son</span>
              <input v-model="settings.entryExperience.gradientTo" type="color" class="w-full h-12 bg-white border border-gray-100 rounded-2xl p-2" />
            </label>
            <label class="space-y-2">
              <span class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Accent</span>
              <input v-model="settings.entryExperience.accentColor" type="color" class="w-full h-12 bg-white border border-gray-100 rounded-2xl p-2" />
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="rounded-2xl border border-gray-100 p-5 space-y-4">
            <div class="text-sm font-bold text-gray-900">Birinci seçim</div>
            <div class="grid grid-cols-1 gap-4">
              <input v-model="settings.entryExperience.primaryActionLabel.az" type="text" placeholder="Label (AZ)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
              <input v-model="settings.entryExperience.primaryActionLabel.ru" type="text" placeholder="Label (RU)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
              <input v-model="settings.entryExperience.primaryActionLabel.en" type="text" placeholder="Label (EN)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
              <input v-model="settings.entryExperience.primaryActionHref" type="text" placeholder="/shop?featured=1" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
          </div>

          <div class="rounded-2xl border border-gray-100 p-5 space-y-4">
            <div class="text-sm font-bold text-gray-900">İkinci seçim</div>
            <div class="grid grid-cols-1 gap-4">
              <input v-model="settings.entryExperience.secondaryActionLabel.az" type="text" placeholder="Label (AZ)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
              <input v-model="settings.entryExperience.secondaryActionLabel.ru" type="text" placeholder="Label (RU)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
              <input v-model="settings.entryExperience.secondaryActionLabel.en" type="text" placeholder="Label (EN)" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
              <input v-model="settings.entryExperience.secondaryActionHref" type="text" placeholder="/shop?new=1" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="rounded-[2rem] p-8 text-white shadow-xl shadow-blue-200/50" :style="{ background: `linear-gradient(135deg, ${settings.entryExperience.gradientFrom}, ${settings.entryExperience.gradientVia}, ${settings.entryExperience.gradientTo})` }">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-[11px] font-extrabold uppercase tracking-[0.22em]">
            <Bell class="w-4 h-4" />
            Admin önizləmə
          </div>
          <div class="mt-5 text-3xl font-extrabold">Açılış animasiyası burada görünür</div>
          <div class="mt-3 text-sm font-medium text-white/75">Artıq bu hissəni admin paneldən çıxmadan önizləyə bilirsən. İstədiyin zaman splash və popup görünüşünü test et.</div>
          <div class="mt-6 flex flex-wrap gap-3">
            <button @click="showSplashPreview" class="px-5 py-3 rounded-2xl bg-white text-[color:var(--color-primary,#2B3E95)] font-bold text-sm hover:scale-[1.02] transition-all">Splash test et</button>
            <button @click="showPopupPreview" class="px-5 py-3 rounded-2xl bg-[color:var(--color-accent,#FACC15)] text-[color:var(--color-primary,#2B3E95)] font-bold text-sm hover:scale-[1.02] transition-all">Popup test et</button>
          </div>
        </div>

        <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
          <div class="text-xs font-extrabold uppercase tracking-[0.24em] text-gray-400">Canlı mətn</div>
          <div class="mt-4 rounded-[1.75rem] text-white overflow-hidden relative entry-splash-bg" :style="entrySurfaceStyle">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_32%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.12),transparent_28%)]"></div>
            <div class="relative px-6 py-8 text-center">
              <div class="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-white/10 border border-white/15 shadow-2xl shadow-black/10 entry-logo-shell">
                <component :is="previewIcon" class="w-9 h-9 text-[color:var(--entry-accent)] entry-logo-icon" />
              </div>
              <div class="mt-5 text-3xl font-extrabold tracking-tight entry-copy entry-copy-delay-1">{{ previewSplashTitle }}</div>
              <div class="mt-2 text-white/75 font-medium entry-copy entry-copy-delay-2">{{ previewSplashSubtitle }}</div>
            </div>
          </div>
          <div class="mt-4 text-2xl font-extrabold text-gray-900">{{ settings.entryExperience.popupTitle.az || 'Başlıq yazılmayıb' }}</div>
          <div class="mt-3 text-sm font-medium text-gray-500">{{ settings.entryExperience.popupSubtitle.az || 'Alt başlıq yazılmayıb' }}</div>
          <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-5">
              <div class="w-14 h-14 rounded-full bg-white border border-gray-100 flex items-center justify-center text-orange-400 shadow-sm">
                <User class="w-7 h-7" />
              </div>
              <div class="mt-4 text-sm font-bold text-gray-900">{{ primaryPreviewLabel }}</div>
              <div class="mt-2 text-xs font-medium text-gray-400">{{ settings.entryExperience.primaryActionHref || '/shop' }}</div>
            </div>
            <div class="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-5">
              <div class="w-14 h-14 rounded-full bg-white border border-gray-100 flex items-center justify-center text-orange-400 shadow-sm">
                <User class="w-7 h-7" />
              </div>
              <div class="mt-4 text-sm font-bold text-gray-900">{{ secondaryPreviewLabel }}</div>
              <div class="mt-2 text-xs font-medium text-gray-400">{{ settings.entryExperience.secondaryActionHref || '/shop' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <transition name="site-splash">
      <div v-if="previewSplash" class="fixed inset-0 z-[120] text-white flex items-center justify-center overflow-hidden entry-splash-bg" :style="entrySurfaceStyle">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_32%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.12),transparent_28%)]"></div>
        <div class="absolute -top-20 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-white/10 blur-3xl entry-orb-spin"></div>
        <div class="relative text-center px-6">
          <div class="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-white/10 border border-white/15 shadow-2xl shadow-black/10 entry-logo-shell">
            <component :is="previewIcon" class="w-10 h-10 text-[color:var(--entry-accent)] entry-logo-icon" />
          </div>
          <div class="mt-6 text-3xl sm:text-4xl font-extrabold tracking-tight entry-copy entry-copy-delay-1">{{ previewSplashTitle }}</div>
          <div class="mt-2 text-white/75 font-medium text-sm sm:text-base entry-copy entry-copy-delay-2">{{ previewSplashSubtitle }}</div>
        </div>
      </div>
    </transition>

    <transition name="notice-pop">
      <div v-if="previewPopup" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]" @click="previewPopup = false"></div>
        <div class="relative z-10 w-full max-w-xl rounded-[2.25rem] bg-white shadow-2xl shadow-blue-900/15 overflow-hidden entry-popup-shell" :style="entrySurfaceStyle">
          <div class="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(135deg,var(--entry-gradient-from),var(--entry-gradient-via),var(--entry-gradient-to))] opacity-95"></div>
          <button type="button" class="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition-all text-gray-500 z-10" @click="previewPopup = false">
            <X class="w-5 h-5" />
          </button>
          <div class="relative px-6 sm:px-8 pt-8 pb-6 text-center">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[11px] font-extrabold uppercase tracking-[0.22em] shadow-sm entry-copy entry-copy-delay-1" :style="{ color: settings.entryExperience.gradientFrom || '#2B3E95' }">
              <component :is="previewIcon" class="w-4 h-4" />
              {{ previewBadge }}
            </div>
            <div class="mt-5 text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight entry-copy entry-copy-delay-2">{{ settings.entryExperience.popupTitle.az || 'Başlıq yazılmayıb' }}</div>
            <div class="mt-3 text-sm sm:text-base font-medium text-gray-500 max-w-lg mx-auto entry-copy entry-copy-delay-3">{{ settings.entryExperience.popupSubtitle.az || 'Alt başlıq yazılmayıb' }}</div>
          </div>
          <div class="relative px-6 sm:px-8 pb-8">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="group rounded-[1.75rem] border border-gray-100 bg-gray-50 p-5 text-center transition-all entry-copy entry-copy-delay-4">
                <div class="w-20 h-20 mx-auto rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm" :style="{ color: settings.entryExperience.accentColor || '#FACC15' }">
                  <User class="w-9 h-9" />
                </div>
                <div class="mt-5 inline-flex items-center justify-center min-w-[140px] h-11 rounded-xl font-extrabold px-6" :style="{ backgroundColor: settings.entryExperience.accentColor || '#FACC15', color: settings.entryExperience.gradientFrom || '#2B3E95' }">
                  {{ primaryPreviewLabel }}
                </div>
              </div>
              <div class="group rounded-[1.75rem] border border-gray-100 bg-gray-50 p-5 text-center transition-all entry-copy entry-copy-delay-5">
                <div class="w-20 h-20 mx-auto rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm" :style="{ color: settings.entryExperience.accentColor || '#FACC15' }">
                  <User class="w-9 h-9" />
                </div>
                <div class="mt-5 inline-flex items-center justify-center min-w-[140px] h-11 rounded-xl font-extrabold px-6" :style="{ backgroundColor: settings.entryExperience.accentColor || '#FACC15', color: settings.entryExperience.gradientFrom || '#2B3E95' }">
                  {{ secondaryPreviewLabel }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
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
