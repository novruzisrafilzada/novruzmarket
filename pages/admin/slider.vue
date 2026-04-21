<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { Plus, Edit, Trash2, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-vue-next'
import { useSliderStore, type Slider } from '~/stores/sliders'
import { useToastStore } from '~/stores/toast'
import { useSettingsStore } from '~/stores/settings'

definePageMeta({ layout: 'admin' })

const sliderStore = useSliderStore()
const toastStore = useToastStore()
const settingsStore = useSettingsStore()
const isModalOpen = ref(false)
const editingSlider = ref<Slider | null>(null)
const contentLang = ref<'az' | 'ru' | 'en'>('az')

const sliderForm = ref({
  title: '',
  subtitle: '',
  image: '',
  link: '',
  badgeI18n: { az: '', ru: '', en: '' },
  ctaTextI18n: { az: '', ru: '', en: '' },
  layout: 'split' as 'split' | 'image_full',
  imageFit: 'contain' as 'contain' | 'cover',
  contentAlign: 'left' as 'left' | 'center',
  contentOffsetX: 0,
  contentOffsetY: 0,
  contentMaxWidth: 696,
  contentAnimation: 'fade-left' as 'fade-left' | 'fade-up' | 'none',
  titleFontSizeDesktop: 52,
  titleFontSizeMobile: 34,
  ctaSpacingTop: 42,
  buttonAnimation: 'fade-up' as 'fade-up' | 'fade-left' | 'none',
  imageOffsetX: 0,
  imageOffsetY: 0,
  imageScale: 100,
  imageMaxHeightDesktop: 470,
  imageMaxHeightMobile: 280,
  imageAnimation: 'float' as 'float' | 'slide-left-right' | 'zoom' | 'none',
  animate: true,
  bgStyle: '',
  status: 'Aktiv' as Slider['status']
})

const bgPresets = [
  { label: 'Ağ', value: '#FFFFFF' },
  { label: 'Açıq boz', value: '#F3F4F6' },
  { label: 'Açıq mavi', value: '#DBEAFE' },
  { label: 'Açıq sarı', value: '#FEF3C7' },
  { label: 'Açıq yaşıl', value: '#D1FAE5' },
  { label: 'Açıq bənövşəyi', value: '#E9D5FF' },
  { label: 'Mavi gradient', value: 'linear-gradient(90deg,#E0EAFC,#CFDEF3)' },
  { label: 'Bənövşəyi gradient', value: 'linear-gradient(90deg,#E9D5FF,#FBCFE8)' },
  { label: 'Yaşıl gradient', value: 'linear-gradient(90deg,#D1FAE5,#ECFDF5)' },
  { label: 'Sarı gradient', value: 'linear-gradient(90deg,#FEF3C7,#FFFBEB)' },
  { label: 'Boz gradient', value: 'linear-gradient(90deg,#F3F4F6,#FFFFFF)' }
]

const bgColor = computed({
  get: () => {
    const v = String(sliderForm.value.bgStyle || '').trim()
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v) ? v : '#FFFFFF'
  },
  set: (v: string) => {
    sliderForm.value.bgStyle = String(v || '').trim()
  }
})

const contentPreviewStyle = computed(() => {
  const align = sliderForm.value.contentAlign === 'center' ? 'center' : 'left'
  const maxWidth = Math.max(280, Math.min(900, Number(sliderForm.value.contentMaxWidth || 696)))
  const offsetX = Math.max(-300, Math.min(300, Number(sliderForm.value.contentOffsetX || 0))) * 0.35
  const offsetY = Math.max(-300, Math.min(300, Number(sliderForm.value.contentOffsetY || 0))) * 0.35
  return {
    alignItems: align === 'center' ? 'center' : 'flex-start',
    textAlign: align,
    width: `min(100%, ${Math.min(maxWidth, 520)}px)`,
    maxWidth: `${Math.min(maxWidth, 520)}px`,
    transform: `translate(${offsetX}px, ${offsetY}px)`
  }
})

