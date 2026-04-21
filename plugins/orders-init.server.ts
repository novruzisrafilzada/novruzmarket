import { useOrderStore } from '~/stores/orders'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const orderStore = useOrderStore()
  if (!authStore.isLoggedIn || orderStore.hydrated) return
  const fetcher = useRequestFetch()
  const orders = await fetcher('/api/orders')
  orderStore.setOrders(orders as any)
})
