<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Edit, Trash2, X, Layout, Search, Link as LinkIcon, Image as ImageIcon } from 'lucide-vue-next'
import { usePageStore, type Page } from '~/stores/pages'
import { useSettingsStore } from '~/stores/settings'
import { useToastStore } from '~/stores/toast'

definePageMeta({ layout: 'admin' })

const pageStore = usePageStore()
const settingsStore = useSettingsStore()
const toastStore = useToastStore()
const searchQuery = ref('')
const isModalOpen = ref(false)
const editingPage = ref<Page | null>(null)
const contentLang = ref<'az' | 'ru' | 'en'>('az')

if (!settingsStore.hydrated) await settingsStore.fetchSettings()
if (!pageStore.hydrated) {
  if (process.server) {
    const fetcher = useRequestFetch()
    const pages = await fetcher('/api/pages')
    pageStore.setPages(pages as any)
  } else {
    await pageStore.fetchPages()
  }
}

const pageForm = ref({
  title: '',
  slug: '',
  titleI18n: { az: '', ru: '', en: '' },
  contentI18n: { az: '', ru: '', en: '' },
  heroBgImage: '',
  status: 'Aktiv' as Page['status']
})

const filteredPages = computed(() => {
  return pageStore.pages.filter(p => 
    p.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const openModal = (page?: Page) => {
  if (page) {
    editingPage.value = page
    pageForm.value = {
      slug: page.slug,
      titleI18n: page.titleI18n ? { ...page.titleI18n } : { az: page.title || '', ru: '', en: '' },
      contentI18n: page.contentI18n ? { ...page.contentI18n } : { az: page.content || '', ru: '', en: '' },
      heroBgImage: page.heroBgImage || '',
      status: page.status
    }
  } else {
    editingPage.value = null
    pageForm.value = {
      slug: '',
      titleI18n: { az: '', ru: '', en: '' },
      contentI18n: { az: '', ru: '', en: '' },
      heroBgImage: '',
      status: 'Aktiv'
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingPage.value = null
}

const uploadHeroBg = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (files.length === 0) return
  try {
    const body = new FormData()
    body.append('file', files[0])
    const res = await $fetch<any>('/api/upload', { method: 'POST', body })
    pageForm.value.heroBgImage = String(res?.url || '')
  } catch {
    toastStore.error('Şəkil yüklənmədi')
  } finally {
    input.value = ''
  }
}

const savePage = async () => {
  const title = pageForm.value.titleI18n.az || pageForm.value.titleI18n.ru || pageForm.value.titleI18n.en || ''
  const content = pageForm.value.contentI18n.az || pageForm.value.contentI18n.ru || pageForm.value.contentI18n.en || ''
  const payload: any = {
    slug: String(pageForm.value.slug || '').trim(),
    status: pageForm.value.status,
    title,
    content,
    titleI18n: pageForm.value.titleI18n,
    contentI18n: pageForm.value.contentI18n,
    heroBgImage: pageForm.value.heroBgImage
  }
  try {
    if (editingPage.value) {
      await pageStore.updatePage(editingPage.value.id, payload)
    } else {
      await pageStore.addPage(payload)
    }
    closeModal()
  } catch (e: any) {
    toastStore.error(String(e?.data?.message || e?.message || 'Yadda saxlanılmadı'))
  }
}

const deletePage = (id: number) => {
  if (confirm('Bu səhifəni silmək istədiyinizə əminsiniz?')) {
    pageStore.deletePage(id)
  }
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Səhifə İdarəetməsi</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Saytdakı statik səhifələri (Haqqımızda, Əlaqə və s.) buradan idarə edin.</p>
      </div>
      <button 
        @click="openModal()"
        class="bg-blue-600 px-8 py-3 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center transition-all"
      >
        <Plus class="w-4 h-4 mr-2" /> Yeni Səhifə
      </button>
    </div>

    <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 w-full md:w-80 focus-within:border-blue-600 transition-all">
          <Search class="w-4 h-4 text-gray-400 mr-3" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Səhifə adı və ya slug..." 
            class="bg-transparent border-none outline-none text-sm w-full" 
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th class="px-8 py-4">Səhifə</th>
              <th class="px-8 py-4">Slug / Link</th>
              <th class="px-8 py-4">Status</th>
              <th class="px-8 py-4 text-right">Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="page in filteredPages" :key="page.id" class="hover:bg-gray-50/50 transition-colors group">
              <td class="px-8 py-6">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mr-3 text-blue-600">
                    <Layout class="w-5 h-5" />
                  </div>
                  <span class="text-sm font-bold text-gray-800">{{ page.titleI18n?.[settingsStore.settings.language] || page.title }}</span>
                </div>
              </td>
              <td class="px-8 py-6 text-sm text-gray-500 font-medium">
                <div class="flex items-center">
                  <LinkIcon class="w-3 h-3 mr-2 text-gray-400" />
                  /{{ page.slug }}
                </div>
              </td>
              <td class="px-8 py-6">
                <span :class="['px-3 py-1 rounded-full text-[10px] font-bold', page.status === 'Aktiv' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                  {{ page.status.toUpperCase() }}
                </span>
              </td>
              <td class="px-8 py-6 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <button @click="openModal(page)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit class="w-4 h-4" /></button>
                  <button @click="deletePage(page.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Page Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in duration-300">
        <div class="shrink-0 p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/95 backdrop-blur">
          <h2 class="text-2xl font-extrabold text-gray-900">{{ editingPage ? 'Səhifəni Redaktə Et' : 'Yeni Səhifə' }}</h2>
          <button @click="closeModal" class="p-3 bg-white rounded-2xl text-gray-400 hover:text-red-500 transition-all border border-gray-100">
            <X class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="savePage" class="flex-1 overflow-y-auto p-8 pr-5 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Dil</label>
              <div class="flex items-center gap-2">
                <button type="button" class="px-4 py-3 rounded-2xl text-xs font-extrabold border transition-all" :class="contentLang === 'az' ? 'bg-[color:var(--color-primary,#2B3E95)] text-white border-[color:var(--color-primary,#2B3E95)]' : 'bg-gray-50 text-gray-800 border-gray-100 hover:bg-gray-100'" @click="contentLang = 'az'">AZ</button>
                <button type="button" class="px-4 py-3 rounded-2xl text-xs font-extrabold border transition-all" :class="contentLang === 'ru' ? 'bg-[color:var(--color-primary,#2B3E95)] text-white border-[color:var(--color-primary,#2B3E95)]' : 'bg-gray-50 text-gray-800 border-gray-100 hover:bg-gray-100'" @click="contentLang = 'ru'">RU</button>
                <button type="button" class="px-4 py-3 rounded-2xl text-xs font-extrabold border transition-all" :class="contentLang === 'en' ? 'bg-[color:var(--color-primary,#2B3E95)] text-white border-[color:var(--color-primary,#2B3E95)]' : 'bg-gray-50 text-gray-800 border-gray-100 hover:bg-gray-100'" @click="contentLang = 'en'">EN</button>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Slug (URL)</label>
              <input v-model="pageForm.slug" required type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
              <select v-model="pageForm.status" required class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
                <option>Aktiv</option>
                <option>Deaktiv</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Başlıq ({{ contentLang.toUpperCase() }})</label>
              <input v-model="pageForm.titleI18n[contentLang]" required type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Haqqımızda Hero Arxa Fon (şəkil)</label>
              <div class="flex items-center gap-3">
                <input v-model="pageForm.heroBgImage" type="text" class="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="/uploads/..." />
                <label class="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-900 text-white font-extrabold text-xs cursor-pointer hover:bg-black transition-all">
                  <ImageIcon class="w-4 h-4" /> Yüklə
                  <input type="file" class="hidden" accept="image/*" @change="uploadHeroBg" />
                </label>
              </div>
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Məzmun ({{ contentLang.toUpperCase() }}) (HTML/Text)</label>
            <textarea v-model="pageForm.contentI18n[contentLang]" rows="10" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"></textarea>
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
