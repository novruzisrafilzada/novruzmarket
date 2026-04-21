import { defineStore } from 'pinia'

export interface Banner {
  id: number
  title: string
  subtitle: string
  titleI18n?: { az: string; ru: string; en: string }
  subtitleI18n?: { az: string; ru: string; en: string }
  image: string
  link: string
  ctaText?: string
  ctaTextI18n?: { az: string; ru: string; en: string }
  ctaBg?: string
  ctaTextColor?: string
  position: 'Top' | 'Middle' | 'Bottom' | 'Shop'
  homePlacement?: 'afterFeatures' | 'afterTopDeals' | 'afterTopProducts' | 'heroRightTop' | 'heroRightBottom'
  bgStyle?: string
  status: 'Aktiv' | 'Deaktiv'
}

export const useBannerStore = defineStore('banners', {
  state: () => ({
    hydrated: false,
    banners: [] as Banner[],
  }),
  actions: {
    setBanners(banners: Banner[]) {
      this.banners = banners
      this.hydrated = true
    },
    async fetchBanners() {
      if (process.server) return
      const banners = await $fetch<Banner[]>('/api/banners')
      this.setBanners(banners)
    },
    async addBanner(banner: Omit<Banner, 'id'>) {
      if (process.server) return
      const created = await $fetch<Banner>('/api/banners', { method: 'POST', body: banner })
      this.banners.unshift(created)
      this.hydrated = true
    },
    async updateBanner(id: number, updatedBanner: Partial<Banner>) {
      if (process.server) return
      const updated = await $fetch<Banner>(`/api/banners/${id}`, { method: 'PUT', body: updatedBanner })
      const index = this.banners.findIndex(b => b.id === id)
      if (index !== -1) this.banners[index] = updated
      this.hydrated = true
    },
    async deleteBanner(id: number) {
      if (process.server) return
      await $fetch(`/api/banners/${id}`, { method: 'DELETE' })
      this.banners = this.banners.filter(b => b.id !== id)
    }
  }
})
