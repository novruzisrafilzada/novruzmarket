<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { Plus, Edit, Trash2, X, Image as ImageIcon, Layout } from 'lucide-vue-next'
import { useBannerStore, type Banner } from '~/stores/banners'
import { useToastStore } from '~/stores/toast'

definePageMeta({ layout: 'admin' })

const bannerStore = useBannerStore()
const toastStore = useToastStore()
const isModalOpen = ref(false)
const editingBanner = ref<Banner | null>(null)
const topDealsBanners = computed(() => bannerStore.banners.filter((b: any) => b.position === 'Middle' && b.homePlacement === 'afterTopDeals').slice(0, 2))
const mosaicBanners = computed(() => bannerStore.banners.filter((b: any) => b.position === 'Middle' && b.homePlacement === 'afterTopProducts').slice(0, 4))
const bannerButtonStyle = (banner: any) => ({
  backgroundColor: banner?.ctaBg || '#FFFFFF',
  color: banner?.ctaTextColor || '#111827'
})

const bannerForm = ref({
  title: '',
  subtitle: '',
  image: '',
  link: '',
  ctaText: '',
  ctaBg: '#FFFFFF',
  ctaTextColor: '#111827',
  position: 'Middle' as Banner['position'],
  homePlacement: 'afterFeatures' as NonNullable<Banner['homePlacement']>,
  status: 'Aktiv' as Banner['status']
})

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
    bannerForm.value.image = `${await uploadImage(file)}?v=${Date.now()}`
    toastStore.success('Şəkil yükləndi')
  } catch {
    toastStore.error('Şəkil yüklənmədi')
  } finally {
    input.value = ''
  }
}

