<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Save, Palette, RectangleHorizontal } from 'lucide-vue-next'
import { useSettingsStore } from '~/stores/settings'
import { useToastStore } from '~/stores/toast'

definePageMeta({ layout: 'admin' })

const settingsStore = useSettingsStore()
const toastStore = useToastStore()

const saving = ref(false)
const isApplying = ref(false)

const form = ref({
  primaryColor: '#2B3E95',
  accentColor: '#FACC15',
  appBg: '#FFFFFF',
  appText: '#1F2937',
  surfaceBg: '#FFFFFF',
  borderColor: '#E5E7EB',
  footerBg: '#030712',
  footerText: '#E5E7EB',
  footerMuted: '#9CA3AF',
  footerBorder: '#111827',
  headerShowLogo: true,
  homeLayout: 1,
  heroHeightMobile: 460,
  heroHeightDesktop: 500,
  heroAutoplayEnabled: true,
  heroAutoplayDelayMs: 5000,
  heroTransitionSpeedMs: 700,
  heroEffect: 'slide',
  heroLoop: true,
  heroPagination: true,
  heroSectionBgDesktop: '#2B3E95',
  headerNavBg: '#2B3E95',
  headerNavLinkDefault: 'rgba(255,255,255,0.9)',
  headerNavLinkHover: '#FFFFFF',
  headerNavLinkActive: '#FACC15',
  deptBtnBg: 'rgba(255,255,255,0.10)',
  deptBtnBorder: 'rgba(255,255,255,0.15)',
  deptBtnText: '#FFFFFF',
  deptBtnHoverBg: '#FACC15',
  deptBtnHoverBorder: '#FACC15',
  deptBtnHoverText: '#2B3E95',
  deptBtnActiveBg: '#FACC15',
  deptBtnActiveBorder: '#FACC15',
  deptBtnActiveText: '#2B3E95',
  deptMenuWidth: 760,
  deptMenuMaxHeight: 420,
  homeBannersLayout: 'carousel',
  homeBannersPlacement: 'afterFeatures'
})

