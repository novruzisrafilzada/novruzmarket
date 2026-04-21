import { useOrderStore } from '~/stores/orders'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const orderStore = useOrderStore()
  if (!authStore.isLoggedIn || orderStore.hydrated) return
  await orderStore.fetchOrders()
})
