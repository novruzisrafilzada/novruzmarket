import { useSettingsStore } from '~/stores/settings'

export default defineNuxtPlugin(async () => {
  const settingsStore = useSettingsStore()
  if (settingsStore.hydrated) return
  try {
    await settingsStore.fetchSettings()
  } catch {
  }
})
