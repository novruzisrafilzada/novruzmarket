<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Edit, Trash2, X, Search, Calendar, Tag, ExternalLink, Sparkles, User, Clock3 } from 'lucide-vue-next'
import { useBlogStore, type BlogPost } from '~/stores/blog'
import { useToastStore } from '~/stores/toast'
import { buildBlogHref, estimateReadingTime, slugifyBlogTitle } from '~/utils/blog'

definePageMeta({ layout: 'admin' })

const blogStore = useBlogStore()
const toastStore = useToastStore()
const searchQuery = ref('')
const isModalOpen = ref(false)
const editingPost = ref<BlogPost | null>(null)
const statusOptions: BlogPost['status'][] = ['Draft', 'Scheduled', 'Aktiv', 'Deaktiv']

const emptySeo = () => ({
  title: '',
  description: '',
  keywords: ''
})

const toDateTimeLocal = (value?: string) => {
  const raw = String(value || '').trim()
  if (!raw) return new Date().toISOString().slice(0, 16)
  const date = new Date(raw)
  return Number.isFinite(date.getTime()) ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
}

const postForm = ref({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  image: '',
  category: '',
  status: 'Aktiv' as BlogPost['status'],
  author: 'Markett Team',
  tags: '',
  featured: false,
  publishedAt: toDateTimeLocal(),
  seo: emptySeo()
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
    postForm.value.image = `${await uploadImage(file)}?v=${Date.now()}`
    toastStore.success('Şəkil yükləndi')
  } catch {
    toastStore.error('Şəkil yüklənmədi')
  } finally {
    input.value = ''
  }
}

const filteredPosts = computed(() => {
  return blogStore.posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.author.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (Array.isArray(p.tags) ? p.tags.join(', ').toLowerCase().includes(searchQuery.value.toLowerCase()) : false)
  )
})

const estimatedReading = computed(() => estimateReadingTime(postForm.value.content || postForm.value.excerpt || ''))

