import { defineStore } from 'pinia'
import { $fetch } from 'ofetch'

export interface Page {
  id: number
  title: string
  slug: string
  content: string
  titleI18n?: { az: string; ru: string; en: string }
  contentI18n?: { az: string; ru: string; en: string }
  heroBgImage?: string
  pageLayout?: 'basic' | 'faq'
  sections?: Array<{ titleI18n?: { az: string; ru: string; en: string }; contentI18n?: { az: string; ru: string; en: string } }>
  faqs?: Array<{ questionI18n?: { az: string; ru: string; en: string }; answerI18n?: { az: string; ru: string; en: string } }>
  status: 'Aktiv' | 'Deaktiv'
}

export const usePageStore = defineStore('pages', {
  state: () => ({
    hydrated: false,
    pages: [] as Page[],
  }),
  actions: {
    setPages(pages: Page[]) {
      this.pages = pages
      this.hydrated = true
    },
    async fetchPages() {
      if (process.server) return
      const pages = await $fetch<Page[]>('/api/pages')
      this.setPages(pages)
    },
    async addPage(page: Omit<Page, 'id'>) {
      if (process.server) return
      const created = await $fetch<Page>('/api/pages', { method: 'POST', body: page })
      this.pages.push(created)
      this.hydrated = true
    },
    async updatePage(id: number, updatedPage: Partial<Page>) {
      if (process.server) return
      const updated = await $fetch<Page>(`/api/pages/${id}`, { method: 'PUT', body: updatedPage })
      const index = this.pages.findIndex(p => p.id === id)
      if (index !== -1) this.pages[index] = updated
      else this.pages.push(updated)
      this.hydrated = true
    },
    async deletePage(id: number) {
      if (process.server) return
      await $fetch(`/api/pages/${id}`, { method: 'DELETE' })
      this.pages = this.pages.filter(p => p.id !== id)
      this.hydrated = true
    }
  }
})
