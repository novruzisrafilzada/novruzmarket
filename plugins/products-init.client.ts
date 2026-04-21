import { useProductStore } from '~/stores/products'

export default defineNuxtPlugin(async () => {
  const productStore = useProductStore()
  if (productStore.hydrated && productStore.products.length > 0) return
  await productStore.fetchProducts()
})