const hydrate = () => {
  const d: any = settingsStore.settings.design || {}
  form.value.primaryColor = String(d.primaryColor || '#2B3E95')
  form.value.accentColor = String(d.accentColor || '#FACC15')
  form.value.appBg = String(d.appBg || '#FFFFFF')
  form.value.appText = String(d.appText || '#1F2937')
  form.value.surfaceBg = String(d.surfaceBg || '#FFFFFF')
  form.value.borderColor = String(d.borderColor || '#E5E7EB')
  form.value.footerBg = String(d.footerBg || '#030712')
  form.value.footerText = String(d.footerText || '#E5E7EB')
  form.value.footerMuted = String(d.footerMuted || '#9CA3AF')
  form.value.footerBorder = String(d.footerBorder || '#111827')
  form.value.headerShowLogo = typeof d.headerShowLogo === 'boolean' ? d.headerShowLogo : true
  form.value.homeLayout = Number([1,2,3,4,5,6].includes(Number(d.homeLayout)) ? Number(d.homeLayout) : 1)
  form.value.heroHeightMobile = Number(d.heroHeightMobile || 460)
  form.value.heroHeightDesktop = Number(d.heroHeightDesktop || 500)
  form.value.heroAutoplayEnabled = typeof d.heroAutoplayEnabled === 'boolean' ? d.heroAutoplayEnabled : true
  form.value.heroAutoplayDelayMs = Number(d.heroAutoplayDelayMs || 5000)
  form.value.heroTransitionSpeedMs = Number(d.heroTransitionSpeedMs || 700)
  form.value.heroEffect = d.heroEffect === 'fade' ? 'fade' : 'slide'
  form.value.heroLoop = typeof d.heroLoop === 'boolean' ? d.heroLoop : true
  form.value.heroPagination = typeof d.heroPagination === 'boolean' ? d.heroPagination : true
  form.value.heroSectionBgDesktop = String(d.heroSectionBgDesktop || d.primaryColor || '#2B3E95')
  form.value.headerNavBg = String(d.headerNavBg || d.primaryColor || '#2B3E95')
  form.value.headerNavLinkDefault = String(d.headerNavLinkDefault || 'rgba(255,255,255,0.9)')
  form.value.headerNavLinkHover = String(d.headerNavLinkHover || '#FFFFFF')
  form.value.headerNavLinkActive = String(d.headerNavLinkActive || d.accentColor || '#FACC15')
  form.value.deptBtnBg = String(d.deptBtnBg || 'rgba(255,255,255,0.10)')
  form.value.deptBtnBorder = String(d.deptBtnBorder || 'rgba(255,255,255,0.15)')
  form.value.deptBtnText = String(d.deptBtnText || '#FFFFFF')
  form.value.deptBtnHoverBg = String(d.deptBtnHoverBg || d.accentColor || '#FACC15')
  form.value.deptBtnHoverBorder = String(d.deptBtnHoverBorder || form.value.deptBtnHoverBg)
  form.value.deptBtnHoverText = String(d.deptBtnHoverText || d.primaryColor || '#2B3E95')
  form.value.deptBtnActiveBg = String(d.deptBtnActiveBg || form.value.deptBtnHoverBg)
  form.value.deptBtnActiveBorder = String(d.deptBtnActiveBorder || form.value.deptBtnActiveBg)
  form.value.deptBtnActiveText = String(d.deptBtnActiveText || form.value.deptBtnHoverText)
  form.value.deptMenuWidth = Number(d.deptMenuWidth || 760)
  form.value.deptMenuMaxHeight = Number(d.deptMenuMaxHeight || 420)
  form.value.homeBannersLayout = String(d.homeBannersLayout || 'carousel')
  form.value.homeBannersPlacement = String(d.homeBannersPlacement || 'afterFeatures')
}

const heroDelaySeconds = computed({
  get: () => Math.round(Number(form.value.heroAutoplayDelayMs || 5000)) / 1000,
  set: (v: number) => {
    const ms = Math.max(800, Math.round(Number(v || 0) * 1000))
    form.value.heroAutoplayDelayMs = ms
  }
})

const isValidColor = (v: string) => {
  const val = String(v || '').trim()
  if (!val) return false
  if (typeof CSS !== 'undefined' && typeof (CSS as any).supports === 'function') {
    return (CSS as any).supports('color', val)
  }
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)
}