const previewTitleStyle = computed(() => ({
  fontSize: `${Math.max(20, Math.min(56, Number(sliderForm.value.titleFontSizeDesktop || 52) * 0.52))}px`
}))

const previewButtonWrapStyle = computed(() => ({
  marginTop: `${Math.max(8, Math.min(80, Number(sliderForm.value.ctaSpacingTop || 42) * 0.55))}px`
}))

const previewImageShellStyle = computed(() => {
  const offsetX = Math.max(-300, Math.min(300, Number(sliderForm.value.imageOffsetX || 0))) * 0.28
  const offsetY = Math.max(-300, Math.min(300, Number(sliderForm.value.imageOffsetY || 0))) * 0.28
  const scale = Math.max(50, Math.min(160, Number(sliderForm.value.imageScale || 100))) / 100
  return {
    transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`
  }
})

const previewImageStyle = computed(() => ({
  maxHeight: `${Math.max(140, Math.min(360, Number(sliderForm.value.imageMaxHeightDesktop || 470) * 0.62))}px`,
  objectFit: sliderForm.value.imageFit === 'cover' ? 'cover' : 'contain'
}))

const previewImageAnimationStyle = computed(() => {
  if (!sliderForm.value.animate || sliderForm.value.imageAnimation === 'none') return {}
  if (sliderForm.value.imageAnimation === 'zoom') return { animation: 'pulse 3.8s ease-in-out infinite' }
  if (sliderForm.value.imageAnimation === 'slide-left-right') return { animation: 'bounce 3.2s ease-in-out infinite' }
  return { animation: 'pulse 4.5s ease-in-out infinite' }
})

const previewTitleLines = computed(() => {
  const raw = String(sliderForm.value.title || 'SLIDER TITLE')
  return raw.replace(/<br\s*\/?>/gi, '\n').split(/\r?\n/).map(x => x.trim()).filter(Boolean)
})

const previewSubtitle = computed(() => String(sliderForm.value.subtitle || 'Slider alt başlığı'))
const previewBadge = computed(() => {
  const v = String(sliderForm.value.badgeI18n[contentLang.value] || sliderForm.value.badgeI18n.az || 'BADGE').trim()
  return v || 'BADGE'
})
const previewCta = computed(() => {
  const v = String(sliderForm.value.ctaTextI18n[contentLang.value] || sliderForm.value.ctaTextI18n.az || 'Discover now').trim()
  return v || 'Discover now'
})

const sizeForm = ref({
  heroHeightMobile: 460,
  heroHeightDesktop: 500,
})

const hydrateSizes = () => {
  const d: any = settingsStore.settings.design || {}
  sizeForm.value.heroHeightMobile = Number(d.heroHeightMobile || 460)
  sizeForm.value.heroHeightDesktop = Number(d.heroHeightDesktop || 500)
}

const saveSizes = async () => {
  try {
    const prev: any = settingsStore.settings.design || {}
    settingsStore.settings.design = {
      ...prev,
      heroHeightMobile: Math.max(240, Number(sizeForm.value.heroHeightMobile || 0)),
      heroHeightDesktop: Math.max(240, Number(sizeForm.value.heroHeightDesktop || 0)),
    }
    await settingsStore.saveSettings()
    toastStore.success('Slider ölçüsü yadda saxlanıldı')
    hydrateSizes()
  } catch {
    toastStore.error('Slider ölçüsü yadda saxlanılmadı')
  }
}

const uploadImage = async (file: File) => {
  const body = new FormData()
  body.append('file', file)
  const res = await $fetch<{ url: string }>('/api/upload', { method: 'POST', body })
  return res.url
}

const onImageSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    sliderForm.value.image = `${await uploadImage(file)}?v=${Date.now()}`
    toastStore.success('Şəkil yükləndi')
  } catch {
    toastStore.error('Şəkil yüklənmədi')
  } finally {
    input.value = ''
  }
}

const openModal = (slider?: Slider) => {
  if (slider) {
    editingSlider.value = slider
    sliderForm.value = {
      title: slider.title,
      subtitle: slider.subtitle,
      image: slider.image,
      link: slider.link,
      badgeI18n: {
        az: String((slider as any).badgeI18n?.az || ''),
        ru: String((slider as any).badgeI18n?.ru || ''),
        en: String((slider as any).badgeI18n?.en || '')
      },
      ctaTextI18n: {
        az: String((slider as any).ctaTextI18n?.az || ''),
        ru: String((slider as any).ctaTextI18n?.ru || ''),
        en: String((slider as any).ctaTextI18n?.en || '')
      },
      layout: ((slider as any).layout === 'image_full' ? 'image_full' : 'split'),
      imageFit: ((slider as any).imageFit === 'cover' ? 'cover' : 'contain'),
      contentAlign: ((slider as any).contentAlign === 'center' ? 'center' : 'left'),
      contentOffsetX: Number((slider as any).contentOffsetX || 0),
      contentOffsetY: Number((slider as any).contentOffsetY || 0),
      contentMaxWidth: Math.max(280, Number((slider as any).contentMaxWidth || 696)),
      contentAnimation: (['fade-left', 'fade-up', 'none'].includes(String((slider as any).contentAnimation)) ? String((slider as any).contentAnimation) : 'fade-left') as any,
      titleFontSizeDesktop: Math.max(24, Number((slider as any).titleFontSizeDesktop || 52)),
      titleFontSizeMobile: Math.max(20, Number((slider as any).titleFontSizeMobile || 34)),
      ctaSpacingTop: Math.max(8, Number((slider as any).ctaSpacingTop || 42)),
      buttonAnimation: (['fade-up', 'fade-left', 'none'].includes(String((slider as any).buttonAnimation)) ? String((slider as any).buttonAnimation) : 'fade-up') as any,
      imageOffsetX: Number((slider as any).imageOffsetX || 0),
      imageOffsetY: Number((slider as any).imageOffsetY || 0),
      imageScale: Math.max(50, Math.min(160, Number((slider as any).imageScale || 100))),
      imageMaxHeightDesktop: Math.max(220, Number((slider as any).imageMaxHeightDesktop || 470)),
      imageMaxHeightMobile: Math.max(140, Number((slider as any).imageMaxHeightMobile || 280)),
      imageAnimation: (['float', 'slide-left-right', 'zoom', 'none'].includes(String((slider as any).imageAnimation)) ? String((slider as any).imageAnimation) : 'float') as any,
      animate: typeof slider.animate === 'boolean' ? slider.animate : true,
      bgStyle: String((slider as any).bgStyle || ''),
      status: slider.status
    }
  } else {
    editingSlider.value = null
    sliderForm.value = {
      title: '',
      subtitle: '',
      image: '',
      link: '',
      badgeI18n: { az: '', ru: '', en: '' },
      ctaTextI18n: { az: '', ru: '', en: '' },
      layout: 'split',
      imageFit: 'contain',
      contentAlign: 'left',
      contentOffsetX: 0,
      contentOffsetY: 0,
      contentMaxWidth: 696,
      contentAnimation: 'fade-left',
      titleFontSizeDesktop: 52,
      titleFontSizeMobile: 34,
      ctaSpacingTop: 42,
      buttonAnimation: 'fade-up',
      imageOffsetX: 0,
      imageOffsetY: 0,
      imageScale: 100,
      imageMaxHeightDesktop: 470,
      imageMaxHeightMobile: 280,
      imageAnimation: 'float',
      animate: true,
      bgStyle: '',
      status: 'Aktiv'
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingSlider.value = null
}

const saveSlider = async () => {
  try {
    if (editingSlider.value) {
      await sliderStore.updateSlider(editingSlider.value.id, sliderForm.value)
      toastStore.success('Slider yeniləndi')
    } else {
      await sliderStore.addSlider(sliderForm.value)
      toastStore.success('Slider əlavə olundu')
    }
    closeModal()
  } catch {
    toastStore.error('Slider yadda saxlanılmadı')
  }
}

const deleteSlider = async (id: number) => {
  if (confirm('Bu slider-i silmək istədiyinizə əminsiniz?')) {
    try {
      await sliderStore.deleteSlider(id)
      toastStore.success('Slider silindi')
    } catch {
      toastStore.error('Slider silinmədi')
    }
  }
}

onMounted(async () => {
  if (!sliderStore.hydrated) await sliderStore.fetchSliders()
  if (!settingsStore.hydrated) await settingsStore.fetchSettings()
  hydrateSizes()
})
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Slider İdarəetməsi</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Ana səhifədəki böyük sliderləri buradan idarə edin.</p>
      </div>
      <button 
        @click="openModal()"
        class="bg-blue-600 px-8 py-3 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center transition-all"
      >
        <Plus class="w-4 h-4 mr-2" /> Yeni Slider
      </button>
    </div>

    <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 sm:p-8">
      <div class="flex items-center justify-between gap-6">
        <div>
          <div class="text-lg font-extrabold text-gray-900">Slider ölçüsü</div>
          <div class="text-sm text-gray-500 font-medium mt-1">Mobil və desktop üçün hündürlüyü buradan dəyişə bilərsiniz.</div>
        </div>
        <button type="button" class="bg-blue-600 px-6 py-3 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all" @click="saveSizes">
          Yadda saxla
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mobil (px)</label>
          <input v-model.number="sizeForm.heroHeightMobile" type="number" min="240" max="900" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Desktop (px)</label>
          <input v-model.number="sizeForm.heroHeightDesktop" type="number" min="240" max="900" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div v-for="slider in sliderStore.sliders" :key="slider.id" class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group">
        <div class="h-48 relative overflow-hidden">
          <img :src="slider.image" :alt="slider.title" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div class="absolute inset-0 bg-black/40 flex flex-col justify-center p-8 text-white">
            <h3 class="text-xl font-bold mb-2">{{ slider.title }}</h3>
            <p class="text-sm opacity-80 line-clamp-2">{{ slider.subtitle }}</p>
          </div>
          <div class="absolute top-4 right-4 flex space-x-2">
            <button @click="openModal(slider)" class="p-2 bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-blue-600 rounded-xl transition-all border border-white/30">
              <Edit class="w-4 h-4" />
            </button>
            <button @click="deleteSlider(slider.id)" class="p-2 bg-white/20 backdrop-blur-md text-white hover:bg-red-500 rounded-xl transition-all border border-white/30">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
        <div class="p-6 flex items-center justify-between">
          <div class="flex items-center text-xs font-bold text-gray-400">
            <LinkIcon class="w-3 h-3 mr-2" />
            {{ slider.link }}
          </div>
          <span :class="['px-3 py-1 rounded-full text-[10px] font-bold', slider.status === 'Aktiv' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
            {{ slider.status.toUpperCase() }}
          </span>
        </div>
      </div>
    </div>

    <!-- Slider Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in duration-300">
        <div class="shrink-0 p-5 sm:p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/95 backdrop-blur">
          <h2 class="text-2xl font-extrabold text-gray-900">{{ editingSlider ? 'Slider Redaktə Et' : 'Yeni Slider' }}</h2>
          <button @click="closeModal" class="p-3 bg-white rounded-2xl text-gray-400 hover:text-red-500 transition-all border border-gray-100">
            <X class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveSlider" class="flex-1 overflow-y-auto p-5 pr-4 sm:p-8 sm:pr-6 space-y-6">
          <div class="flex gap-2">
            <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'az' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'az'">AZ</button>
            <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'ru' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'ru'">RU</button>
            <button type="button" class="px-4 py-2 rounded-xl text-sm font-extrabold border" :class="contentLang === 'en' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'" @click="contentLang = 'en'">EN</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Layout</label>
              <select v-model="sliderForm.layout" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
                <option value="split">Mətn + Şəkil</option>
                <option value="image_full">Tam Şəkil</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Şəkil fit</label>
              <select v-model="sliderForm.imageFit" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
                <option value="contain">Contain</option>
                <option value="cover">Cover</option>
              </select>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Başlıq</label>
            <input v-model="sliderForm.title" required type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Slider başlığı..." />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Alt Başlıq</label>
            <input v-model="sliderForm.subtitle" required type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Qısa məlumat..." />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Badge mətni</label>
              <input v-model="sliderForm.badgeI18n[contentLang]" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Düymə mətni</label>
              <input v-model="sliderForm.ctaTextI18n[contentLang]" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="discover_now" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Şəkil</label>
            <input type="file" accept="image/*" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" @change="onImageSelected" />
            <input v-model="sliderForm.image" required type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="/uploads/..." />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Link</label>
              <input v-model="sliderForm.link" required type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="/shop" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
              <select v-model="sliderForm.status" required class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
                <option>Aktiv</option>
                <option>Deaktiv</option>
              </select>
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Arxa fon (rəng/gradient)</label>
            <select v-model="sliderForm.bgStyle" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
              <option value="">Default</option>
              <option v-for="p in bgPresets" :key="p.label" :value="p.value">{{ p.label }}</option>
            </select>
            <div class="flex items-center gap-4">
              <input v-model="bgColor" type="color" class="w-14 h-12 p-1 rounded-2xl bg-gray-50 border border-gray-100" />
              <div class="text-xs font-bold text-gray-500">Rəng seç (solid)</div>
            </div>
            <input v-model="sliderForm.bgStyle" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="linear-gradient(...)" />
            <div class="h-12 rounded-2xl border border-gray-100" :style="{ background: sliderForm.bgStyle || undefined }"></div>
          </div>

          <div class="bg-gray-50 border border-gray-100 rounded-[2rem] p-5 space-y-5">
            <div>
              <div class="text-xs font-bold text-gray-400 uppercase tracking-widest">Mətn yerləşməsi</div>
              <div class="text-sm font-medium text-gray-500 mt-1">Slider mətnini sağa-sola, yuxarı-aşağı və ölçü baxımından buradan düzəldin.</div>
            </div>

            <div class="rounded-[2rem] border border-slate-200 bg-[linear-gradient(90deg,#051a42_0%,#0d47a1_100%)] min-h-[280px] overflow-hidden relative p-6 sm:p-8">
              <div class="absolute inset-y-0 right-0 w-[42%] hidden sm:flex items-center justify-center overflow-hidden">
                <div class="flex items-center justify-center w-full h-full" :style="previewImageShellStyle">
                  <img v-if="sliderForm.image" :src="sliderForm.image" alt="" class="max-w-full drop-shadow-[0_24px_36px_rgba(15,23,42,0.35)]" :style="[previewImageStyle, previewImageAnimationStyle]" />
                  <div v-else class="w-32 h-32 rounded-full border border-white/15 bg-white/10 flex items-center justify-center shadow-2xl shadow-slate-950/20">
                    <ImageIcon class="w-12 h-12 text-white/60" />
                  </div>
                </div>
              </div>
              <div class="min-h-[230px] flex items-center">
                <div class="flex flex-col text-white" :style="contentPreviewStyle">
                  <div class="inline-flex" v-if="previewBadge">
                    <span class="inline-flex items-center justify-center h-7 px-3 bg-[#ffd200] text-[#222] text-[10px] font-extrabold tracking-[0.25em] uppercase">{{ previewBadge }}</span>
                  </div>
                  <h3 class="pt-4 font-extrabold uppercase leading-[1.06] text-white max-w-[420px]" :style="previewTitleStyle">
                    <template v-for="(line, i) in previewTitleLines" :key="`preview-${i}`">
                      {{ line }}<br v-if="i !== previewTitleLines.length - 1" />
                    </template>
                  </h3>
                  <p class="mt-2 text-sm leading-6 text-white/80 max-w-[360px]">{{ previewSubtitle }}</p>
                  <div :style="previewButtonWrapStyle">
                    <span class="inline-flex items-center justify-center h-11 px-7 bg-white text-slate-900 text-[11px] font-extrabold tracking-[0.2em] uppercase">{{ previewCta }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Hizalama</label>
                <select v-model="sliderForm.contentAlign" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all appearance-none">
                  <option value="left">Sol</option>
                  <option value="center">Mərkəz</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mətn blok eni</label>
                <input v-model.number="sliderForm.contentMaxWidth" type="number" min="280" max="900" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mətn animasiyası</label>
                <select v-model="sliderForm.contentAnimation" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all appearance-none">
                  <option value="fade-left">Soldan gəl</option>
                  <option value="fade-up">Aşağıdan gəl</option>
                  <option value="none">Animasiya olmasın</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Button animasiyası</label>
                <select v-model="sliderForm.buttonAnimation" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all appearance-none">
                  <option value="fade-up">Aşağıdan gəl</option>
                  <option value="fade-left">Soldan gəl</option>
                  <option value="none">Animasiya olmasın</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Sağ/Sol (px)</label>
                <input v-model.number="sliderForm.contentOffsetX" type="number" min="-300" max="300" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
                <input v-model.number="sliderForm.contentOffsetX" type="range" min="-300" max="300" step="1" class="w-full accent-blue-600" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Yuxarı/Aşağı (px)</label>
                <input v-model.number="sliderForm.contentOffsetY" type="number" min="-300" max="300" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
                <input v-model.number="sliderForm.contentOffsetY" type="range" min="-300" max="300" step="1" class="w-full accent-blue-600" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Title desktop (px)</label>
                <input v-model.number="sliderForm.titleFontSizeDesktop" type="number" min="24" max="96" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Title mobile (px)</label>
                <input v-model.number="sliderForm.titleFontSizeMobile" type="number" min="18" max="72" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Button aralığı (px)</label>
              <input v-model.number="sliderForm.ctaSpacingTop" type="number" min="8" max="120" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
            </div>
          </div>

          <div class="bg-gray-50 border border-gray-100 rounded-[2rem] p-5 space-y-5">
            <div>
              <div class="text-xs font-bold text-gray-400 uppercase tracking-widest">Şəkil yerləşməsi və animasiya</div>
              <div class="text-sm font-medium text-gray-500 mt-1">Slider şəklinin yerini, ölçüsünü və hərəkətini ayrıca idarə edin.</div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Şəkil animasiyası</label>
                <select v-model="sliderForm.imageAnimation" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all appearance-none">
                  <option value="float">Yüngül float</option>
                  <option value="slide-left-right">Soldan gəl</option>
                  <option value="zoom">Yüngül zoom</option>
                  <option value="none">Animasiya olmasın</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Şəkil scale (%)</label>
                <input v-model.number="sliderForm.imageScale" type="number" min="50" max="160" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Şəkil sağ/sol (px)</label>
                <input v-model.number="sliderForm.imageOffsetX" type="number" min="-300" max="300" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
                <input v-model.number="sliderForm.imageOffsetX" type="range" min="-300" max="300" step="1" class="w-full accent-blue-600" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Şəkil yuxarı/aşağı (px)</label>
                <input v-model.number="sliderForm.imageOffsetY" type="number" min="-300" max="300" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
                <input v-model.number="sliderForm.imageOffsetY" type="range" min="-300" max="300" step="1" class="w-full accent-blue-600" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Desktop max height (px)</label>
                <input v-model.number="sliderForm.imageMaxHeightDesktop" type="number" min="220" max="760" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mobil max height (px)</label>
                <input v-model.number="sliderForm.imageMaxHeightMobile" type="number" min="140" max="520" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4">
            <div>
              <div class="text-xs font-bold text-gray-400 uppercase tracking-widest">Animasiya</div>
              <div class="text-sm font-bold text-gray-900 mt-1">Slaydda animasiyalar aktiv olsun</div>
            </div>
            <label class="inline-flex items-center cursor-pointer">
              <input v-model="sliderForm.animate" type="checkbox" class="sr-only peer" />
              <div class="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative transition-all">
                <div class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>

          <div class="sticky bottom-0 flex items-center space-x-4 border-t border-gray-100 bg-white/95 pt-4 backdrop-blur">
            <button type="button" @click="closeModal" class="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all">Ləğv Et</button>
            <button type="submit" class="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Yadda Saxla</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
