import { useTopDealsStore } from '~/stores/topDeals'

export default defineNuxtPlugin(async () => {
  const topDealsStore = useTopDealsStore()
  if (topDealsStore.hydrated) return
  await topDealsStore.fetchConfig()
})

