import { useShopExperienceStore } from '~/stores/shopExperience'

export default defineNuxtPlugin(async () => {
  const store = useShopExperienceStore()
  if (store.hydrated) return
  await store.fetchConfig()
})
