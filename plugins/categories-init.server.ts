import { useCategoryStore } from '~/stores/categories'

export default defineNuxtPlugin(async () => {
  const store = useCategoryStore()
  if (store.hydrated && store.categories.length > 0) return
  const fetcher = useRequestFetch()
  const categories = await fetcher('/api/categories')
  store.setCategories(categories as any)
})

