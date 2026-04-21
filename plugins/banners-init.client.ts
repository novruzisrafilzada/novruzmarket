import { useBannerStore } from '~/stores/banners'

export default defineNuxtPlugin(async () => {
  const bannerStore = useBannerStore()
  if (bannerStore.hydrated && bannerStore.banners.length > 0) return
  await bannerStore.fetchBanners()
})

