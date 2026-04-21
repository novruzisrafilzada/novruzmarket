import { useCategoryStore } from '~/stores/categories'

export default defineNuxtPlugin(async () => {
  const store = useCategoryStore()
  if (store.hydrated && store.categories.length > 0) return
  await store.fetchCategories()
})

