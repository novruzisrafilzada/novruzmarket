import { useHomeSectionsStore } from '~/stores/homeSections'

export default defineNuxtPlugin(async () => {
  const store = useHomeSectionsStore()
  if (store.hydrated && store.config) return
  const fetcher = useRequestFetch()
  const cfg = await fetcher('/api/home-sections')
  store.setConfig(cfg as any)
})

