import { defineStore } from 'pinia'
import { $fetch } from 'ofetch'

export interface Coupon {
  id: number
  code: string
  discount: number
  type: 'Percentage' | 'Fixed'
  expiryDate: string
  status: 'Aktiv' | 'Deaktiv'
  minSubtotal?: number
  usageLimit?: number
  usedCount?: number
  allowedUserEmails?: string[]
}

export const useCouponStore = defineStore('coupons', {
  state: () => ({
    hydrated: false,
    coupons: [] as Coupon[],
  }),
  actions: {
    setCoupons(coupons: Coupon[]) {
      this.coupons = coupons
      this.hydrated = true
    },
    async fetchCoupons() {
      const coupons = await $fetch<Coupon[]>('/api/admin/coupons')
      this.setCoupons(coupons)
      return coupons
    },
    async addCoupon(coupon: Omit<Coupon, 'id'>) {
      const created = await $fetch<Coupon>('/api/admin/coupons', { method: 'POST', body: coupon })
      this.coupons.unshift(created)
      return created
    },
    async updateCoupon(id: number, updatedCoupon: Partial<Coupon>) {
      const updated = await $fetch<Coupon>(`/api/admin/coupons/${id}`, { method: 'PUT', body: updatedCoupon })
      const index = this.coupons.findIndex(c => c.id === id)
      if (index !== -1) this.coupons[index] = updated
      return updated
    },
    async deleteCoupon(id: number) {
      await $fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
      this.coupons = this.coupons.filter(c => c.id !== id)
    }
  }
})
