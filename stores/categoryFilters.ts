import { defineStore } from 'pinia'
import { $fetch } from 'ofetch'

export type CategoryFilterGroup = {
  key: string
  label: string
  options: string[]
}

export type CategoryFilterSchema = {
  categoryId: number
  groups: CategoryFilterGroup[]
  updatedAt: string
  source?: 'auto' | 'custom'
  templateRootCategoryId?: number
}

export const useCategoryFilterStore = defineStore('categoryFilters', {
  state: () => ({
    hydrated: false,
    schemas: [] as CategoryFilterSchema[],
  }),
  actions: {
    setSchemas(schemas: CategoryFilterSchema[]) {
      this.schemas = schemas
      this.hydrated = true
    },
    async fetchSchemas() {
      if (process.server) return
      const schemas = await $fetch<CategoryFilterSchema[]>('/api/category-filters')
      this.setSchemas(schemas)
    },
    getSchema(categoryId: number) {
      return this.schemas.find(s => Number(s.categoryId) === Number(categoryId)) || null
    },
    async upsertSchema(categoryId: number, groups: CategoryFilterGroup[]) {
      if (process.server) return
      const saved = await $fetch<CategoryFilterSchema>(`/api/category-filters/${categoryId}`, { method: 'PUT', body: { groups } })
      this.schemas = this.schemas.filter(s => Number(s.categoryId) !== Number(categoryId))
      this.schemas.push(saved)
      this.hydrated = true
      return saved
    },
    async deleteSchema(categoryId: number) {
      if (process.server) return
      await $fetch(`/api/category-filters/${categoryId}`, { method: 'DELETE' })
      const schemas = await $fetch<CategoryFilterSchema[]>('/api/category-filters')
      this.setSchemas(schemas)
    }
  }
})
