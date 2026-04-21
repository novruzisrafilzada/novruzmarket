export const useMobileDensity = () => {
  const settingsStore = useSettingsStore()

  const defaults = {
    home: 'compact',
    shop: 'compact',
    product: 'compact',
    cart: 'compact',
    checkout: 'compact'
  } as const

  const profiles = computed(() => ({
    ...defaults,
    ...(settingsStore.settings.mobileExperience?.densityProfiles || {})
  }))

  const profileFor = (page: keyof typeof defaults) => computed(() => profiles.value[page] || defaults[page])
  const isCompact = (page: keyof typeof defaults) => computed(() => profileFor(page).value === 'compact')

  return {
    profiles,
    profileFor,
    isCompact
  }
}
