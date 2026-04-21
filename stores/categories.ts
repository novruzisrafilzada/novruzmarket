import { defineStore } from 'pinia'
import { $fetch } from 'ofetch'

export interface Category {
  id: number
  parentId: number | null
  nameI18n: {
    az: string
    ru: string
    en: string
  }
  descriptionI18n?: {
    az: string
    ru: string
    en: string
  }
  slug: string
  icon: string
  image?: string
  featuredOnHome?: boolean
}

export const useCategoryStore = defineStore('categories', {
  state: () => ({
    hydrated: false,
    categories: [] as Category[],
  }),
  actions: {
    setCategories(categories: Category[]) {
      this.categories = categories
      this.hydrated = true
    },
    async fetchCategories() {
      if (process.server) return
      const categories = await $fetch<Category[]>('/api/categories')
      this.setCategories(categories)
    },
    async addCategory(category: Omit<Category, 'id'>) {
      if (process.server) return
      const created = await $fetch<Category>('/api/categories', { method: 'POST', body: category })
      this.categories.push(created)
    },
    async updateCategory(id: number, updatedCategory: Partial<Category>) {
      if (process.server) return
      const updated = await $fetch<Category>(`/api/categories/${id}`, { method: 'PUT', body: updatedCategory })
      const index = this.categories.findIndex(c => c.id === id)
      if (index !== -1) this.categories[index] = updated
    },
    async deleteCategory(id: number) {
      if (process.server) return
      await $fetch(`/api/categories/${id}`, { method: 'DELETE' })
      const byId = new Map(this.categories.map(c => [c.id, c] as const))
      const toDelete = new Set<number>([id])
      let changed = true
      while (changed) {
        changed = false
        for (const c of byId.values()) {
          if (c.parentId !== null && toDelete.has(c.parentId) && !toDelete.has(c.id)) {
            toDelete.add(c.id)
            changed = true
          }
        }
      }
      this.categories = this.categories.filter(c => !toDelete.has(c.id))
    },
  }
})
