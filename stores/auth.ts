import { defineStore } from 'pinia'

export interface AuthUser {
  id: number
  name: string
  username?: string
  email: string
  emailVerified?: boolean
  phone?: string
  phoneVerified?: boolean
  addresses?: Array<{
    id: string
    label: string
    recipient: string
    phone: string
    city: string
    address: string
    zip?: string
    isDefault?: boolean
  }>
  role: 'Admin' | 'Müştəri' | 'Satıcı'
  status?: 'Aktiv' | 'Gözləyir' | 'Deaktiv'
  mustChangePassword?: boolean
  sellerProfile?: {
    shopName?: string
    phone?: string
    note?: string
    profileImage?: string
    coverImage?: string
    categoryIds?: number[]
    featuredStatus?: 'Yoxdur' | 'Gözləyir' | 'Aktiv' | 'Bitib'
    featuredPlanDays?: number
    featuredPlanLabel?: string
    featuredUntil?: string
    featuredBadgeText?: string
    featuredPriority?: number
    featuredPaymentStatus?: 'Gözləyir' | 'Təsdiqləndi' | 'Rədd edildi'
    featuredApprovedAt?: string
    tagline?: string
    storefrontLayout?: 'classic' | 'editorial' | 'premium'
    themeColor?: string
    campaignHeadline?: string
    heroLabel?: string
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    isLoggedIn: false,
  }),
  actions: {
    setSession(user: AuthUser | null) {
      this.user = user
      this.isLoggedIn = Boolean(user)
    },
    async login(payload: { email: string; password: string; adminOnly?: boolean }) {
      const user = await $fetch<AuthUser>('/api/auth/login', { method: 'POST', body: payload })
      this.setSession(user)
      return user
    },
    async signup(payload: { name: string; email: string; password: string; phone?: string; role?: 'Müştəri' | 'Satıcı'; sellerProfile?: { shopName?: string; phone?: string; note?: string } }) {
      const user = await $fetch<AuthUser>('/api/auth/signup', { method: 'POST', body: payload })
      this.setSession(user)
      return user
    },
    async signupWithEmailCode(payload: { name: string; email: string; code?: string; password: string; phone?: string; role?: 'Müştəri' | 'Satıcı'; sellerProfile?: { shopName?: string; phone?: string; note?: string; profileImage?: string; coverImage?: string; categoryIds?: number[] } }) {
      const user = await $fetch<AuthUser>('/api/auth/email/signup', { method: 'POST', body: payload })
      this.setSession(user)
      return user
    },
    async signupWithPhone(payload: { name: string; phone: string; code: string; password: string; email?: string }) {
      const user = await $fetch<AuthUser>('/api/auth/phone/signup', { method: 'POST', body: payload })
      this.setSession(user)
      return user
    },
    async fetchSession() {
      try {
        const user = await $fetch<AuthUser>('/api/auth/me')
        this.setSession(user)
        return user
      } catch {
        this.setSession(null)
        return null
      }
    },
    async logout() {
      try {
        await $fetch('/api/auth/logout', { method: 'POST' })
      } catch {}
      this.setSession(null)
    }
  }
})
