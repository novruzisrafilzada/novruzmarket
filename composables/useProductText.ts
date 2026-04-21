import { computed } from 'vue'
import { useSettingsStore } from '~/stores/settings'

export const useProductText = () => {
  const settingsStore = useSettingsStore()
  const lang = computed(() => (settingsStore.settings.language === 'ru' || settingsStore.settings.language === 'en' ? settingsStore.settings.language : 'az'))

  const nameOf = (p: any) => {
    const i18n = p?.nameI18n
    const l = lang.value
    const v = i18n && typeof i18n === 'object' ? String(i18n?.[l] || '').trim() : ''
    return v || String(p?.name || '')
  }

  const descOf = (p: any) => {
    const i18n = p?.descriptionI18n
    const l = lang.value
    const v = i18n && typeof i18n === 'object' ? String(i18n?.[l] || '').trim() : ''
    return v || String(p?.description || '')
  }

  return { lang, nameOf, descOf }
}

