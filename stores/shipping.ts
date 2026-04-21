import { defineStore } from 'pinia'

export interface ShippingMethod {
  id: number
  name: string
  price: number
  duration: string
  status: 'Aktiv' | 'Deaktiv'
  regions?: string[]
  freeOver?: number
  etaDaysMin?: number
  etaDaysMax?: number
}

export const useShippingStore = defineStore('shipping', {
  state: () => ({
    hydrated: false,
    methods: [] as ShippingMethod[],
  }),
  actions: {
    setMethods(methods: ShippingMethod[]) {
      this.methods = methods
      this.hydrated = true
    },
    async fetchMethods() {
      const methods = await $fetch<ShippingMethod[]>('/api/shipping')
      this.setMethods(methods)
      return methods
    },
    async saveMethods() {
      const methods = await $fetch<ShippingMethod[]>('/api/shipping', { method: 'PUT', body: this.methods })
      this.setMethods(methods)
      return methods
    },
    addMethod(method: Omit<ShippingMethod, 'id'>) {
      const newId = this.methods.length > 0 ? Math.max(...this.methods.map(m => m.id)) + 1 : 1
      this.methods.push({ ...method, id: newId })
    },
    updateMethod(id: number, updatedMethod: Partial<ShippingMethod>) {
      const index = this.methods.findIndex(m => m.id === id)
      if (index !== -1) {
        this.methods[index] = { ...this.methods[index], ...updatedMethod }
      }
    },
    deleteMethod(id: number) {
      this.methods = this.methods.filter(m => m.id !== id)
    }
  }
})
