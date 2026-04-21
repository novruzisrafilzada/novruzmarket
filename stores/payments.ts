import { defineStore } from 'pinia'

export interface PaymentMethod {
  id: number
  name: string
  provider: string
  status: 'Aktiv' | 'Deaktiv'
}

export const usePaymentStore = defineStore('payments', {
  state: () => ({
    methods: [
      { id: 1, name: 'Bank Kartı', provider: 'Stripe / Kapital Bank', status: 'Aktiv' },
      { id: 2, name: 'Nağd Ödəniş', provider: 'Qapıda ödəniş', status: 'Aktiv' },
      { id: 3, name: 'Elektron Pulqabı', provider: 'm10 / Portmanat', status: 'Deaktiv' }
    ] as PaymentMethod[],
  }),
  actions: {
    addMethod(method: Omit<PaymentMethod, 'id'>) {
      const newId = this.methods.length > 0 ? Math.max(...this.methods.map(m => m.id)) + 1 : 1
      this.methods.push({ ...method, id: newId })
    },
    updateMethod(id: number, updatedMethod: Partial<PaymentMethod>) {
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
