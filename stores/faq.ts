import { defineStore } from 'pinia'

export interface FaqItem {
  id: number
  question: string
  answer: string
  status: 'Aktiv' | 'Deaktiv'
}

export const useFaqStore = defineStore('faq', {
  state: () => ({
    hydrated: false,
    items: [] as FaqItem[]
  }),
  actions: {
    setItems(items: FaqItem[]) {
      this.items = items
      this.hydrated = true
    },
    async fetchItems() {
      const items = await $fetch<FaqItem[]>('/api/faq')
      this.setItems(items)
    },
    async addItem(item: Omit<FaqItem, 'id'>) {
      const created = await $fetch<FaqItem>('/api/faq', { method: 'POST', body: item })
      this.items.unshift(created)
      this.hydrated = true
      return created
    },
    async updateItem(id: number, patch: Partial<FaqItem>) {
      const updated = await $fetch<FaqItem>(`/api/faq/${id}`, { method: 'PUT', body: patch })
      const idx = this.items.findIndex(i => i.id === id)
      if (idx !== -1) this.items[idx] = updated
      this.hydrated = true
      return updated
    },
    async deleteItem(id: number) {
      await $fetch(`/api/faq/${id}`, { method: 'DELETE' })
      this.items = this.items.filter(i => i.id !== id)
    }
  }
})

