import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import seedShopExperience from '~/data/seed-shop-experience'
import { replaceJsonFile } from '~/server/utils/json-file'
import { defaultShopExperienceSettings, type LocalizedText, type SearchHelperChip, type ShopExperienceSettings, type ShopRailConfig, type ShopProductCardPreset, type ShopProductCardSettings } from '~/stores/shopExperience'

const dataDir = join(process.cwd(), '.data')
const filePath = join(dataDir, 'shop-experience.json')

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const atomicWriteJson = async (value: unknown) => {
  await ensureDir()
  await replaceJsonFile(filePath, value)
}

const safeReadJson = async () => {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

const normalizeText = (value: any, fallback: LocalizedText): LocalizedText => ({
  az: String(value?.az || fallback.az || '').trim(),
  ru: String(value?.ru || fallback.ru || '').trim(),
  en: String(value?.en || fallback.en || '').trim()
})

const normalizeRail = (value: any, fallback: ShopRailConfig): ShopRailConfig => ({
  enabled: value?.enabled !== undefined ? Boolean(value.enabled) : fallback.enabled,
  limit: Math.max(1, Number(value?.limit || fallback.limit || 4)),
  selectionMode: value?.selectionMode === 'manual' ? 'manual' : 'auto',
  manualProductIds: Array.isArray(value?.manualProductIds)
    ? value.manualProductIds.map((item: any) => Number(item)).filter((item: number) => Number.isFinite(item) && item > 0)
    : Array.isArray(fallback.manualProductIds) ? fallback.manualProductIds : [],
  title: normalizeText(value?.title, fallback.title),
  subtitle: normalizeText(value?.subtitle, fallback.subtitle)
})

const normalizeChip = (value: any, index: number, fallback?: SearchHelperChip): SearchHelperChip => ({
  id: String(value?.id || fallback?.id || `chip-${index + 1}`).trim() || `chip-${index + 1}`,
  label: normalizeText(value?.label, fallback?.label || { az: '', ru: '', en: '' }),
  query: String(value?.query || fallback?.query || '').trim()
})

const normalizeColor = (value: any, fallback: string) => {
  const normalized = String(value || '').trim()
  return normalized || fallback
}

const normalizeProductCard = (value: any, fallback: ShopProductCardSettings): ShopProductCardSettings => ({
  layoutVariant: value?.layoutVariant === 'premium-luxe' ? 'premium-luxe' : 'classic',
  density: value?.density === 'compact' ? 'compact' : 'comfortable',
  mobileDensity: value?.mobileDensity === 'comfortable' ? 'comfortable' : 'compact',
  contentSpacing: value?.contentSpacing === 'balanced' ? 'balanced' : 'tight',
  imageFit: value?.imageFit === 'cover' ? 'cover' : 'contain',
  stylePreset: value?.stylePreset === 'outlined' ? 'outlined' : value?.stylePreset === 'elevated' ? 'elevated' : 'soft',
  cornerStyle: value?.cornerStyle === 'soft' ? 'soft' : value?.cornerStyle === 'sharp' ? 'sharp' : 'rounded',
  mediaRatio: value?.mediaRatio === 'square' ? 'square' : 'portrait',
  titleLines: value?.titleLines === 1 ? 1 : 2,
  mobileTitleLines: value?.mobileTitleLines === 2 ? 2 : 1,
  mobileMetaMode: value?.mobileMetaMode === 'rich' ? 'rich' : 'minimal',
  priceTone: value?.priceTone === 'dark' ? 'dark' : 'brand',
  primaryCtaBg: normalizeColor(value?.primaryCtaBg, fallback.primaryCtaBg),
  primaryCtaText: normalizeColor(value?.primaryCtaText, fallback.primaryCtaText),
  secondaryCtaBg: normalizeColor(value?.secondaryCtaBg, fallback.secondaryCtaBg),
  secondaryCtaText: normalizeColor(value?.secondaryCtaText, fallback.secondaryCtaText),
  secondaryCtaBorder: normalizeColor(value?.secondaryCtaBorder, fallback.secondaryCtaBorder),
  discountBadgeBg: normalizeColor(value?.discountBadgeBg, fallback.discountBadgeBg),
  discountBadgeText: normalizeColor(value?.discountBadgeText, fallback.discountBadgeText),
  newBadgeBg: normalizeColor(value?.newBadgeBg, fallback.newBadgeBg),
  newBadgeText: normalizeColor(value?.newBadgeText, fallback.newBadgeText),
  stockBadgeBg: normalizeColor(value?.stockBadgeBg, fallback.stockBadgeBg),
  stockBadgeText: normalizeColor(value?.stockBadgeText, fallback.stockBadgeText),
  stockBadgeBorder: normalizeColor(value?.stockBadgeBorder, fallback.stockBadgeBorder),
  outOfStockBadgeBg: normalizeColor(value?.outOfStockBadgeBg, fallback.outOfStockBadgeBg),
  outOfStockBadgeText: normalizeColor(value?.outOfStockBadgeText, fallback.outOfStockBadgeText),
  lowStockText: normalizeColor(value?.lowStockText, fallback.lowStockText),
  showDiscountBadge: value?.showDiscountBadge !== undefined ? Boolean(value.showDiscountBadge) : fallback.showDiscountBadge,
  showFeaturedBadge: value?.showFeaturedBadge !== undefined ? Boolean(value.showFeaturedBadge) : fallback.showFeaturedBadge,
  showNewBadge: value?.showNewBadge !== undefined ? Boolean(value.showNewBadge) : fallback.showNewBadge,
  showBrandBadge: value?.showBrandBadge !== undefined ? Boolean(value.showBrandBadge) : fallback.showBrandBadge,
  showViewCount: value?.showViewCount !== undefined ? Boolean(value.showViewCount) : fallback.showViewCount,
  showSellerName: value?.showSellerName !== undefined ? Boolean(value.showSellerName) : fallback.showSellerName,
  showSellerScore: value?.showSellerScore !== undefined ? Boolean(value.showSellerScore) : fallback.showSellerScore,
  showCategoryChip: value?.showCategoryChip !== undefined ? Boolean(value.showCategoryChip) : fallback.showCategoryChip,
  showRating: value?.showRating !== undefined ? Boolean(value.showRating) : fallback.showRating,
  showReviewCount: value?.showReviewCount !== undefined ? Boolean(value.showReviewCount) : fallback.showReviewCount,
  showSoldCount: value?.showSoldCount !== undefined ? Boolean(value.showSoldCount) : fallback.showSoldCount,
  showStockBadge: value?.showStockBadge !== undefined ? Boolean(value.showStockBadge) : fallback.showStockBadge,
  showLowStockText: value?.showLowStockText !== undefined ? Boolean(value.showLowStockText) : fallback.showLowStockText,
  showWishlistAction: value?.showWishlistAction !== undefined ? Boolean(value.showWishlistAction) : fallback.showWishlistAction,
  showCompareAction: value?.showCompareAction !== undefined ? Boolean(value.showCompareAction) : fallback.showCompareAction,
  showQuickViewAction: value?.showQuickViewAction !== undefined ? Boolean(value.showQuickViewAction) : fallback.showQuickViewAction,
  showSecondaryCta: value?.showSecondaryCta !== undefined ? Boolean(value.showSecondaryCta) : fallback.showSecondaryCta,
  showMobileSellerName: value?.showMobileSellerName !== undefined ? Boolean(value.showMobileSellerName) : fallback.showMobileSellerName,
  showMobileRating: value?.showMobileRating !== undefined ? Boolean(value.showMobileRating) : fallback.showMobileRating,
  showMobileReviewCount: value?.showMobileReviewCount !== undefined ? Boolean(value.showMobileReviewCount) : fallback.showMobileReviewCount,
  showMobileSoldCount: value?.showMobileSoldCount !== undefined ? Boolean(value.showMobileSoldCount) : fallback.showMobileSoldCount,
  showMobileStockBadge: value?.showMobileStockBadge !== undefined ? Boolean(value.showMobileStockBadge) : fallback.showMobileStockBadge,
  showMobileWishlistAction: value?.showMobileWishlistAction !== undefined ? Boolean(value.showMobileWishlistAction) : fallback.showMobileWishlistAction,
  showMobileQuickViewAction: value?.showMobileQuickViewAction !== undefined ? Boolean(value.showMobileQuickViewAction) : fallback.showMobileQuickViewAction
})

const normalizeProductCardPreset = (value: any, fallback: ShopProductCardPreset): ShopProductCardPreset => ({
  id: String(value?.id || fallback.id || '').trim() || fallback.id,
  name: normalizeText(value?.name, fallback.name),
  description: normalizeText(value?.description, fallback.description),
  settings: normalizeProductCard(value?.settings, fallback.settings)
})

const normalizeConfig = (value: any): ShopExperienceSettings => {
  const fallback = defaultShopExperienceSettings()
  const presetFallbacks = fallback.productCardPresets
  const incomingPresets = Array.isArray(value?.productCardPresets) ? value.productCardPresets : []
  const normalizedPresets = presetFallbacks.map((preset) => {
    const matched = incomingPresets.find((item: any) => String(item?.id || '') === preset.id)
    return normalizeProductCardPreset(matched, preset)
  })
  const normalizedActivePresetId = normalizedPresets.some((preset) => preset.id === value?.activeProductCardPresetId)
    ? String(value?.activeProductCardPresetId)
    : fallback.activeProductCardPresetId
  return {
    stickyFiltersEnabled: value?.stickyFiltersEnabled !== undefined ? Boolean(value.stickyFiltersEnabled) : fallback.stickyFiltersEnabled,
    compareEnabled: value?.compareEnabled !== undefined ? Boolean(value.compareEnabled) : fallback.compareEnabled,
    compareMaxItems: Math.min(4, Math.max(2, Number(value?.compareMaxItems || fallback.compareMaxItems))),
    sellerTrustEnabled: value?.sellerTrustEnabled !== undefined ? Boolean(value.sellerTrustEnabled) : fallback.sellerTrustEnabled,
    hybridPaginationEnabled: value?.hybridPaginationEnabled !== undefined ? Boolean(value.hybridPaginationEnabled) : fallback.hybridPaginationEnabled,
    mobileLoadMoreStep: Math.max(4, Number(value?.mobileLoadMoreStep || fallback.mobileLoadMoreStep)),
    searchHelperEnabled: value?.searchHelperEnabled !== undefined ? Boolean(value.searchHelperEnabled) : fallback.searchHelperEnabled,
    searchHelperTitle: normalizeText(value?.searchHelperTitle, fallback.searchHelperTitle),
    emptyStateTitle: normalizeText(value?.emptyStateTitle, fallback.emptyStateTitle),
    emptyStateDescription: normalizeText(value?.emptyStateDescription, fallback.emptyStateDescription),
    emptyStateCta: normalizeText(value?.emptyStateCta, fallback.emptyStateCta),
    searchHelperChips: Array.isArray(value?.searchHelperChips) && value.searchHelperChips.length
      ? value.searchHelperChips.map((item: any, index: number) => normalizeChip(item, index))
      : fallback.searchHelperChips,
    topSellers: normalizeRail(value?.topSellers, fallback.topSellers),
    trendNow: normalizeRail(value?.trendNow, fallback.trendNow),
    newArrivals: normalizeRail(value?.newArrivals, fallback.newArrivals),
    recentlyViewed: normalizeRail(value?.recentlyViewed, fallback.recentlyViewed),
    priceDrops: normalizeRail(value?.priceDrops, fallback.priceDrops),
    topRated: normalizeRail(value?.topRated, fallback.topRated),
    alertsEnabled: value?.alertsEnabled !== undefined ? Boolean(value.alertsEnabled) : fallback.alertsEnabled,
    alertTitle: normalizeText(value?.alertTitle, fallback.alertTitle),
    alertDescription: normalizeText(value?.alertDescription, fallback.alertDescription),
    activeProductCardPresetId: normalizedActivePresetId,
    productCardPresets: normalizedPresets,
    productCard: normalizeProductCard(value?.productCard, fallback.productCard)
  }
}

export const readShopExperience = async (): Promise<ShopExperienceSettings> => {
  const existing = await safeReadJson()
  if (existing) {
    const normalized = normalizeConfig(existing)
    await atomicWriteJson(normalized)
    return normalized
  }
  const fresh = normalizeConfig(seedShopExperience)
  await atomicWriteJson(fresh)
  return fresh
}

export const writeShopExperience = async (value: ShopExperienceSettings) => {
  const normalized = normalizeConfig(value)
  await atomicWriteJson(normalized)
  return normalized
}
