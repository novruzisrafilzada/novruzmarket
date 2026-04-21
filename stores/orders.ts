import { defineStore } from 'pinia'

export interface OrderItem {
  id: number
  name: string
  price: number
  qty: number
  image?: string
  variationId?: number | null
  variationLabel?: string
}

export interface Order {
  id: string
  customer: string
  email: string
  date: string
  amount: number
  status: 'Gözləyir' | 'Təsdiqləndi' | 'Hazırlanır' | 'Göndərildi' | 'Çatdırıldı' | 'Ləğv istəyi' | 'Qaytarma istəyi' | 'İptal edildi' | 'Qaytarıldı'
  statusColor: string
  address: string
  phone: string
  paymentMethod: 'card' | 'cash'
  paymentStatus?: 'pending' | 'paid' | 'failed'
  paymentProvider?: string
  paymentSessionId?: string
  trackingCode?: string
  items?: OrderItem[]
  couponCode?: string
  discountAmount?: number
  shippingMethodId?: number
  shippingMethodName?: string
  shippingFee?: number
  shippingEta?: string
  shippingRegion?: string
  customerRequestNote?: string
  customerRequestAt?: string
  sellerStatuses?: Record<string, {
    status: 'Gözləyir' | 'Hazırlanır' | 'Göndərildi' | 'Çatdırıldı'
    updatedAt: string
  }>
}

export const useOrderStore = defineStore('orders', {
  state: () => ({
    hydrated: false,
    orders: [] as Order[],
  }),
  actions: {
    setOrders(orders: Order[]) {
      this.orders = orders
      this.hydrated = true
    },
    async fetchOrders() {
      const orders = await $fetch<Order[]>('/api/orders')
      this.setOrders(orders)
    },
    async createOrder(order: Omit<Order, 'id' | 'date' | 'status' | 'statusColor'>) {
      const created = await $fetch<Order>('/api/orders', { method: 'POST', body: order })
      this.orders.unshift(created)
      this.hydrated = true
      return created
    },
    async updateOrderStatus(id: string, status: Order['status']) {
      const updated = await $fetch<Order>(`/api/orders/${encodeURIComponent(id)}`, { method: 'PUT', body: { status } })
      const idx = this.orders.findIndex(o => o.id === updated.id)
      if (idx !== -1) this.orders[idx] = updated
      return updated
    },
    async requestOrderAction(id: string, type: 'cancel' | 'return', note?: string) {
      const updated = await $fetch<Order>(`/api/orders/${encodeURIComponent(id)}/request`, { method: 'POST', body: { type, note } })
      const idx = this.orders.findIndex(o => o.id === updated.id)
      if (idx !== -1) this.orders[idx] = updated
      return updated
    }
  }
})
