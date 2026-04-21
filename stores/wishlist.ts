import { defineStore } from 'pinia'

const STORAGE_KEY = 'markett_wishlist'

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: [] as any[],
    hydrated: false
  }),
  getters: {
    totalItems: (state) => state.items.length,
  },
  actions: {
    hydrate() {
      if (this.hydrated) return
      if (process.server) return
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        this.items = Array.isArray(parsed) ? parsed : []
      } catch {
        this.items = []
      } finally {
        this.hydrated = true
      }
    },
    persist() {
      if (process.server) return
      if (!this.hydrated) return
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
      } catch {}
    },
    toggleWishlist(product: any) {
      this.hydrate()
      const index = this.items.findIndex(item => item.id === product.id)
      if (index > -1) {
        this.items.splice(index, 1)
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          oldPrice: product.oldPrice,
          image: product.image,
          stock: Number(product.stock || 0),
          rating: Number(product.rating || 0),
          reviewCount: Number(product.reviewCount || 0),
          category: product.category,
          slug: product.slug || product.id
        })
      }
      this.persist()
    },
    isInWishlist(productId: number) {
      this.hydrate()
      return this.items.some(item => item.id === productId)
    },
    clear() {
      this.hydrate()
      this.items = []
      this.persist()
    },
    remove(productId: number) {
      this.hydrate()
      this.items = this.items.filter(item => item.id !== productId)
      this.persist()
    }
  }
})