const validate = () => {
  const fields: Array<{ label: string; value: string }> = [
    { label: 'Əsas rəng (Primary)', value: form.value.primaryColor },
    { label: 'Vurğu rəngi (Accent)', value: form.value.accentColor },
    { label: 'App fonu', value: form.value.appBg },
    { label: 'App mətn', value: form.value.appText },
    { label: 'Surface fonu', value: form.value.surfaceBg },
    { label: 'Border rəngi', value: form.value.borderColor },
    { label: 'Footer fonu', value: form.value.footerBg },
    { label: 'Footer mətn', value: form.value.footerText },
    { label: 'Footer solğun mətn', value: form.value.footerMuted },
    { label: 'Footer border', value: form.value.footerBorder },
    { label: 'Desktop fon rəngi (qıraqlar)', value: form.value.heroSectionBgDesktop },
    { label: 'Navigation fonu', value: form.value.headerNavBg },
    { label: 'Link rəngi (default)', value: form.value.headerNavLinkDefault },
    { label: 'Link hover rəngi', value: form.value.headerNavLinkHover },
    { label: 'Link aktiv rəngi', value: form.value.headerNavLinkActive },
    { label: 'Mağaza bölməsi fon', value: form.value.deptBtnBg },
    { label: 'Mağaza bölməsi border', value: form.value.deptBtnBorder },
    { label: 'Mağaza bölməsi yazı', value: form.value.deptBtnText },
    { label: 'Hover fon', value: form.value.deptBtnHoverBg },
    { label: 'Hover border', value: form.value.deptBtnHoverBorder },
    { label: 'Hover yazı', value: form.value.deptBtnHoverText },
    { label: 'Aktiv fon', value: form.value.deptBtnActiveBg },
    { label: 'Aktiv border', value: form.value.deptBtnActiveBorder },
    { label: 'Aktiv yazı', value: form.value.deptBtnActiveText },
  ]
  for (const f of fields) {
    if (!isValidColor(f.value)) {
      toastStore.error(`${f.label} düzgün rəng deyil`)
      return false
    }
  }
  if (!Number.isFinite(Number(form.value.deptMenuWidth)) || Number(form.value.deptMenuWidth) < 320) {
    toastStore.error('Kateqoriya menyusu eni düzgün deyil')
    return false
  }
  if (!Number.isFinite(Number(form.value.deptMenuMaxHeight)) || Number(form.value.deptMenuMaxHeight) < 240) {
    toastStore.error('Kateqoriya menyusu hündürlüyü düzgün deyil')
    return false
  }
  if (!Number.isFinite(Number(form.value.heroHeightMobile)) || Number(form.value.heroHeightMobile) < 240) {
    toastStore.error('Hero mobil hündürlük düzgün deyil')
    return false
  }
  if (!Number.isFinite(Number(form.value.heroHeightDesktop)) || Number(form.value.heroHeightDesktop) < 240) {
    toastStore.error('Hero desktop hündürlük düzgün deyil')
    return false
  }
  if (!Number.isFinite(Number(form.value.heroAutoplayDelayMs)) || Number(form.value.heroAutoplayDelayMs) < 800) {
    toastStore.error('Sürüşmə intervalı düzgün deyil')
    return false
  }
  if (!Number.isFinite(Number(form.value.heroTransitionSpeedMs)) || Number(form.value.heroTransitionSpeedMs) < 100) {
    toastStore.error('Keçid sürəti düzgün deyil')
    return false
  }
  return true
}

const applyToStore = () => {
  if (isApplying.value) return
  isApplying.value = true
  try {
    const prev: any = settingsStore.settings.design || {}
    settingsStore.settings.design = {
      ...prev,
      primaryColor: String(form.value.primaryColor),
      accentColor: String(form.value.accentColor),
      appBg: String(form.value.appBg),
      appText: String(form.value.appText),
      surfaceBg: String(form.value.surfaceBg),
      borderColor: String(form.value.borderColor),
      footerBg: String(form.value.footerBg),
      footerText: String(form.value.footerText),
      footerMuted: String(form.value.footerMuted),
      footerBorder: String(form.value.footerBorder),
      headerShowLogo: Boolean(form.value.headerShowLogo),
      homeLayout: Number([1,2,3,4,5,6].includes(Number(form.value.homeLayout)) ? Number(form.value.homeLayout) : 1),
      heroHeightMobile: Math.max(240, Number(form.value.heroHeightMobile)),
      heroHeightDesktop: Math.max(240, Number(form.value.heroHeightDesktop)),
      heroAutoplayEnabled: Boolean(form.value.heroAutoplayEnabled),
      heroAutoplayDelayMs: Math.max(800, Number(form.value.heroAutoplayDelayMs)),
      heroTransitionSpeedMs: Math.max(100, Number(form.value.heroTransitionSpeedMs)),
      heroEffect: form.value.heroEffect === 'fade' ? 'fade' : 'slide',
      heroLoop: Boolean(form.value.heroLoop),
      heroPagination: Boolean(form.value.heroPagination),
      heroSectionBgDesktop: String(form.value.heroSectionBgDesktop),
      headerNavBg: String(form.value.headerNavBg),
      headerNavLinkDefault: String(form.value.headerNavLinkDefault),
      headerNavLinkHover: String(form.value.headerNavLinkHover),
      headerNavLinkActive: String(form.value.headerNavLinkActive),
      deptBtnBg: String(form.value.deptBtnBg),
      deptBtnBorder: String(form.value.deptBtnBorder),
      deptBtnText: String(form.value.deptBtnText),
      deptBtnHoverBg: String(form.value.deptBtnHoverBg),
      deptBtnHoverBorder: String(form.value.deptBtnHoverBorder),
      deptBtnHoverText: String(form.value.deptBtnHoverText),
      deptBtnActiveBg: String(form.value.deptBtnActiveBg),
      deptBtnActiveBorder: String(form.value.deptBtnActiveBorder),
      deptBtnActiveText: String(form.value.deptBtnActiveText),
      deptMenuWidth: Math.max(320, Number(form.value.deptMenuWidth)),
      deptMenuMaxHeight: Math.max(240, Number(form.value.deptMenuMaxHeight)),
      homeBannersLayout: String(form.value.homeBannersLayout || 'carousel'),
      homeBannersPlacement: String(form.value.homeBannersPlacement || 'afterFeatures')
    } as any
  } finally {
    isApplying.value = false
  }
}

