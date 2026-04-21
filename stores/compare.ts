import { defineStore } from 'pinia'

type CompareItem = {
  id: number
  name: string
  image?: string
  price?: number
  oldPrice?: number
  stock?: number
  category?: string
  rating?: number
  reviewCount?: number
  sellerName?: string
  sellerShopName?: string
  sellerId?: number | string | null
  attributes?: Record<string, any>
}

const STORAGE_KEY = 'shop-compare-items'

export const useCompareStore = defineStore('compare', {
  state: () => ({
    items: [] as CompareItem[],
    hydrated: false
  }),
  getters: {
    ids: (state) => state.items.map((item) => item.id)
  },
  actions: {
    hydrate() {
      if (!process.client || this.hydrated) return
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        this.items = Array.isArray(parsed) ? parsed : []
      } catch {
        this.items = []
      }
      this.hydrated = true
    },
    persist() {
      if (!process.client) return
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
    },
    toggle(product: any, maxItems = 4) {
      this.hydrate()
      const exists = this.items.find((item) => item.id === Number(product?.id))
      if (exists) {
        this.items = this.items.filter((item) => item.id !== Number(product?.id))
        this.persist()
        return { added: false, limitReached: false }
      }
      if (this.items.length >= maxItems) {
        return { added: false, limitReached: true }
      }
      this.items.push({
        id: Number(product?.id || 0),
        name: String(product?.name || '').trim(),
        image: String(product?.image || '').trim(),
        price: Number(product?.price || 0),
        oldPrice: Number(product?.oldPrice || 0),
        stock: Number(product?.stock || 0),
        category: String(product?.category || '').trim(),
        rating: Number(product?.rating || 0),
        reviewCount: Number(product?.reviewCount || 0),
        sellerName: String(product?.sellerName || '').trim(),
        sellerShopName: String(product?.sellerShopName || '').trim(),
        sellerId: product?.sellerId ?? null,
        attributes: product?.attributes || {}
      })
      this.persist()
      return { added: true, limitReached: false }
    },
    has(id: number) {
      this.hydrate()
      return this.items.some((item) => item.id === Number(id))
    },
    clear() {
      this.items = []
      this.persist()
    }
  }
})
