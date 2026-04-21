import { useHomeSectionsStore } from '~/stores/homeSections'

export default defineNuxtPlugin(async () => {
  const store = useHomeSectionsStore()
  if (store.hydrated && store.config) return
  await store.fetchConfig()
})