const openModal = (post?: BlogPost) => {
  if (post) {
    editingPost.value = post
    postForm.value = {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image,
      category: post.category,
      status: post.status,
      author: post.author,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
      featured: Boolean(post.featured),
      publishedAt: toDateTimeLocal(post.publishedAt || post.date),
      seo: {
        title: post.seo?.title || '',
        description: post.seo?.description || '',
        keywords: post.seo?.keywords || ''
      }
    }
  } else {
    editingPost.value = null
    postForm.value = {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image: '',
      category: '',
      status: 'Aktiv',
      author: 'Markett Team',
      tags: '',
      featured: false,
      publishedAt: toDateTimeLocal(),
      seo: emptySeo()
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingPost.value = null
}

const savePost = async () => {
  try {
    const title = String(postForm.value.title || '').trim()
    const content = String(postForm.value.content || '').trim()
    const category = String(postForm.value.category || '').trim()
    if (!title || !content || !category) {
      toastStore.error('Başlıq, məzmun və kateqoriya mütləqdir')
      return
    }
    const slug = String(postForm.value.slug || '').trim() || slugifyBlogTitle(title)
    const payload = {
      ...postForm.value,
      title,
      slug,
      excerpt: String(postForm.value.excerpt || '').trim() || content.slice(0, 180),
      content,
      image: String(postForm.value.image || '').trim(),
      category,
      author: String(postForm.value.author || 'Markett Team').trim(),
      tags: String(postForm.value.tags || '').split(',').map((item) => item.trim()).filter(Boolean),
      publishedAt: new Date(postForm.value.publishedAt).toISOString(),
      seo: {
        title: String(postForm.value.seo.title || title).trim(),
        description: String(postForm.value.seo.description || postForm.value.excerpt || content.slice(0, 180)).trim(),
        keywords: String(postForm.value.seo.keywords || postForm.value.tags).trim()
      }
    }
    if (editingPost.value) {
      await blogStore.updatePost(editingPost.value.id, payload)
      toastStore.success('Məqalə yeniləndi')
    } else {
      await blogStore.addPost(payload as any)
      toastStore.success('Məqalə əlavə olundu')
    }
    closeModal()
  } catch (error: any) {
    toastStore.error(error?.data?.statusMessage || 'Məqalə yadda saxlanılmadı')
  }
}

const deletePost = async (id: number) => {
  if (confirm('Bu yazını silmək istədiyinizə əminsiniz?')) {
    try {
      await blogStore.deletePost(id)
      toastStore.success('Məqalə silindi')
    } catch {
      toastStore.error('Məqalə silinmədi')
    }
  }
}

onMounted(async () => {
  if (!blogStore.hydrated) await blogStore.fetchPosts()
})
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Bloq İdarəetməsi</h1>
        <p class="text-gray-500 mt-1 font-medium text-sm">Saytdakı məqalələri və xəbərləri buradan idarə edin.</p>
      </div>
      <button 
        @click="openModal()"
        class="bg-blue-600 px-8 py-3 rounded-2xl text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center transition-all"
      >
        <Plus class="w-4 h-4 mr-2" /> Yeni Məqalə
      </button>
    </div>

    <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 w-full md:w-80 focus-within:border-blue-600 transition-all">
          <Search class="w-4 h-4 text-gray-400 mr-3" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Başlıq və ya kateqoriya..." 
            class="bg-transparent border-none outline-none text-sm w-full" 
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th class="px-8 py-4">Məqalə</th>
              <th class="px-8 py-4">Kateqoriya</th>
              <th class="px-8 py-4">Tarix</th>
              <th class="px-8 py-4">Status</th>
              <th class="px-8 py-4 text-right">Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="post in filteredPosts" :key="post.id" class="hover:bg-gray-50/50 transition-colors group">
              <td class="px-8 py-6">
                <div class="flex items-center">
                  <div class="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden mr-4">
                    <img :src="post.image" :alt="post.title" class="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p class="text-sm font-bold text-gray-800 line-clamp-1">{{ post.title }}</p>
                    <p class="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">ID: #{{ post.id }} · /{{ post.slug }}</p>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6 text-sm font-medium text-gray-600">
                <div class="flex items-center">
                  <Tag class="w-3 h-3 mr-2 text-blue-600" />
                  {{ post.category }}
                </div>
              </td>
              <td class="px-8 py-6 text-sm text-gray-500 font-medium">
                <div class="flex items-center">
                  <Calendar class="w-3 h-3 mr-2 text-gray-400" />
                  {{ post.date }}
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="flex items-center justify-end gap-2">
                  <span :class="['px-3 py-1 rounded-full text-[10px] font-bold', post.status === 'Aktiv' ? 'bg-green-100 text-green-700' : post.status === 'Scheduled' ? 'bg-amber-100 text-amber-700' : post.status === 'Draft' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700']">
                    {{ post.status.toUpperCase() }}
                  </span>
                  <span v-if="post.featured" class="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">FEATURED</span>
                </div>
              </td>
              <td class="px-8 py-6 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <NuxtLink :to="buildBlogHref(post)" target="_blank" class="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><ExternalLink class="w-4 h-4" /></NuxtLink>
                  <button @click="openModal(post)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit class="w-4 h-4" /></button>
                  <button @click="deletePost(post.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Blog Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in duration-300">
        <div class="shrink-0 p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/95 backdrop-blur">
          <h2 class="text-2xl font-extrabold text-gray-900">{{ editingPost ? 'Məqaləni Redaktə Et' : 'Yeni Məqalə' }}</h2>
          <button @click="closeModal" class="p-3 bg-white rounded-2xl text-gray-400 hover:text-red-500 transition-all border border-gray-100">
            <X class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="savePost" class="flex-1 overflow-y-auto p-8 pr-5 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Məqalə Başlığı</label>
              <input v-model="postForm.title" required type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Slug</label>
              <input v-model="postForm.slug" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="meselen-bloq-yazisi" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Kateqoriya</label>
              <input v-model="postForm.category" required type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Müəllif</label>
              <input v-model="postForm.author" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Şəkil</label>
              <input type="file" accept="image/*" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" @change="onImageSelected" />
              <input v-model="postForm.image" required type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="/uploads/..." />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
              <select v-model="postForm.status" required class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
                <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Qısa xülasə</label>
              <textarea v-model="postForm.excerpt" rows="4" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"></textarea>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Taglar</label>
              <input v-model="postForm.tags" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" placeholder="seo, nuxt, marketing" />
              <label class="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5 text-sm font-bold text-gray-700">
                <span class="inline-flex items-center gap-2"><Sparkles class="h-4 w-4 text-blue-600" /> Featured məqalə</span>
                <input v-model="postForm.featured" type="checkbox" class="h-5 w-5 rounded border-gray-300 text-blue-600" />
              </label>
              <label class="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3.5 text-sm font-bold text-gray-700">
                <span class="inline-flex items-center gap-2"><Clock3 class="h-4 w-4 text-blue-600" /> Oxuma müddəti</span>
                <span>{{ estimatedReading }} dəq</span>
              </label>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Yayımlanma tarixi</label>
              <input v-model="postForm.publishedAt" type="datetime-local" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="rounded-[1.5rem] border border-gray-100 bg-gray-50 px-5 py-4">
              <div class="text-xs font-bold uppercase tracking-widest text-gray-400">Preview URL</div>
              <div class="mt-2 text-sm font-bold text-gray-700">/blog/{{ postForm.slug || slugifyBlogTitle(postForm.title) || 'yeni-meqale' }}</div>
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Məzmun</label>
            <textarea v-model="postForm.content" rows="6" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"></textarea>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">SEO başlıq</label>
              <input v-model="postForm.seo.title" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2 md:col-span-2">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">SEO açar sözlər</label>
              <input v-model="postForm.seo.keywords" type="text" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
            <div class="space-y-2 md:col-span-3">
              <label class="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">SEO təsvir</label>
              <textarea v-model="postForm.seo.description" rows="3" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none"></textarea>
            </div>
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
