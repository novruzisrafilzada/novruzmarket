import { defineStore } from 'pinia'
import { $fetch } from 'ofetch'

export type UnitType = 'ədəd' | 'Litr' | 'Qram' | 'Kq-ram'

export interface Variation {
  id: number
  size: number | string
  unit: UnitType
  price: number
  stock: number
  image?: string
}

export interface Product {
  id: number
  name: string
  nameI18n?: { az: string; ru: string; en: string }
  price: number // Base price or "starting from"
  oldPrice?: number
  rating: number
  reviewCount?: number
  stock: number // Total stock or default stock
  sold: number
  total: number
  image: string
  productCode?: string
  viewCount?: number
  featuredStatus?: 'Yoxdur' | 'Gözləyir' | 'Aktiv' | 'Bitib'
  featuredPlanDays?: number
  featuredPlanLabel?: string
  featuredUntil?: string
  featuredBadgeText?: string
  featuredPriority?: number
  createdAt?: string
  gallery?: string[]
  media?: {
    videoUrl?: string
    videoPoster?: string
    lifestyleImages?: string[]
  }
  discount?: string
  category: string
  brand?: string
  categoryId?: number | null
  attributes?: Record<string, string>
  features?: string[]
  description?: string
  descriptionI18n?: { az: string; ru: string; en: string }
  sellerId?: number | null
  sellerName?: string
  sellerShopName?: string
  tags?: string[]
  variations?: Variation[]
  seo?: {
    title: string
    description: string
    keywords: string
  }
  status?: string
}

export const useProductStore = defineStore('products', {
  state: () => ({
    hydrated: false,
    products: [] as Product[],
  }),
  actions: {
    setProducts(products: Product[]) {
      this.products = products
      this.hydrated = true
    },
    async fetchProducts() {
      if (process.server) return
      const products = await $fetch<Product[]>('/api/products')
      this.setProducts(products)
    },
    async addProduct(product: Omit<Product, 'id'>) {
      if (process.server) return
      const created = await $fetch<Product>('/api/products', { method: 'POST', body: product })
      this.products.unshift(created)
    },
    async updateProduct(id: number, updatedProduct: Partial<Product>) {
      if (process.server) return
      const updated = await $fetch<Product>(`/api/products/${id}`, { method: 'PUT', body: updatedProduct })
      const index = this.products.findIndex(p => p.id === id)
      if (index !== -1) this.products[index] = updated
    },
    async deleteProduct(id: number) {
      if (process.server) return
      await $fetch(`/api/products/${id}`, { method: 'DELETE' })
      this.products = this.products.filter(p => p.id !== id)
    },
    getProductById(id: number) {
      return this.products.find(p => p.id === id)
    }
  }
})
