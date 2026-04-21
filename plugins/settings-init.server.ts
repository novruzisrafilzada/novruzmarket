import { useSettingsStore } from '~/stores/settings'

export default defineNuxtPlugin(async () => {
  const settingsStore = useSettingsStore()
  if (settingsStore.hydrated) return
  const fetcher = useRequestFetch()
  const settings = await fetcher('/api/settings')
  settingsStore.setAll(settings as any)
})

