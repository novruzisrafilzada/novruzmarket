import { useBlogStore } from '~/stores/blog'

export default defineNuxtPlugin(async () => {
  const blogStore = useBlogStore()
  if (blogStore.hydrated && blogStore.posts.length > 0) return
  await blogStore.fetchPosts()
})

