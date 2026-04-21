import { defineStore } from 'pinia'
import { $fetch } from 'ofetch'
import { useToastStore } from '~/stores/toast'
import { useT } from '~/composables/useT'

interface CartItem {
  cartKey: string
  id: number
  name: string
  price: number
  quantity: number
  image: string
  stock?: number
  variationId?: number | null
  variationLabel?: string
}

const resolveVariationId = (product: any) => {
  const raw = product?.variation?.id
  const id = Number(raw)
  return Number.isFinite(id) && id > 0 ? id : null
}

const resolveVariationLabel = (product: any) => {
  const size = String(product?.variation?.size || '').trim()
  const unit = String(product?.variation?.unit || '').trim()
  return [size, unit].filter(Boolean).join(' ') || ''
}

const resolveCartKey = (product: any) => `${Number(product?.id || 0)}:${resolveVariationId(product) || 0}`
const normalizeStock = (product: any) => {
  const raw = product?.variation?.stock ?? product?.stock
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : null
}

const clampRequestedQty = (requested: number, stock: number | null) => {
  if (stock === null) return requested
  return Math.max(1, Math.min(stock, requested))
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    couponCode: '',
    discountAmount: 0,
  }),
  getters: {
    totalItems: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: (state) => state.items.reduce((total, item) => total + (item.price * item.quantity), 0),
    grandTotal: (state) => {
      const subtotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
      return Math.max(0, subtotal - Number(state.discountAmount || 0))
    }
  },
  actions: {
    addToCart(product: any, quantity = 1) {
      const toastStore = useToastStore()
      const { t } = useT()
      const cartKey = resolveCartKey(product)
      const existingItem = this.items.find(item => item.cartKey === cartKey)
      const stock = normalizeStock(product)
      const qty = clampRequestedQty(Math.max(1, Math.floor(Number(quantity) || 1)), stock)
      if (stock !== null && stock <= 0) {
        toastStore.error(String(t('out_of_stock')))
        return false
      }
      if (existingItem) {
        existingItem.quantity = clampRequestedQty(existingItem.quantity + qty, stock)
      } else {
        this.items.push({
          ...product,
          cartKey,
          quantity: qty,
          stock: stock ?? undefined,
          variationId: resolveVariationId(product),
          variationLabel: resolveVariationLabel(product)
        })
      }
      this.removeCoupon()
      toastStore.success(t('added_to_cart'))
      return true
    },
    increaseQuantity(productIdOrKey: number | string, variationId?: number | null) {
      const key = typeof productIdOrKey === 'string' ? productIdOrKey : `${Number(productIdOrKey || 0)}:${Number(variationId || 0)}`
      const item = this.items.find(i => i.cartKey === key)
      if (item) {
        const maxQty = normalizeStock(item)
        item.quantity = clampRequestedQty(item.quantity + 1, maxQty)
        this.removeCoupon()
      }
    },
    decreaseQuantity(productIdOrKey: number | string, variationId?: number | null) {
      const key = typeof productIdOrKey === 'string' ? productIdOrKey : `${Number(productIdOrKey || 0)}:${Number(variationId || 0)}`
      const item = this.items.find(i => i.cartKey === key)
      if (!item) return
      item.quantity--
      if (item.quantity <= 0) this.removeFromCart(key)
      else this.removeCoupon()
    },
    removeFromCart(productIdOrKey: number | string, variationId?: number | null) {
      const key = typeof productIdOrKey === 'string' ? productIdOrKey : `${Number(productIdOrKey || 0)}:${Number(variationId || 0)}`
      this.items = this.items.filter(item => item.cartKey !== key)
      this.removeCoupon()
    },
    async applyCoupon(code: string) {
      const toastStore = useToastStore()
      const { t } = useT()
      const raw = String(code || '').trim().toUpperCase()
      if (!raw) {
        toastStore.error(t('required_fields'))
        return false
      }
      try {
        const result = await $fetch<{ code: string; discountAmount: number }>('/api/coupons/validate', {
          method: 'POST',
          body: {
            code: raw,
            items: this.items.map((item) => ({
              id: item.id,
              price: item.price,
              qty: item.quantity
            }))
          }
        })
        this.couponCode = result.code
        this.discountAmount = Number(result.discountAmount || 0)
        toastStore.success('Kupon tətbiq olundu')
        return true
      } catch (error: any) {
        toastStore.error(error?.data?.message || 'Kupon tətbiq olunmadı')
        return false
      }
    },
    removeCoupon() {
      this.couponCode = ''
      this.discountAmount = 0
    },
    clearCart() {
      this.items = []
      this.couponCode = ''
      this.discountAmount = 0
    }
  }
})
