import { useProductStore } from '~/stores/products'

export default defineNuxtPlugin(async () => {
  const productStore = useProductStore()
  if (productStore.hydrated && productStore.products.length > 0) return
  const fetcher = useRequestFetch()
  const products = await fetcher('/api/products')
  productStore.setProducts(products as any)
})
