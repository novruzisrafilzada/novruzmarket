<script setup lang="ts">
import { Calendar, Clock3, Search, Sparkles, Tag } from 'lucide-vue-next'
import { useBlogStore } from '~/stores/blog'
import { buildBlogHref, isBlogPostPublic } from '~/utils/blog'

const blogStore = useBlogStore()

if (!blogStore.hydrated || blogStore.posts.length === 0) {
  if (process.server) {
    const fetcher = useRequestFetch()
    const posts = await fetcher('/api/blog')
    blogStore.setPosts(posts as any)
  } else {
    await blogStore.fetchPosts()
  }
}

const searchQuery = ref('')
const activeCategory = ref('all')
const activeTag = ref('all')
const posts = computed(() =>
  blogStore.posts
    .filter((post) => isBlogPostPublic(post))
    .sort((a, b) => {
      if (Number(Boolean(b.featured)) !== Number(Boolean(a.featured))) return Number(Boolean(b.featured)) - Number(Boolean(a.featured))
      return new Date(String(b.publishedAt || b.date || '')).getTime() - new Date(String(a.publishedAt || a.date || '')).getTime()
    })
)
const categories = computed(() => ['all', ...Array.from(new Set(posts.value.map((post) => String(post.category || '').trim()).filter(Boolean)))])
const tags = computed(() => ['all', ...Array.from(new Set(posts.value.flatMap((post) => Array.isArray(post.tags) ? post.tags : []).map((tag) => String(tag || '').trim()).filter(Boolean)))])
const filteredPosts = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return posts.value.filter((post) => {
    const searchOk = !q || [
      post.title,
      post.excerpt,
      post.category,
      ...(Array.isArray(post.tags) ? post.tags : [])
    ].some((item) => String(item || '').toLowerCase().includes(q))
    const categoryOk = activeCategory.value === 'all' || post.category === activeCategory.value
    const tagOk = activeTag.value === 'all' || (Array.isArray(post.tags) && post.tags.includes(activeTag.value))
    return searchOk && categoryOk && tagOk
  })
})
const featuredPost = computed(() => filteredPosts.value.find((post) => post.featured) || filteredPosts.value[0] || null)
const listPosts = computed(() => filteredPosts.value.filter((post) => !featuredPost.value || post.id !== featuredPost.value.id))

useSiteSeo({
  title: 'Bloq',
  description: 'Ən son xəbərlər, məqalələr və marketplace yenilikləri.',
  path: '/blog',
  type: 'article'
})
</script>

<template>
  <div class="bg-gray-50/50 py-16 md:py-24">
    <div class="container">
      <div class="flex items-end justify-between mb-12">
        <div>
          <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Bloq</h1>
          <p class="text-gray-600 leading-relaxed max-w-2xl font-medium">
            Ən son xəbərlər, məqalələr və faydalı bələdçilər.
          </p>
        </div>
      </div>

      <div v-if="posts.length === 0" class="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
        <p class="text-gray-500 font-bold uppercase tracking-widest text-sm">Hələ məqalə yoxdur</p>
      </div>

      <div v-else class="space-y-10">
        <div v-if="featuredPost" class="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
          <NuxtLink :to="buildBlogHref(featuredPost)" class="group overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div class="grid h-full lg:grid-cols-[1.05fr,0.95fr]">
              <div class="min-h-[260px] overflow-hidden bg-gray-100">
                <img :src="featuredPost.image" :alt="featuredPost.title" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div class="flex flex-col justify-center p-8">
                <div class="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-700">
                  <Sparkles class="h-3.5 w-3.5" /> Seçilmiş məqalə
                </div>
                <h2 class="mt-5 text-3xl font-extrabold leading-tight text-gray-900 transition-colors group-hover:text-blue-600">
                  {{ featuredPost.title }}
                </h2>
                <p class="mt-4 line-clamp-4 text-sm font-medium leading-7 text-gray-600">
                  {{ featuredPost.excerpt }}
                </p>
                <div class="mt-6 flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                  <span class="inline-flex items-center gap-2"><Tag class="h-3.5 w-3.5 text-blue-600" /> {{ featuredPost.category }}</span>
                  <span class="inline-flex items-center gap-2"><Calendar class="h-3.5 w-3.5" /> {{ featuredPost.date }}</span>
                  <span class="inline-flex items-center gap-2"><Clock3 class="h-3.5 w-3.5" /> {{ featuredPost.readingTime }} dəq</span>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>

        <div class="grid gap-4 rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm lg:grid-cols-[1.1fr,0.9fr,0.9fr]">
          <label class="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
            <Search class="h-4 w-4 text-gray-400" />
            <input v-model="searchQuery" type="text" placeholder="Başlıq, kateqoriya və ya tag axtar..." class="w-full bg-transparent text-sm font-medium text-gray-700 outline-none" />
          </label>
          <select v-model="activeCategory" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 outline-none">
            <option value="all">Bütün kateqoriyalar</option>
            <option v-for="category in categories.filter((item) => item !== 'all')" :key="category" :value="category">{{ category }}</option>
          </select>
          <select v-model="activeTag" class="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 outline-none">
            <option value="all">Bütün taglar</option>
            <option v-for="tag in tags.filter((item) => item !== 'all')" :key="tag" :value="tag">{{ tag }}</option>
          </select>
        </div>

        <div v-if="filteredPosts.length === 0" class="rounded-[2rem] border border-gray-100 bg-white p-14 text-center shadow-sm">
          <p class="text-sm font-bold uppercase tracking-[0.18em] text-gray-400">Axtarışa uyğun məqalə tapılmadı</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <NuxtLink v-for="post in listPosts.length ? listPosts : filteredPosts" :key="post.id" :to="buildBlogHref(post)" class="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
            <div class="h-56 overflow-hidden bg-gray-50">
              <img :src="post.image" :alt="post.title" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div class="space-y-4 p-8">
              <div class="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                <div class="flex items-center">
                  <Tag class="mr-2 h-3.5 w-3.5 text-blue-600" />
                  {{ post.category }}
                </div>
                <div class="flex items-center">
                  <Calendar class="mr-2 h-3.5 w-3.5" />
                  {{ post.date }}
                </div>
              </div>
              <h2 class="min-h-[56px] text-xl font-extrabold text-gray-900 transition-colors group-hover:text-blue-600 line-clamp-2">
                {{ post.title }}
              </h2>
              <p class="line-clamp-3 text-gray-500 font-medium leading-relaxed">
                {{ post.excerpt }}
              </p>
              <div class="flex items-center justify-between pt-4">
                <span class="text-sm font-bold text-blue-600">Oxu</span>
                <span class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                  <Clock3 class="h-3.5 w-3.5" /> {{ post.readingTime }} dəq
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
