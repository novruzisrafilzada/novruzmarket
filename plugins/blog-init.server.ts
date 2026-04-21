import { useBlogStore } from '~/stores/blog'

export default defineNuxtPlugin(async () => {
  const blogStore = useBlogStore()
  if (blogStore.hydrated && blogStore.posts.length > 0) return
  const fetcher = useRequestFetch()
  const posts = await fetcher('/api/blog')
  blogStore.setPosts(posts as any)
})

