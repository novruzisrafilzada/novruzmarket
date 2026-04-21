import { useProductExperienceStore } from '~/stores/productExperience'

export default defineNuxtPlugin(async () => {
  const store = useProductExperienceStore()
  if (store.hydrated) return
  await store.fetchConfig()
})
