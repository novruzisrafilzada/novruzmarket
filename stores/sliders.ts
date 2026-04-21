import { defineStore } from 'pinia'

export interface Slider {
  id: number
  title: string
  subtitle: string
  titleI18n?: { az: string; ru: string; en: string }
  subtitleI18n?: { az: string; ru: string; en: string }
  image: string
  link: string
  animate: boolean
  bgStyle?: string
  badgeI18n?: { az: string; ru: string; en: string }
  ctaTextI18n?: { az: string; ru: string; en: string }
  layout?: 'split' | 'image_full'
  imageFit?: 'contain' | 'cover'
  contentAlign?: 'left' | 'center'
  contentOffsetX?: number
  contentOffsetY?: number
  contentMaxWidth?: number
  contentAnimation?: 'fade-left' | 'fade-up' | 'none'
  titleFontSizeDesktop?: number
  titleFontSizeMobile?: number
  ctaSpacingTop?: number
  buttonAnimation?: 'fade-up' | 'fade-left' | 'none'
  imageOffsetX?: number
  imageOffsetY?: number
  imageScale?: number
  imageMaxHeightDesktop?: number
  imageMaxHeightMobile?: number
  imageAnimation?: 'float' | 'slide-left-right' | 'zoom' | 'none'
  status: 'Aktiv' | 'Deaktiv'
}

export const useSliderStore = defineStore('sliders', {
  state: () => ({
    hydrated: false,
    sliders: [] as Slider[],
  }),
  actions: {
    setSliders(sliders: Slider[]) {
      this.sliders = sliders
      this.hydrated = true
    },
    async fetchSliders() {
      if (process.server) return
      const sliders = await $fetch<Slider[]>('/api/sliders')
      this.setSliders(sliders)
      return sliders
    },
    async addSlider(slider: Omit<Slider, 'id'>) {
      if (process.server) return
      const created = await $fetch<Slider>('/api/sliders', { method: 'POST', body: slider })
      this.sliders.unshift(created)
      this.hydrated = true
      return created
    },
    async updateSlider(id: number, updatedSlider: Partial<Slider>) {
      if (process.server) return
      const updated = await $fetch<Slider>(`/api/sliders/${id}`, { method: 'PUT', body: updatedSlider })
      const index = this.sliders.findIndex(s => s.id === id)
      if (index !== -1) this.sliders[index] = updated
      this.hydrated = true
      return updated
    },
    async deleteSlider(id: number) {
      if (process.server) return
      await $fetch(`/api/sliders/${id}`, { method: 'DELETE' })
      this.sliders = this.sliders.filter(s => s.id !== id)
    }
  }
})
