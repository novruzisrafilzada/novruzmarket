import { useSliderStore } from '~/stores/sliders'

export default defineNuxtPlugin(async () => {
  const sliderStore = useSliderStore()
  if (sliderStore.hydrated && sliderStore.sliders.length > 0) return
  await sliderStore.fetchSliders()
})

