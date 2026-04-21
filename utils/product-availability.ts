export type ProductVariationLike = {
  id?: number
  stock?: number | string | null
}

export type ProductAvailabilityLike = {
  stock?: number | string | null
  variations?: ProductVariationLike[] | null
}

export const getSelectedVariation = (product: ProductAvailabilityLike, selectedVariationId: number | null) => {
  if (!selectedVariationId) return null
  return product.variations?.find((item) => Number(item?.id || 0) === Number(selectedVariationId)) || null
}

export const getEffectiveProductStock = (product: ProductAvailabilityLike, selectedVariationId: number | null) => {
  const selectedVariation = getSelectedVariation(product, selectedVariationId)
  if (selectedVariation) return Math.max(0, Number(selectedVariation.stock || 0))
  return Math.max(0, Number(product.stock || 0))
}

export const requiresVariationSelection = (product: ProductAvailabilityLike) =>
  Array.isArray(product.variations) && product.variations.length > 0

export const canAddProductToCart = (product: ProductAvailabilityLike, selectedVariationId: number | null) => {
  if (requiresVariationSelection(product) && !selectedVariationId) return false
  return getEffectiveProductStock(product, selectedVariationId) > 0
}

export const getCartDisabledReason = (product: ProductAvailabilityLike, selectedVariationId: number | null) => {
  if (requiresVariationSelection(product) && !selectedVariationId) return 'Ölçü seçin'
  if (getEffectiveProductStock(product, selectedVariationId) <= 0) return 'Məhsul bitib'
  return ''
}
