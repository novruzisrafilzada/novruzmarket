import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
}

export const useToastStore = defineStore('toast', {
  state: () => ({
    items: [] as ToastItem[],
  }),
  actions: {
    show(type: ToastType, message: string) {
      const id = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`
      this.items.push({ id, type, message })
      setTimeout(() => this.dismiss(id), 2800)
    },
    success(message: string) {
      this.show('success', message)
    },
    error(message: string) {
      this.show('error', message)
    },
    info(message: string) {
      this.show('info', message)
    },
    dismiss(id: string) {
      this.items = this.items.filter(t => t.id !== id)
    }
  }
})

