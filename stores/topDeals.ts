import { defineStore } from 'pinia'

export interface TopDealsConfig {
  enabled: boolean
  title: string
  titleI18n?: { az: string; ru: string; en: string }
  endAt: string
  productIds: number[]
}

export const useTopDealsStore = defineStore('topDeals', {
  state: () => ({
    hydrated: false,
    config: {
      enabled: true,
      title: 'Günün ən yaxşı təklifləri',
      titleI18n: { az: 'Günün ən yaxşı təklifləri', ru: 'Лучшие предложения дня', en: 'Today’s best deals' },
      endAt: '',
      productIds: [] as number[]
    } as TopDealsConfig
  }),
  actions: {
    setConfig(config: TopDealsConfig) {
      this.config = config
      this.hydrated = true
    },
    async fetchConfig() {
      const cfg = await $fetch<TopDealsConfig>('/api/top-deals')
      this.setConfig(cfg)
    },
    async saveConfig(next: Partial<TopDealsConfig>) {
      const merged = { ...this.config, ...next }
      const saved = await $fetch<TopDealsConfig>('/api/top-deals', { method: 'PUT', body: merged })
      this.setConfig(saved)
      return saved
    }
  }
})
