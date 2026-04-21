<script setup lang="ts">
import { computed, ref } from 'vue'
import { Image as ImageIcon, Save, Upload } from 'lucide-vue-next'
import { useBannerStore, type Banner } from '~/stores/banners'
import { useToastStore } from '~/stores/toast'

definePageMeta({ layout: 'admin' })

const bannerStore = useBannerStore()
const toastStore = useToastStore()

if (!bannerStore.hydrated) await bannerStore.fetchBanners()

const bgPresets = [
  { label: 'Ağ', value: '#FFFFFF' },
  { label: 'Açıq boz', value: '#F3F4F6' },
  { label: 'Açıq mavi', value: '#DBEAFE' },
  { label: 'Açıq sarı', value: '#FEF3C7' },
  { label: 'Açıq yaşıl', value: '#D1FAE5' },
  { label: 'Açıq bənövşəyi', value: '#E9D5FF' },
  { label: 'Sarı → Ağ', value: 'linear-gradient(90deg,#FEF3C7,#FFFFFF)' },
  { label: 'Mavi → Ağ', value: 'linear-gradient(90deg,#DBEAFE,#FFFFFF)' },
  { label: 'Bənövşəyi → Ağ', value: 'linear-gradient(90deg,#E9D5FF,#FFFFFF)' },
  { label: 'Yaşıl → Ağ', value: 'linear-gradient(90deg,#D1FAE5,#FFFFFF)' }
]

const colorValue = (bgStyle: any) => {
  const v = String(bgStyle || '').trim()
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v) ? v : '#FFFFFF'
}

const setSolidColor = (target: any, v: string) => {
  target.bgStyle = String(v || '').trim()
}

const topBanner = computed(() => bannerStore.banners.find(b => b.position === 'Top') || null)
const middleBanner = computed(() => bannerStore.banners.find(b => b.position === 'Middle') || null)

const makeForm = (b: Banner | null, position: Banner['position']) => ({
  id: b?.id || null,
  title: b?.title || '',
  subtitle: b?.subtitle || '',
  image: b?.image || '',
  link: b?.link || '/shop',
  bgStyle: String((b as any)?.bgStyle || ''),
  status: (b?.status || 'Aktiv') as Banner['status'],
  position
})

const topForm = ref(makeForm(topBanner.value, 'Top'))
const middleForm = ref(makeForm(middleBanner.value, 'Middle'))

const uploadImage = async (file: File) => {
  const body = new FormData()
  body.append('file', file)
  const res = await $fetch<{ url: string }>('/api/upload', { method: 'POST', body })
  return res.url
}

const onPickImage = async (e: Event, target: typeof topForm.value) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    target.image = `${await uploadImage(file)}?v=${Date.now()}`
    toastStore.success('Şəkil yükləndi')
  } catch {
    toastStore.error('Şəkil yüklənmədi')
  } finally {
    input.value = ''
  }
}

