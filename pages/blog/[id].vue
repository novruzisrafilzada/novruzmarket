<script setup lang="ts">
import { Calendar, ChevronLeft, Clock3, Copy, Share2, Tag, User } from 'lucide-vue-next'
import { useBlogStore } from '~/stores/blog'
import { buildBlogHref, isBlogPostPublic, parseBlogRouteId } from '~/utils/blog'

const blogStore = useBlogStore()
const route = useRoute()
const toastStore = useToastStore()

if (!blogStore.hydrated || blogStore.posts.length === 0) {
  if (process.server) {
    const fetcher = useRequestFetch()
    const posts = await fetcher('/api/blog')
    blogStore.setPosts(posts as any)
  } else {
    await blogStore.fetchPosts()
  }
}

const post = computed(() => {
  const id = parseBlogRouteId(route.params.id as string)
  return blogStore.posts.find(p => p.id === id) || null
})

const publicPosts = computed(() =>
  blogStore.posts
    .filter((item) => isBlogPostPublic(item))
    .sort((a, b) => new Date(String(b.publishedAt || b.date || '')).getTime() - new Date(String(a.publishedAt || a.date || '')).getTime())
)

if (!post.value || !isBlogPostPublic(post.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Məqalə tapılmadı' })
}

const canonicalBlogHref = computed(() => post.value ? buildBlogHref(post.value) : '/blog')
if (post.value && route.path !== canonicalBlogHref.value) {
  if (process.server) {
    await navigateTo(canonicalBlogHref.value, { redirectCode: 301, replace: true })
  } else {
    navigateTo(canonicalBlogHref.value, { replace: true })
  }
}

const relatedPosts = computed(() => publicPosts.value.filter((item) => item.id !== post.value?.id && item.category === post.value?.category).slice(0, 3))
const currentPostIndex = computed(() => publicPosts.value.findIndex((item) => item.id === post.value?.id))
const previousPost = computed(() => currentPostIndex.value >= 0 ? publicPosts.value[currentPostIndex.value + 1] || null : null)
const nextPost = computed(() => currentPostIndex.value > 0 ? publicPosts.value[currentPostIndex.value - 1] || null : null)

const copyLink = async () => {
  if (!process.client) return
  try {
    await navigator.clipboard.writeText(window.location.href)
    toastStore.success('Link kopyalandı')
  } catch {
    toastStore.error('Link kopyalanmadı')
  }
}

const sharePost = async () => {
  if (!process.client) return
  try {
    if (navigator.share) {
      await navigator.share({ title: post.value?.title || 'Bloq', url: window.location.href })
      return
    }
    await copyLink()
  } catch {}
}

useSiteSeo({
  title: computed(() => post.value?.title || 'Bloq məqaləsi'),
  description: computed(() => post.value?.seo?.description || post.value?.excerpt || post.value?.content || ''),
  image: computed(() => post.value?.image || ''),
  path: computed(() => route.fullPath),
  type: 'article'
})

const blogStructuredData = computed(() => {
  if (!post.value) return ''
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.value.title,
    description: post.value.seo?.description || post.value.excerpt || '',
    image: post.value.image ? [post.value.image] : [],
    datePublished: post.value.publishedAt || post.value.date,
    dateModified: post.value.updatedAt || post.value.publishedAt || post.value.date,
    author: {
      '@type': 'Person',
      name: post.value.author || 'Markett Team'
    },
    keywords: Array.isArray(post.value.tags) ? post.value.tags.join(', ') : String(post.value.seo?.keywords || '')
  })
})

useHead(() => ({
  script: blogStructuredData.value
    ? [{ key: 'blog-structured-data', type: 'application/ld+json', children: blogStructuredData.value }]
    : []
}))
</script>

