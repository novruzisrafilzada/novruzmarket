import { describe, expect, it } from 'vitest'
import { getPlacementBanners, getStandaloneMiddleBanners } from '../utils/homepage-layout'
import { canAddProductToCart, getCartDisabledReason, getEffectiveProductStock } from '../utils/product-availability'
import { getVisibleSellerProducts } from '../utils/seller-products'
import { resolveShopViewMode } from '../utils/shop-state'

describe('critical homepage and commerce flows', () => {
  it('assigns unplaced middle banners to fallback placement without duplicating standalone middle banners', () => {
    const banners = [
      { id: 1, status: 'Aktiv', position: 'Middle', homePlacement: 'afterFeatures' },
      { id: 2, status: 'Aktiv', position: 'Middle' },
      { id: 3, status: 'Aktiv', position: 'Middle', homePlacement: 'afterTopDeals' }
    ]

    expect(getPlacementBanners(banners, 'afterFeatures', 'carousel', 'afterFeatures').map((item) => item.id)).toEqual([1, 2])
    expect(getStandaloneMiddleBanners(banners, 3, 'afterFeatures').map((item) => item.id)).toEqual([])
    expect(getPlacementBanners(banners, 'afterTopDeals', 'carousel', 'afterFeatures').map((item) => item.id)).toEqual([3])
  })

  it('uses selected variation stock instead of base product stock', () => {
    const product = {
      stock: 10,
      variations: [
        { id: 1, stock: 0 },
        { id: 2, stock: 4 }
      ]
    }

    expect(getEffectiveProductStock(product, 1)).toBe(0)
    expect(canAddProductToCart(product, 1)).toBe(false)
    expect(getCartDisabledReason(product, 1)).toBe('Məhsul bitib')
    expect(canAddProductToCart(product, 2)).toBe(true)
  })

  it('requires variation selection before add to cart', () => {
    const product = {
      stock: 12,
      variations: [{ id: 8, stock: 5 }]
    }

    expect(canAddProductToCart(product, null)).toBe(false)
    expect(getCartDisabledReason(product, null)).toBe('Ölçü seçin')
  })

  it('resolves invalid or empty shop view mode back to grid', () => {
    expect(resolveShopViewMode('list')).toBe('list')
    expect(resolveShopViewMode('grid')).toBe('grid')
    expect(resolveShopViewMode('')).toBe('grid')
    expect(resolveShopViewMode(undefined)).toBe('grid')
    expect(resolveShopViewMode('table')).toBe('grid')
  })

  it('shows only active seller products and keeps featured priority sorting', () => {
    const products = [
      { id: 1, sellerId: 9, status: 'Aktiv', featuredStatus: 'Passiv', featuredPriority: 0 },
      { id: 2, sellerId: 4, status: 'Aktiv', featuredStatus: 'Aktiv', featuredPriority: 5 },
      { id: 3, sellerId: 7, status: 'Passiv', featuredStatus: 'Aktiv', featuredPriority: 99 },
      { id: 4, sellerId: 0, status: 'Aktiv', featuredStatus: 'Aktiv', featuredPriority: 10 }
    ]

    expect(getVisibleSellerProducts(products, 8).map((item: any) => item.id)).toEqual([2, 1])
  })
})