const saveOne = async (target: typeof topForm.value) => {
  try {
    const payload: Partial<Banner> = {
      title: target.title,
      subtitle: target.subtitle,
      image: target.image,
      link: target.link,
      position: target.position,
      status: target.status,
      bgStyle: target.bgStyle,
    }
    if (target.id) {
      await bannerStore.updateBanner(target.id, payload)
    } else {
      await bannerStore.addBanner(payload as any)
      const created = bannerStore.banners.find(b => b.position === target.position) || null
      target.id = created?.id || null
    }
    toastStore.success('Yadda saxlanıldı')
  } catch {
    toastStore.error('Yadda saxlanılmadı')
  }
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Hero Sağ Bannerlər</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Ana səhifənin böyük sliderinin sağındakı 2 banner (Top və Middle).</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div class="text-xl font-extrabold text-gray-900">1-ci banner (Top)</div>
          <button type="button" class="px-6 py-3 rounded-2xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center" @click="saveOne(topForm)">
            <Save class="w-4 h-4 mr-2" /> Yadda saxla
          </button>
        </div>
        <div class="p-8 space-y-6">
          <div class="rounded-2xl border border-gray-100 overflow-hidden h-32 flex items-center justify-between px-6" :style="{ background: topForm.bgStyle || undefined }">
            <div>
              <div class="text-[10px] font-extrabold uppercase tracking-widest text-gray-700">{{ topForm.title || 'Başlıq' }}</div>
              <div class="text-lg font-extrabold text-gray-900 mt-1">{{ topForm.subtitle || 'Alt başlıq' }}</div>
            </div>
            <img v-if="topForm.image" :src="topForm.image" class="h-20 w-28 object-contain" />
            <div v-else class="h-20 w-28 rounded-2xl bg-white/60 border border-white/50 flex items-center justify-center text-gray-400">
              <ImageIcon class="w-6 h-6" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Başlıq</label>
              <input v-model="topForm.title" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Alt başlıq</label>
              <input v-model="topForm.subtitle" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Şəkil</label>
            <div class="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-3">
              <input v-model="topForm.image" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="/uploads/..." />
              <label class="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gray-900 text-white font-extrabold cursor-pointer">
                <Upload class="w-4 h-4" /> Yüklə
                <input type="file" accept="image/*" class="hidden" @change="(e) => onPickImage(e, topForm)" />
              </label>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Link</label>
              <input v-model="topForm.link" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="/shop" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
              <select v-model="topForm.status" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
                <option>Aktiv</option>
                <option>Deaktiv</option>
              </select>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Arxa fon (rəng/gradient)</label>
            <select v-model="topForm.bgStyle" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
              <option value="">Default</option>
              <option v-for="p in bgPresets" :key="p.label" :value="p.value">{{ p.label }}</option>
            </select>
            <div class="flex items-center gap-4">
              <input :value="colorValue(topForm.bgStyle)" type="color" class="w-14 h-12 p-1 rounded-2xl bg-gray-50 border border-gray-100" @input="setSolidColor(topForm, ($event.target as HTMLInputElement).value)" />
              <div class="text-xs font-bold text-gray-500">Rəng seç (solid)</div>
            </div>
            <input v-model="topForm.bgStyle" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="linear-gradient(...)" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div class="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div class="text-xl font-extrabold text-gray-900">2-ci banner (Middle)</div>
          <button type="button" class="px-6 py-3 rounded-2xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center" @click="saveOne(middleForm)">
            <Save class="w-4 h-4 mr-2" /> Yadda saxla
          </button>
        </div>
        <div class="p-8 space-y-6">
          <div class="rounded-2xl border border-gray-100 overflow-hidden h-32 flex items-center justify-between px-6" :style="{ background: middleForm.bgStyle || undefined }">
            <div>
              <div class="text-[10px] font-extrabold uppercase tracking-widest text-gray-700">{{ middleForm.title || 'Başlıq' }}</div>
              <div class="text-lg font-extrabold text-gray-900 mt-1">{{ middleForm.subtitle || 'Alt başlıq' }}</div>
            </div>
            <img v-if="middleForm.image" :src="middleForm.image" class="h-20 w-28 object-contain" />
            <div v-else class="h-20 w-28 rounded-2xl bg-white/60 border border-white/50 flex items-center justify-center text-gray-400">
              <ImageIcon class="w-6 h-6" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Başlıq</label>
              <input v-model="middleForm.title" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Alt başlıq</label>
              <input v-model="middleForm.subtitle" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Şəkil</label>
            <div class="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-3">
              <input v-model="middleForm.image" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="/uploads/..." />
              <label class="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gray-900 text-white font-extrabold cursor-pointer">
                <Upload class="w-4 h-4" /> Yüklə
                <input type="file" accept="image/*" class="hidden" @change="(e) => onPickImage(e, middleForm)" />
              </label>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Link</label>
              <input v-model="middleForm.link" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="/shop" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
              <select v-model="middleForm.status" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
                <option>Aktiv</option>
                <option>Deaktiv</option>
              </select>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Arxa fon (rəng/gradient)</label>
            <select v-model="middleForm.bgStyle" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
              <option value="">Default</option>
              <option v-for="p in bgPresets" :key="p.label" :value="p.value">{{ p.label }}</option>
            </select>
            <div class="flex items-center gap-4">
              <input :value="colorValue(middleForm.bgStyle)" type="color" class="w-14 h-12 p-1 rounded-2xl bg-gray-50 border border-gray-100" @input="setSolidColor(middleForm, ($event.target as HTMLInputElement).value)" />
              <div class="text-xs font-bold text-gray-500">Rəng seç (solid)</div>
            </div>
            <input v-model="middleForm.bgStyle" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="linear-gradient(...)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
