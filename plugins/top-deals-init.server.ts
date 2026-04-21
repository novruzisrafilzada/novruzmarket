import { useTopDealsStore } from '~/stores/topDeals'

export default defineNuxtPlugin(async () => {
  const topDealsStore = useTopDealsStore()
  if (topDealsStore.hydrated) return
  const fetcher = useRequestFetch()
  const cfg = await fetcher('/api/top-deals')
  topDealsStore.setConfig(cfg as any)
})