const openModal = (banner?: Banner, presetPlacement?: NonNullable<Banner['homePlacement']>) => {
  if (banner) {
    editingBanner.value = banner
    bannerForm.value = {
      title: banner.title,
      subtitle: banner.subtitle,
      image: banner.image,
      link: banner.link,
      ctaText: banner.ctaText || '',
      ctaBg: banner.ctaBg || '#FFFFFF',
      ctaTextColor: banner.ctaTextColor || '#111827',
      position: banner.position,
      homePlacement: (banner.homePlacement || 'afterFeatures') as any,
      status: banner.status
    }
  } else {
    editingBanner.value = null
    bannerForm.value = {
      title: '',
      subtitle: '',
      image: '',
      link: '',
      ctaText: '',
      ctaBg: '#FFFFFF',
      ctaTextColor: '#111827',
      position: 'Middle',
      homePlacement: presetPlacement || 'afterFeatures',
      status: 'Aktiv'
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingBanner.value = null
}

const saveBanner = async () => {
  try {
    if (editingBanner.value) {
      await bannerStore.updateBanner(editingBanner.value.id, bannerForm.value)
      toastStore.success('Banner yeniləndi')
    } else {
      await bannerStore.addBanner(bannerForm.value)
      toastStore.success('Banner əlavə olundu')
    }
    closeModal()
  } catch {
    toastStore.error('Banner yadda saxlanılmadı')
  }
}

const deleteBanner = async (id: number) => {
  if (confirm('Bu banner-i silmək istədiyinizə əminsiniz?')) {
    try {
      await bannerStore.deleteBanner(id)
      toastStore.success('Banner silindi')
    } catch {
      toastStore.error('Banner silinmədi')
    }
  }
}

onMounted(async () => {
  if (!bannerStore.hydrated) await bannerStore.fetchBanners()
})
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Banner İdarəetməsi</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Saytdakı reklam bannerlərini buradan idarə edin.</p>
      </div>
      <button 
        @click="openModal()"
        class="bg-blue-600 px-8 py-3 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center transition-all"
      >
        <Plus class="w-4 h-4 mr-2" /> Yeni Banner
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-3 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="text-xs font-bold text-gray-400 uppercase tracking-widest">Top Deals altı bannerlər</div>
            <div class="text-lg font-extrabold text-gray-900 mt-1">Bu hissədə 2 banner göstərilir</div>
            <div class="text-sm text-gray-500 font-medium mt-1">Ana səhifədə Top Deals Of The Day hissəsinin altında görünür. Ən çox 2 banner əlavə edib buradan redaktə edin.</div>
          </div>
          <button
            @click="openModal(undefined, 'afterTopDeals')"
            class="bg-amber-500 px-6 py-3 rounded-2xl text-sm font-bold text-white hover:bg-amber-600 shadow-lg shadow-amber-200 flex items-center transition-all"
          >
            <Plus class="w-4 h-4 mr-2" /> Top Deals banneri əlavə et
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div v-for="banner in topDealsBanners" :key="`top-deals-${banner.id}`" class="bg-gray-50 rounded-[1.75rem] border border-gray-100 overflow-hidden group">
            <div class="h-40 relative overflow-hidden">
              <img :src="banner.image" :alt="banner.title" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div class="absolute inset-0 bg-black/35 flex flex-col justify-center p-6 text-white">
                <span class="text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-1">{{ banner.title }}</span>
                <h3 class="text-lg font-bold leading-tight">{{ banner.subtitle }}</h3>
                <span v-if="banner.ctaText" class="mt-4 inline-flex items-center justify-center h-10 px-5 text-xs font-extrabold uppercase tracking-[0.16em] w-fit" :style="bannerButtonStyle(banner)">{{ banner.ctaText }}</span>
              </div>
            </div>
            <div class="p-4 flex items-center justify-between">
              <div class="text-xs font-bold text-gray-400 uppercase tracking-widest">Top Deals altı</div>
              <div class="flex items-center gap-2">
                <button @click="openModal(banner)" class="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-blue-600 transition-all text-xs font-bold">Redaktə et</button>
                <button @click="deleteBanner(banner.id)" class="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-red-600 transition-all text-xs font-bold">Sil</button>
              </div>
            </div>
          </div>
          <div v-if="topDealsBanners.length < 2" class="min-h-[230px] rounded-[1.75rem] border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center p-6">
            <div class="text-sm font-extrabold text-gray-900">Boş banner yeri</div>
            <div class="text-xs text-gray-500 font-medium mt-2">Top Deals altı hissə üçün hələ {{ 2 - topDealsBanners.length }} banner əlavə edilə bilər.</div>
            <button
              @click="openModal(undefined, 'afterTopDeals')"
              class="mt-5 bg-blue-600 px-5 py-3 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 transition-all"
            >
              Banner əlavə et
            </button>
          </div>
        </div>
      </div>

      <div class="md:col-span-3 bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="text-xs font-bold text-gray-400 uppercase tracking-widest">4 banner mozaika</div>
            <div class="text-lg font-extrabold text-gray-900 mt-1">Screenshotdakı 4 banner sahəsi</div>
            <div class="text-sm text-gray-500 font-medium mt-1">Ana səhifədə 4 bannerli mozaika kimi görünür. Solda 1 böyük, ortada 2 üst-üstə, sağda 1 böyük banner göstərilir.</div>
          </div>
          <button
            @click="openModal(undefined, 'afterTopProducts')"
            class="bg-blue-600 px-6 py-3 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center transition-all"
          >
            <Plus class="w-4 h-4 mr-2" /> 4 banner sahəsinə əlavə et
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[1fr,1fr,1fr] gap-6 mt-6">
          <div v-if="mosaicBanners[0]" class="bg-gray-50 rounded-[1.75rem] border border-gray-100 overflow-hidden group">
            <div class="h-56 relative overflow-hidden">
              <img :src="mosaicBanners[0].image" :alt="mosaicBanners[0].title" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div class="absolute inset-0 bg-black/35 flex flex-col justify-center p-6 text-white">
                <span class="text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-1">Sol böyük</span>
                <h3 class="text-lg font-bold leading-tight">{{ mosaicBanners[0].subtitle }}</h3>
                <span v-if="mosaicBanners[0].ctaText" class="mt-4 inline-flex items-center justify-center h-10 px-5 text-xs font-extrabold uppercase tracking-[0.16em] w-fit" :style="bannerButtonStyle(mosaicBanners[0])">{{ mosaicBanners[0].ctaText }}</span>
              </div>
            </div>
            <div class="p-4 flex items-center justify-between">
              <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ mosaicBanners[0].status }}</span>
              <div class="flex items-center gap-2">
                <button @click="openModal(mosaicBanners[0])" class="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-blue-600 transition-all text-xs font-bold">Redaktə et</button>
                <button @click="deleteBanner(mosaicBanners[0].id)" class="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-red-600 transition-all text-xs font-bold">Sil</button>
              </div>
            </div>
          </div>
          <div v-else class="min-h-[288px] rounded-[1.75rem] border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center p-6">
            <div class="text-sm font-extrabold text-gray-900">Sol böyük banner boşdur</div>
            <button @click="openModal(undefined, 'afterTopProducts')" class="mt-5 bg-blue-600 px-5 py-3 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 transition-all">Banner əlavə et</button>
          </div>

          <div class="grid grid-rows-2 gap-6">
            <div v-if="mosaicBanners[1]" class="bg-gray-50 rounded-[1.75rem] border border-gray-100 overflow-hidden group">
              <div class="h-28 relative overflow-hidden">
                <img :src="mosaicBanners[1].image" :alt="mosaicBanners[1].title" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div class="absolute inset-0 bg-black/35 flex flex-col justify-center p-5 text-white">
                  <span class="text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-1">Orta üst</span>
                  <h3 class="text-sm font-bold leading-tight">{{ mosaicBanners[1].subtitle }}</h3>
                  <span v-if="mosaicBanners[1].ctaText" class="mt-3 inline-flex items-center justify-center h-8 px-4 text-[10px] font-extrabold uppercase tracking-[0.16em] w-fit" :style="bannerButtonStyle(mosaicBanners[1])">{{ mosaicBanners[1].ctaText }}</span>
                </div>
              </div>
              <div class="p-3 flex items-center justify-between">
                <span class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{{ mosaicBanners[1].status }}</span>
                <button @click="openModal(mosaicBanners[1])" class="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-blue-600 transition-all text-xs font-bold">Redaktə et</button>
              </div>
            </div>
            <div v-else class="min-h-[150px] rounded-[1.75rem] border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center p-6">
              <div class="text-sm font-extrabold text-gray-900">Orta üst boşdur</div>
              <button @click="openModal(undefined, 'afterTopProducts')" class="mt-4 bg-blue-600 px-4 py-2 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 transition-all">Əlavə et</button>
            </div>

            <div v-if="mosaicBanners[2]" class="bg-gray-50 rounded-[1.75rem] border border-gray-100 overflow-hidden group">
              <div class="h-28 relative overflow-hidden">
                <img :src="mosaicBanners[2].image" :alt="mosaicBanners[2].title" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div class="absolute inset-0 bg-black/35 flex flex-col justify-center p-5 text-white">
                  <span class="text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-1">Orta alt</span>
                  <h3 class="text-sm font-bold leading-tight">{{ mosaicBanners[2].subtitle }}</h3>
                  <span v-if="mosaicBanners[2].ctaText" class="mt-3 inline-flex items-center justify-center h-8 px-4 text-[10px] font-extrabold uppercase tracking-[0.16em] w-fit" :style="bannerButtonStyle(mosaicBanners[2])">{{ mosaicBanners[2].ctaText }}</span>
                </div>
              </div>
              <div class="p-3 flex items-center justify-between">
                <span class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{{ mosaicBanners[2].status }}</span>
                <button @click="openModal(mosaicBanners[2])" class="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-blue-600 transition-all text-xs font-bold">Redaktə et</button>
              </div>
            </div>
            <div v-else class="min-h-[150px] rounded-[1.75rem] border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center p-6">
              <div class="text-sm font-extrabold text-gray-900">Orta alt boşdur</div>
              <button @click="openModal(undefined, 'afterTopProducts')" class="mt-4 bg-blue-600 px-4 py-2 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 transition-all">Əlavə et</button>
            </div>
          </div>

          <div v-if="mosaicBanners[3]" class="bg-gray-50 rounded-[1.75rem] border border-gray-100 overflow-hidden group">
            <div class="h-56 relative overflow-hidden">
              <img :src="mosaicBanners[3].image" :alt="mosaicBanners[3].title" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div class="absolute inset-0 bg-black/35 flex flex-col justify-center p-6 text-white">
                <span class="text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-1">Sağ böyük</span>
                <h3 class="text-lg font-bold leading-tight">{{ mosaicBanners[3].subtitle }}</h3>
                <span v-if="mosaicBanners[3].ctaText" class="mt-4 inline-flex items-center justify-center h-10 px-5 text-xs font-extrabold uppercase tracking-[0.16em] w-fit" :style="bannerButtonStyle(mosaicBanners[3])">{{ mosaicBanners[3].ctaText }}</span>
              </div>
            </div>
            <div class="p-4 flex items-center justify-between">
              <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ mosaicBanners[3].status }}</span>
              <div class="flex items-center gap-2">
                <button @click="openModal(mosaicBanners[3])" class="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-blue-600 transition-all text-xs font-bold">Redaktə et</button>
                <button @click="deleteBanner(mosaicBanners[3].id)" class="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-red-600 transition-all text-xs font-bold">Sil</button>
              </div>
            </div>
          </div>
          <div v-else class="min-h-[288px] rounded-[1.75rem] border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center p-6">
            <div class="text-sm font-extrabold text-gray-900">Sağ böyük banner boşdur</div>
            <button @click="openModal(undefined, 'afterTopProducts')" class="mt-5 bg-blue-600 px-5 py-3 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 transition-all">Banner əlavə et</button>
          </div>
        </div>

        <div v-if="mosaicBanners.length >= 4" class="mt-5 text-xs font-medium text-gray-500">
          4 banner mozaika hazırdır. Render sırası: sol böyük → orta üst → orta alt → sağ böyük.
        </div>
      </div>

      <div v-for="banner in bannerStore.banners" :key="banner.id" class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group">
        <div class="h-40 relative overflow-hidden">
          <img :src="banner.image" :alt="banner.title" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div class="absolute inset-0 bg-black/40 flex flex-col justify-center p-6 text-white">
            <span class="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">{{ banner.title }}</span>
            <h3 class="text-lg font-bold leading-tight">{{ banner.subtitle }}</h3>
            <span v-if="banner.ctaText" class="mt-4 inline-flex items-center justify-center h-10 px-5 text-xs font-extrabold uppercase tracking-[0.16em] w-fit" :style="bannerButtonStyle(banner)">{{ banner.ctaText }}</span>
          </div>
          <div class="absolute top-3 right-3 flex space-x-1">
            <button @click="openModal(banner)" class="p-1.5 bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-blue-600 rounded-lg transition-all border border-white/30">
              <Edit class="w-3.5 h-3.5" />
            </button>
            <button @click="deleteBanner(banner.id)" class="p-1.5 bg-white/20 backdrop-blur-md text-white hover:bg-red-500 rounded-lg transition-all border border-white/30">
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div class="p-4 flex items-center justify-between">
          <div class="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Layout class="w-3 h-3 mr-2 text-blue-600" />
            {{ banner.position }}<span v-if="banner.position === 'Middle' && banner.homePlacement" class="ml-2 text-gray-300">•</span><span v-if="banner.position === 'Middle' && banner.homePlacement" class="ml-2">{{ banner.homePlacement }}</span>
          </div>
          <span :class="['px-2 py-0.5 rounded-full text-[9px] font-bold', banner.status === 'Aktiv' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
            {{ banner.status.toUpperCase() }}
          </span>
        </div>
      </div>
    </div>

    <!-- Banner Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in duration-300">
        <div class="shrink-0 p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/95 backdrop-blur">
          <h2 class="text-2xl font-extrabold text-gray-900">{{ editingBanner ? 'Banner Redaktə Et' : 'Yeni Banner' }}</h2>
          <button @click="closeModal" class="p-3 bg-white rounded-2xl text-gray-400 hover:text-red-500 transition-all border border-gray-100">
            <X class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveBanner" class="flex-1 overflow-y-auto p-8 pr-5 space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Kiçik Başlıq</label>
              <input v-model="bannerForm.title" required type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Məs: 20% ENDİRİM" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mövzi</label>
              <input v-model="bannerForm.subtitle" required type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="Məs: Oyun Dünyası" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Şəkil</label>
            <input type="file" accept="image/*" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" @change="onImageSelected" />
            <input v-model="bannerForm.image" required type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="/uploads/..." />
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Link</label>
              <input v-model="bannerForm.link" required type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="/shop" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Pozisiya</label>
              <select v-model="bannerForm.position" required class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
                <option>Top</option>
                <option>Middle</option>
                <option>Bottom</option>
                <option>Shop</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
              <select v-model="bannerForm.status" required class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
                <option>Aktiv</option>
                <option>Deaktiv</option>
              </select>
            </div>
          </div>

          <div class="bg-gray-50 border border-gray-100 rounded-[2rem] p-5 space-y-5">
            <div>
              <div class="text-xs font-bold text-gray-400 uppercase tracking-widest">Banner düyməsi</div>
              <div class="text-sm font-medium text-gray-500 mt-1">Bütün bannerlər üçün CTA düyməsinin mətnini və rənglərini buradan idarə edin.</div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Düymə mətni</label>
              <input v-model="bannerForm.ctaText" type="text" class="w-full bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" placeholder="Məs: Shop deals" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Düymə fonu</label>
                <div class="flex items-center gap-4">
                  <input v-model="bannerForm.ctaBg" type="color" class="w-14 h-12 p-1 rounded-2xl bg-white border border-gray-100" />
                  <input v-model="bannerForm.ctaBg" type="text" class="flex-1 bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Düymə yazısı</label>
                <div class="flex items-center gap-4">
                  <input v-model="bannerForm.ctaTextColor" type="color" class="w-14 h-12 p-1 rounded-2xl bg-white border border-gray-100" />
                  <input v-model="bannerForm.ctaTextColor" type="text" class="flex-1 bg-white border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-600 outline-none transition-all" />
                </div>
              </div>
            </div>
          </div>

          <div v-if="bannerForm.position === 'Middle'" class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Ana səhifə yeri</label>
            <select v-model="bannerForm.homePlacement" required class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
              <option value="afterFeatures">Features-dən sonra</option>
              <option value="afterTopDeals">Top Deals-dən sonra</option>
              <option value="afterTopProducts">Top Products-dən sonra</option>
              <option value="heroRightTop">Hero sağ (üst)</option>
              <option value="heroRightBottom">Hero sağ (alt)</option>
            </select>
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