const save = async () => {
  if (saving.value) return
  if (!validate()) return
  saving.value = true
  try {
    applyToStore()
    await settingsStore.saveSettings()
    toastStore.success('Yadda saxlanıldı')
  } catch {
    toastStore.error('Yadda saxlanılmadı')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!settingsStore.hydrated) await settingsStore.fetchSettings()
  hydrate()
})

watch(form, () => {
  applyToStore()
}, { deep: true })
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Dizayn Ayarları</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Rənglər və slider ölçülərini dəyişin.</p>
      </div>
      <button type="button" @click="save" :disabled="saving" :class="['px-8 py-3 rounded-2xl font-bold transition-all flex items-center justify-center', saving ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200']">
        <Save class="w-5 h-5 mr-2" /> {{ saving ? 'Yadda saxlanılır…' : 'Yadda saxla' }}
      </button>
    </div>

    <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-10">
      <div class="flex items-center gap-3">
        <Palette class="w-6 h-6 text-blue-600" />
        <h2 class="text-xl font-extrabold text-gray-900">Rənglər</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Əsas rəng (Primary)</label>
          <div class="flex items-center gap-4">
            <input v-model="form.primaryColor" type="color" class="w-14 h-12 p-1 rounded-2xl bg-gray-50 border border-gray-100" />
            <input v-model="form.primaryColor" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="#2B3E95" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Vurğu rəngi (Accent)</label>
          <div class="flex items-center gap-4">
            <input v-model="form.accentColor" type="color" class="w-14 h-12 p-1 rounded-2xl bg-gray-50 border border-gray-100" />
            <input v-model="form.accentColor" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="#FACC15" />
          </div>
        </div>
      </div>

      <div class="border-t border-gray-100 pt-10 space-y-6">
        <div class="flex items-center gap-3">
          <Palette class="w-6 h-6 text-blue-600" />
          <h2 class="text-xl font-extrabold text-gray-900">Ümumi Rənglər</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">App fonu</label>
            <div class="flex items-center gap-4">
              <input v-model="form.appBg" type="color" class="w-14 h-12 p-1 rounded-2xl bg-gray-50 border border-gray-100" />
              <input v-model="form.appBg" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="#FFFFFF" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">App mətn</label>
            <div class="flex items-center gap-4">
              <input v-model="form.appText" type="color" class="w-14 h-12 p-1 rounded-2xl bg-gray-50 border border-gray-100" />
              <input v-model="form.appText" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="#1F2937" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Surface fonu</label>
            <div class="flex items-center gap-4">
              <input v-model="form.surfaceBg" type="color" class="w-14 h-12 p-1 rounded-2xl bg-gray-50 border border-gray-100" />
              <input v-model="form.surfaceBg" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="#FFFFFF" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Border rəngi</label>
            <div class="flex items-center gap-4">
              <input v-model="form.borderColor" type="color" class="w-14 h-12 p-1 rounded-2xl bg-gray-50 border border-gray-100" />
              <input v-model="form.borderColor" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="#E5E7EB" />
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-100 pt-10 space-y-6">
        <div class="flex items-center gap-3">
          <Palette class="w-6 h-6 text-blue-600" />
          <h2 class="text-xl font-extrabold text-gray-900">Footer Rəngləri</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Footer fonu</label>
            <div class="flex items-center gap-4">
              <input v-model="form.footerBg" type="color" class="w-14 h-12 p-1 rounded-2xl bg-gray-50 border border-gray-100" />
              <input v-model="form.footerBg" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="#030712" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Footer mətn</label>
            <div class="flex items-center gap-4">
              <input v-model="form.footerText" type="color" class="w-14 h-12 p-1 rounded-2xl bg-gray-50 border border-gray-100" />
              <input v-model="form.footerText" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="#E5E7EB" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Footer solğun mətn</label>
            <div class="flex items-center gap-4">
              <input v-model="form.footerMuted" type="color" class="w-14 h-12 p-1 rounded-2xl bg-gray-50 border border-gray-100" />
              <input v-model="form.footerMuted" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="#9CA3AF" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Footer border</label>
            <div class="flex items-center gap-4">
              <input v-model="form.footerBorder" type="color" class="w-14 h-12 p-1 rounded-2xl bg-gray-50 border border-gray-100" />
              <input v-model="form.footerBorder" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="#111827" />
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-100 pt-10 space-y-6">
        <div class="flex items-center gap-3">
          <RectangleHorizontal class="w-6 h-6 text-blue-600" />
          <h2 class="text-xl font-extrabold text-gray-900">Ana Səhifə Dizaynı</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button type="button" class="w-full text-left p-6 rounded-3xl border transition-all" :class="form.homeLayout === 1 ? 'border-[color:var(--color-primary,#2B3E95)] bg-blue-50/60' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'" @click="form.homeLayout = 1">
            <div class="text-sm font-extrabold text-gray-900">Variant 1</div>
            <div class="text-xs text-gray-500 font-medium mt-1">Cari görünüş (mövcud hero dizayn).</div>
          </button>
          <button type="button" class="w-full text-left p-6 rounded-3xl border transition-all" :class="form.homeLayout === 2 ? 'border-[color:var(--color-primary,#2B3E95)] bg-blue-50/60' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'" @click="form.homeLayout = 2">
            <div class="text-sm font-extrabold text-gray-900">Variant 2</div>
            <div class="text-xs text-gray-500 font-medium mt-1">Screenshot tipli (desktop top bar + dark hero).</div>
          </button>
          <button type="button" class="w-full text-left p-6 rounded-3xl border transition-all" :class="form.homeLayout === 3 ? 'border-[color:var(--color-primary,#2B3E95)] bg-blue-50/60' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'" @click="form.homeLayout = 3">
            <div class="text-sm font-extrabold text-gray-900">Variant 3</div>
            <div class="text-xs text-gray-500 font-medium mt-1">Kreativ modern (yeni banner + yeni məhsul görünüşləri).</div>
          </button>
          <button type="button" class="w-full text-left p-6 rounded-3xl border transition-all md:col-span-3" :class="form.homeLayout === 4 ? 'border-[color:var(--color-primary,#2B3E95)] bg-blue-50/60' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'" @click="form.homeLayout = 4">
            <div class="text-sm font-extrabold text-gray-900">Variant 4</div>
            <div class="text-xs text-gray-500 font-medium mt-1">Duka Market tipli (sarı vurğu + hover menyu + deal of the day + product grid).</div>
          </button>
          <button type="button" class="w-full text-left p-6 rounded-3xl border transition-all md:col-span-3" :class="form.homeLayout === 5 ? 'border-[color:var(--color-primary,#2B3E95)] bg-blue-50/60' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'" @click="form.homeLayout = 5">
            <div class="text-sm font-extrabold text-gray-900">Variant 5</div>
            <div class="text-xs text-gray-500 font-medium mt-1">Duka Home Main slider (solda mətn + sağda şəkil, demo ilə uyğun spacing).</div>
          </button>
          <button type="button" class="w-full text-left p-6 rounded-3xl border transition-all md:col-span-3" :class="form.homeLayout === 6 ? 'border-[color:var(--color-primary,#2B3E95)] bg-blue-50/60' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'" @click="form.homeLayout = 6">
            <div class="text-sm font-extrabold text-gray-900">Variant 6</div>
            <div class="text-xs text-gray-500 font-medium mt-1">Duka Market Home Main ardıcıllığı (hero + features + banners + top deals + top selling + top featured).</div>
          </button>
        </div>
        <div class="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5">
          <div>
            <div class="text-sm font-bold text-gray-900">Header logo</div>
            <div class="text-xs text-gray-500 font-medium">Header-də logo görünsün/gizlənsin.</div>
          </div>
          <label class="inline-flex items-center cursor-pointer">
            <input v-model="form.headerShowLogo" type="checkbox" class="sr-only peer" />
            <div class="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-all">
              <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
            </div>
          </label>
        </div>

        <div class="bg-gray-50 border border-gray-100 rounded-2xl p-6">
          <div class="text-sm font-bold text-gray-900">Ana səhifə banner yerləşimi</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Banner layout</label>
              <select v-model="form.homeBannersLayout" class="w-full px-6 py-4 rounded-2xl bg-white border border-gray-200 focus:border-blue-600 outline-none transition-all font-medium appearance-none">
                <option value="carousel">Slider (karusel)</option>
                <option value="mosaic">Mosaic (4 blok)</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Banner yeri</label>
              <select v-model="form.homeBannersPlacement" class="w-full px-6 py-4 rounded-2xl bg-white border border-gray-200 focus:border-blue-600 outline-none transition-all font-medium appearance-none">
                <option value="afterFeatures">Features-dən sonra</option>
                <option value="afterTopDeals">Top Deals-dən sonra</option>
                <option value="afterTopProducts">Top Products-dən sonra</option>
              </select>
            </div>
          </div>
          <div class="text-xs text-gray-500 font-medium mt-4">Bannerlər admin paneldə “Banners → position: Middle” olan aktiv bannerlərdən seçilir.</div>
        </div>
      </div>

      <div class="border-t border-gray-100 pt-10 space-y-8">
        <div class="flex items-center gap-3">
          <RectangleHorizontal class="w-6 h-6 text-blue-600" />
          <h2 class="text-xl font-extrabold text-gray-900">Hero Slider Hündürlüyü</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mobil (px)</label>
            <input v-model.number="form.heroHeightMobile" type="number" min="240" max="900" class="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Desktop (px)</label>
            <input v-model.number="form.heroHeightDesktop" type="number" min="240" max="900" class="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
          </div>
        </div>

        <div class="bg-gray-50 border border-gray-100 rounded-2xl p-6">
          <div class="text-sm font-bold text-gray-900">Canlı önizləmə</div>
          <div class="text-xs text-gray-500 font-medium mt-1">Yadda saxladıqdan sonra header rəngi və slider ölçüsü dərhal dəyişəcək.</div>
        </div>
      </div>

      <div class="border-t border-gray-100 pt-10 space-y-8">
        <div class="flex items-center gap-3">
          <RectangleHorizontal class="w-6 h-6 text-blue-600" />
          <h2 class="text-xl font-extrabold text-gray-900">Hero Slider Animasiya</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Desktop fon rəngi (qıraqlar)</label>
            <div class="flex items-center gap-4">
              <input v-model="form.heroSectionBgDesktop" type="color" class="w-14 h-12 p-1 rounded-2xl bg-gray-50 border border-gray-100" />
              <input v-model="form.heroSectionBgDesktop" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="#2B3E95" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Avto sürüşdürmə</label>
            <select v-model="form.heroAutoplayEnabled" class="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium appearance-none">
              <option :value="true">Aktiv</option>
              <option :value="false">Deaktiv</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Effekt</label>
            <select v-model="form.heroEffect" class="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium appearance-none">
              <option value="slide">Slide</option>
              <option value="fade">Fade</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Sürüşmə intervalı (saniyə)</label>
            <input v-model.number="heroDelaySeconds" type="number" min="0.8" max="60" step="0.5" class="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Keçid sürəti (ms)</label>
            <input v-model.number="form.heroTransitionSpeedMs" type="number" min="100" max="5000" class="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" />
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Loop</label>
            <select v-model="form.heroLoop" class="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium appearance-none">
              <option :value="true">Aktiv</option>
              <option :value="false">Deaktiv</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Pagination (nöqtələr)</label>
            <select v-model="form.heroPagination" class="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium appearance-none">
              <option :value="true">Görünsün</option>
              <option :value="false">Gizlənsin</option>
            </select>
          </div>
        </div>
      </div>

      <div class="border-t border-gray-100 pt-10 space-y-8">
        <div class="flex items-center gap-3">
          <Palette class="w-6 h-6 text-blue-600" />
          <h2 class="text-xl font-extrabold text-gray-900">Header Rəngləri</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Navigation fonu</label>
            <div class="flex items-center gap-4">
              <input v-model="form.headerNavBg" type="color" class="w-14 h-12 p-1 rounded-2xl bg-gray-50 border border-gray-100" />
              <input v-model="form.headerNavBg" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="#2B3E95" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Link rəngi (default)</label>
            <input v-model="form.headerNavLinkDefault" type="text" class="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="rgba(255,255,255,0.9)" />
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Link hover rəngi</label>
            <div class="flex items-center gap-4">
              <input v-model="form.headerNavLinkHover" type="color" class="w-14 h-12 p-1 rounded-2xl bg-gray-50 border border-gray-100" />
              <input v-model="form.headerNavLinkHover" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="#FFFFFF" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Link aktiv rəngi</label>
            <div class="flex items-center gap-4">
              <input v-model="form.headerNavLinkActive" type="color" class="w-14 h-12 p-1 rounded-2xl bg-gray-50 border border-gray-100" />
              <input v-model="form.headerNavLinkActive" type="text" class="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="#FACC15" />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mağaza bölməsi düyməsi (fon/border/yazı)</label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input v-model="form.deptBtnBg" type="text" class="px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="rgba(255,255,255,0.10)" />
              <input v-model="form.deptBtnBorder" type="text" class="px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="rgba(255,255,255,0.15)" />
              <input v-model="form.deptBtnText" type="text" class="px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="#FFFFFF" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Hover (fon/border/yazı)</label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input v-model="form.deptBtnHoverBg" type="text" class="px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="#FACC15" />
              <input v-model="form.deptBtnHoverBorder" type="text" class="px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="#FACC15" />
              <input v-model="form.deptBtnHoverText" type="text" class="px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="#2B3E95" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Aktiv (fon/border/yazı)</label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input v-model="form.deptBtnActiveBg" type="text" class="px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="#FACC15" />
              <input v-model="form.deptBtnActiveBorder" type="text" class="px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="#FACC15" />
              <input v-model="form.deptBtnActiveText" type="text" class="px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="#2B3E95" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Kateqoriya açılan menyusu ölçü</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input v-model.number="form.deptMenuWidth" type="number" min="320" max="1200" class="px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="760" />
              <input v-model.number="form.deptMenuMaxHeight" type="number" min="240" max="900" class="px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all font-medium" placeholder="420" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