<template>
  <div class="bg-gray-50/50 py-16 md:py-24">
    <div class="container">
      <NuxtLink to="/blog" class="text-blue-600 font-bold flex items-center mb-10 hover:-translate-x-1 transition-transform w-fit">
        <ChevronLeft class="w-5 h-5 mr-2" />
        Bloqa qayıt
      </NuxtLink>

      <div v-if="!post" class="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
        <p class="text-gray-500 font-bold uppercase tracking-widest text-sm">Məqalə tapılmadı</p>
      </div>

      <article v-else class="max-w-4xl mx-auto bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div class="h-80 bg-gray-50 overflow-hidden">
          <img :src="post.image" :alt="post.title" class="w-full h-full object-cover" />
        </div>
        <div class="p-10 md:p-12 space-y-8">
          <div class="flex flex-wrap gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <div class="flex items-center">
              <Tag class="w-3.5 h-3.5 mr-2 text-blue-600" />
              {{ post.category }}
            </div>
            <div class="flex items-center">
              <Calendar class="w-3.5 h-3.5 mr-2" />
              {{ post.date }}
            </div>
            <div class="flex items-center">
              <User class="w-3.5 h-3.5 mr-2 text-gray-400" />
              {{ post.author }}
            </div>
            <div class="flex items-center">
              <Clock3 class="w-3.5 h-3.5 mr-2 text-gray-400" />
              {{ post.readingTime }} dəq
            </div>
          </div>
          <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">{{ post.title }}</h1>
          <p v-if="post.excerpt" class="text-lg leading-8 font-medium text-gray-500">
            {{ post.excerpt }}
          </p>
          <div class="flex flex-wrap items-center gap-3 border-y border-gray-100 py-4">
            <button type="button" class="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:border-blue-200 hover:text-blue-700 transition-all" @click="sharePost">
              <Share2 class="h-4 w-4" />
              Paylaş
            </button>
            <button type="button" class="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:border-blue-200 hover:text-blue-700 transition-all" @click="copyLink">
              <Copy class="h-4 w-4" />
              Linki kopyala
            </button>
            <div v-if="post.tags?.length" class="flex flex-wrap gap-2">
              <span v-for="tag in post.tags" :key="tag" class="rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-gray-500">
                #{{ tag }}
              </span>
            </div>
          </div>
          <div class="text-gray-600 leading-relaxed font-medium whitespace-pre-line">
            {{ post.content }}
          </div>
          <div class="grid gap-4 border-t border-gray-100 pt-8 md:grid-cols-2">
            <NuxtLink v-if="previousPost" :to="buildBlogHref(previousPost)" class="rounded-[1.75rem] border border-gray-100 bg-gray-50 px-5 py-5 transition-all hover:border-blue-200 hover:bg-white">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">Əvvəlki yazı</div>
              <div class="mt-2 text-base font-extrabold text-gray-900">{{ previousPost.title }}</div>
            </NuxtLink>
            <NuxtLink v-if="nextPost" :to="buildBlogHref(nextPost)" class="rounded-[1.75rem] border border-gray-100 bg-gray-50 px-5 py-5 text-right transition-all hover:border-blue-200 hover:bg-white">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">Növbəti yazı</div>
              <div class="mt-2 text-base font-extrabold text-gray-900">{{ nextPost.title }}</div>
            </NuxtLink>
          </div>
        </div>
      </article>

      <div v-if="relatedPosts.length" class="mx-auto mt-12 max-w-6xl">
        <div class="mb-6">
          <div class="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-600">Related Posts</div>
          <div class="mt-2 text-2xl font-extrabold text-gray-900">Bu kateqoriyadan digər yazılar</div>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <NuxtLink v-for="item in relatedPosts" :key="item.id" :to="buildBlogHref(item)" class="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
            <div class="h-44 overflow-hidden bg-gray-100">
              <img :src="item.image" :alt="item.title" class="h-full w-full object-cover" />
            </div>
            <div class="p-6">
              <div class="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-400">{{ item.category }}</div>
              <div class="mt-2 text-lg font-extrabold text-gray-900 line-clamp-2">{{ item.title }}</div>
              <div class="mt-3 text-sm font-medium leading-6 text-gray-500 line-clamp-3">{{ item.excerpt }}</div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
