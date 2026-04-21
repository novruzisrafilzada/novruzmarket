import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import seedHomeSections from '~/data/seed-home-sections'
import { replaceJsonFile } from '~/server/utils/json-file'

const dataDir = join(process.cwd(), '.data')
const homePath = join(dataDir, 'home-sections.json')

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const safeReadJson = async () => {
  try {
    const raw = await fs.readFile(homePath, 'utf8')
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

const atomicWriteJson = async (value: unknown) => {
  await ensureDir()
  await replaceJsonFile(homePath, value)
}

export const readHomeSections = async () => {
  const existing = await safeReadJson()
  if (existing) {
    const ex: any = existing
    const seed: any = seedHomeSections
    return {
      ...seed,
      ...ex,
      ui: { ...seed.ui, ...(ex.ui || {}) },
      promoStrip: {
        ...seed.promoStrip,
        ...(ex.promoStrip || {}),
        speedSec: Number(ex.promoStrip?.speedSec ?? seed.promoStrip.speedSec),
        itemsI18n: Array.isArray(ex.promoStrip?.itemsI18n) ? ex.promoStrip.itemsI18n : seed.promoStrip.itemsI18n
      },
      news: { ...seed.news, ...(ex.news || {}), titleI18n: { ...seed.news.titleI18n, ...(ex.news?.titleI18n || {}) }, badgeI18n: { ...seed.news.badgeI18n, ...(ex.news?.badgeI18n || {}) } },
      topSelling: { ...seed.topSelling, ...(ex.topSelling || {}), titleI18n: { ...seed.topSelling.titleI18n, ...(ex.topSelling?.titleI18n || {}) } },
      topProducts: { ...seed.topProducts, ...(ex.topProducts || {}), titleI18n: { ...seed.topProducts.titleI18n, ...(ex.topProducts?.titleI18n || {}) } },
      featuredCategories: {
        ...seed.featuredCategories,
        ...(ex.featuredCategories || {}),
        titleI18n: { ...seed.featuredCategories.titleI18n, ...(ex.featuredCategories?.titleI18n || {}) },
        subtitleI18n: { ...seed.featuredCategories.subtitleI18n, ...(ex.featuredCategories?.subtitleI18n || {}) }
      },
      featuredSellers: {
        ...seed.featuredSellers,
        ...(ex.featuredSellers || {}),
        titleI18n: { ...seed.featuredSellers.titleI18n, ...(ex.featuredSellers?.titleI18n || {}) },
        subtitleI18n: { ...seed.featuredSellers.subtitleI18n, ...(ex.featuredSellers?.subtitleI18n || {}) }
      },
      sellerProducts: {
        ...seed.sellerProducts,
        ...(ex.sellerProducts || {}),
        titleI18n: { ...seed.sellerProducts.titleI18n, ...(ex.sellerProducts?.titleI18n || {}) },
        subtitleI18n: { ...seed.sellerProducts.subtitleI18n, ...(ex.sellerProducts?.subtitleI18n || {}) }
      },
      trendingNow: {
        ...seed.trendingNow,
        ...(ex.trendingNow || {}),
        titleI18n: { ...seed.trendingNow.titleI18n, ...(ex.trendingNow?.titleI18n || {}) },
        subtitleI18n: { ...seed.trendingNow.subtitleI18n, ...(ex.trendingNow?.subtitleI18n || {}) }
      },
      popularSearches: {
        ...seed.popularSearches,
        ...(ex.popularSearches || {}),
        titleI18n: { ...seed.popularSearches.titleI18n, ...(ex.popularSearches?.titleI18n || {}) },
        subtitleI18n: { ...seed.popularSearches.subtitleI18n, ...(ex.popularSearches?.subtitleI18n || {}) }
      },
      shopByBudget: {
        ...seed.shopByBudget,
        ...(ex.shopByBudget || {}),
        titleI18n: { ...seed.shopByBudget.titleI18n, ...(ex.shopByBudget?.titleI18n || {}) },
        subtitleI18n: { ...seed.shopByBudget.subtitleI18n, ...(ex.shopByBudget?.subtitleI18n || {}) },
        cards: Array.isArray(ex.shopByBudget?.cards) ? ex.shopByBudget.cards : seed.shopByBudget.cards
      },
      bestRatedProducts: {
        ...seed.bestRatedProducts,
        ...(ex.bestRatedProducts || {}),
        titleI18n: { ...seed.bestRatedProducts.titleI18n, ...(ex.bestRatedProducts?.titleI18n || {}) },
        subtitleI18n: { ...seed.bestRatedProducts.subtitleI18n, ...(ex.bestRatedProducts?.subtitleI18n || {}) }
      },
      shopByBrand: {
        ...seed.shopByBrand,
        ...(ex.shopByBrand || {}),
        titleI18n: { ...seed.shopByBrand.titleI18n, ...(ex.shopByBrand?.titleI18n || {}) },
        subtitleI18n: { ...seed.shopByBrand.subtitleI18n, ...(ex.shopByBrand?.subtitleI18n || {}) },
        cards: Array.isArray(ex.shopByBrand?.cards) ? ex.shopByBrand.cards : seed.shopByBrand.cards
      },
      frequentlyBoughtTogether: {
        ...seed.frequentlyBoughtTogether,
        ...(ex.frequentlyBoughtTogether || {}),
        titleI18n: { ...seed.frequentlyBoughtTogether.titleI18n, ...(ex.frequentlyBoughtTogether?.titleI18n || {}) },
        subtitleI18n: { ...seed.frequentlyBoughtTogether.subtitleI18n, ...(ex.frequentlyBoughtTogether?.subtitleI18n || {}) }
      },
      sellerTrustMetrics: {
        ...seed.sellerTrustMetrics,
        ...(ex.sellerTrustMetrics || {}),
        titleI18n: { ...seed.sellerTrustMetrics.titleI18n, ...(ex.sellerTrustMetrics?.titleI18n || {}) },
        subtitleI18n: { ...seed.sellerTrustMetrics.subtitleI18n, ...(ex.sellerTrustMetrics?.subtitleI18n || {}) }
      },
      flashDeals: {
        ...seed.flashDeals,
        ...(ex.flashDeals || {}),
        titleI18n: { ...seed.flashDeals.titleI18n, ...(ex.flashDeals?.titleI18n || {}) },
        subtitleI18n: { ...seed.flashDeals.subtitleI18n, ...(ex.flashDeals?.subtitleI18n || {}) },
        ctaLabelI18n: { ...seed.flashDeals.ctaLabelI18n, ...(ex.flashDeals?.ctaLabelI18n || {}) }
      },
      verifiedSellers: {
        ...seed.verifiedSellers,
        ...(ex.verifiedSellers || {}),
        titleI18n: { ...seed.verifiedSellers.titleI18n, ...(ex.verifiedSellers?.titleI18n || {}) },
        subtitleI18n: { ...seed.verifiedSellers.subtitleI18n, ...(ex.verifiedSellers?.subtitleI18n || {}) }
      },
      buyerProtection: {
        ...seed.buyerProtection,
        ...(ex.buyerProtection || {}),
        titleI18n: { ...seed.buyerProtection.titleI18n, ...(ex.buyerProtection?.titleI18n || {}) },
        subtitleI18n: { ...seed.buyerProtection.subtitleI18n, ...(ex.buyerProtection?.subtitleI18n || {}) },
        items: Array.isArray(ex.buyerProtection?.items) ? ex.buyerProtection.items : seed.buyerProtection.items
      },
      marketHighlights: {
        ...seed.marketHighlights,
        ...(ex.marketHighlights || {}),
        titleI18n: { ...seed.marketHighlights.titleI18n, ...(ex.marketHighlights?.titleI18n || {}) },
        subtitleI18n: { ...seed.marketHighlights.subtitleI18n, ...(ex.marketHighlights?.subtitleI18n || {}) }
      },
      recentlyViewed: { ...seed.recentlyViewed, ...(ex.recentlyViewed || {}), titleI18n: { ...seed.recentlyViewed.titleI18n, ...(ex.recentlyViewed?.titleI18n || {}) } },
      experienceBuilder: {
        ...seed.experienceBuilder,
        ...(ex.experienceBuilder || {}),
        sectionOrder: Array.isArray(ex.experienceBuilder?.sectionOrder) && ex.experienceBuilder.sectionOrder.length > 0 ? ex.experienceBuilder.sectionOrder : seed.experienceBuilder.sectionOrder
      },
      campaignBlocks: Array.isArray(ex.campaignBlocks) ? ex.campaignBlocks : seed.campaignBlocks,
      storytelling: {
        ...seed.storytelling,
        ...(ex.storytelling || {}),
        newArrivals: { ...seed.storytelling.newArrivals, ...(ex.storytelling?.newArrivals || {}), titleI18n: { ...seed.storytelling.newArrivals.titleI18n, ...(ex.storytelling?.newArrivals?.titleI18n || {}) }, subtitleI18n: { ...seed.storytelling.newArrivals.subtitleI18n, ...(ex.storytelling?.newArrivals?.subtitleI18n || {}) } },
        trending: { ...seed.storytelling.trending, ...(ex.storytelling?.trending || {}), titleI18n: { ...seed.storytelling.trending.titleI18n, ...(ex.storytelling?.trending?.titleI18n || {}) }, subtitleI18n: { ...seed.storytelling.trending.subtitleI18n, ...(ex.storytelling?.trending?.subtitleI18n || {}) } },
        weeklyPick: { ...seed.storytelling.weeklyPick, ...(ex.storytelling?.weeklyPick || {}), titleI18n: { ...seed.storytelling.weeklyPick.titleI18n, ...(ex.storytelling?.weeklyPick?.titleI18n || {}) }, subtitleI18n: { ...seed.storytelling.weeklyPick.subtitleI18n, ...(ex.storytelling?.weeklyPick?.subtitleI18n || {}) } },
        editorsPick: { ...seed.storytelling.editorsPick, ...(ex.storytelling?.editorsPick || {}), titleI18n: { ...seed.storytelling.editorsPick.titleI18n, ...(ex.storytelling?.editorsPick?.titleI18n || {}) }, subtitleI18n: { ...seed.storytelling.editorsPick.subtitleI18n, ...(ex.storytelling?.editorsPick?.subtitleI18n || {}) } }
      },
      lookbook: {
        ...seed.lookbook,
        ...(ex.lookbook || {}),
        titleI18n: { ...seed.lookbook.titleI18n, ...(ex.lookbook?.titleI18n || {}) },
        subtitleI18n: { ...seed.lookbook.subtitleI18n, ...(ex.lookbook?.subtitleI18n || {}) },
        blocks: Array.isArray(ex.lookbook?.blocks) ? ex.lookbook.blocks : seed.lookbook.blocks
      },
      ugcShowcase: {
        ...seed.ugcShowcase,
        ...(ex.ugcShowcase || {}),
        titleI18n: { ...seed.ugcShowcase.titleI18n, ...(ex.ugcShowcase?.titleI18n || {}) },
        subtitleI18n: { ...seed.ugcShowcase.subtitleI18n, ...(ex.ugcShowcase?.subtitleI18n || {}) },
        cards: Array.isArray(ex.ugcShowcase?.cards) ? ex.ugcShowcase.cards : seed.ugcShowcase.cards
      }
    }
  }
  await atomicWriteJson(seedHomeSections)
  return seedHomeSections
}

export const writeHomeSections = async (value: unknown) => {
  await atomicWriteJson(value)
}
