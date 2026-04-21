export const useQuickView = () => {
  const quickViewProductId = useState<number | null>('quick-view-product-id', () => null)

  const openQuickView = (productId: number | null | undefined) => {
    const id = Number(productId || 0)
    if (!Number.isFinite(id) || id <= 0) return
    quickViewProductId.value = id
  }

  const closeQuickView = () => {
    quickViewProductId.value = null
  }

  return {
    quickViewProductId,
    openQuickView,
    closeQuickView
  }
}
