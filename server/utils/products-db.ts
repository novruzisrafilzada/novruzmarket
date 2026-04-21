import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import seedProducts from '../data/seed-products'
import { readCategories } from '~/server/utils/categories-db'
import { readCategoryFilterSchemas } from '~/server/utils/category-filters-db'
import { resolveCategoryFilterSchema } from '~/server/utils/category-filter-templates'
import { replaceJsonFile } from '~/server/utils/json-file'

const dataDir = join(process.cwd(), '.data')
const productsPath = join(dataDir, 'products.json')

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const safeReadJson = async () => {
  try {
    const raw = await fs.readFile(productsPath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

const atomicWriteJson = async (value: unknown) => {
  await ensureDir()
  await replaceJsonFile(productsPath, value)
}

const MAX_PRODUCT_LONG_TEXT = 3000
const MAX_PRODUCT_MEDIUM_TEXT = 2500
const MAX_PRODUCT_SHORT_TEXT = 500

const clampText = (value: any, limit: number) => String(value || '').slice(0, limit).trim()

const buildAutofillAttributes = (
  product: any,
  index: number,
  categories?: any[],
  schemas?: any[]
) => {
  const existing = product?.attributes && typeof product.attributes === 'object'
    ? Object.fromEntries(Object.entries(product.attributes).map(([key, value]) => [String(key), clampText(value, MAX_PRODUCT_SHORT_TEXT)]).filter(([, value]) => Boolean(value)))
    : {}
  if (Object.keys(existing).length > 0) return existing
  if (!Array.isArray(categories) || !Array.isArray(schemas) || !Number(product?.categoryId)) return undefined
  const schema = resolveCategoryFilterSchema(Number(product.categoryId), categories as any, schemas as any)
  if (!schema?.groups?.length) return undefined

  const variationSizes = Array.isArray(product?.variations)
    ? product.variations.map((item: any) => String(item?.size || '').trim()).filter(Boolean)
    : []
  const seed = Number(product?.id || index + 1) + String(product?.brand || '').length + String(product?.name || '').length
  const attributes = schema.groups.reduce((acc: Record<string, string>, group: any, groupIndex: number) => {
    const options = Array.isArray(group?.options) ? group.options.map((item: any) => clampText(item, MAX_PRODUCT_SHORT_TEXT)).filter(Boolean) : []
    if (!options.length) return acc
    const keyLabel = `${String(group?.key || '').toLowerCase()} ${String(group?.label || '').toLowerCase()}`
    const variationMatch = variationSizes.find((size) => options.some((option) => String(option).toLowerCase() === size.toLowerCase()))
    if (variationMatch && /(olcu|size|variant|format)/.test(keyLabel)) {
      acc[String(group.key)] = variationMatch
      return acc
    }
    acc[String(group.key)] = options[(seed + groupIndex) % options.length]
    return acc
  }, {})
  return Object.keys(attributes).length ? attributes : undefined
}

const normalizeProduct = (p: any, index: number, categories?: any[], schemas?: any[]) => {
  const attributes = buildAutofillAttributes(p, index, categories, schemas)
  const featuredUntil = String(p.featuredUntil || '')
  const isFeaturedActive = String(p.featuredStatus || '') === 'Aktiv' && featuredUntil && new Date(featuredUntil).getTime() > Date.now()
  return {
    ...p,
    name: clampText(p.name, MAX_PRODUCT_SHORT_TEXT),
    category: clampText(p.category, MAX_PRODUCT_SHORT_TEXT),
    brand: clampText(p.brand, MAX_PRODUCT_SHORT_TEXT),
    description: clampText(p.description, MAX_PRODUCT_LONG_TEXT),
    descriptionI18n: p?.descriptionI18n ? {
      az: clampText(p.descriptionI18n.az, MAX_PRODUCT_LONG_TEXT),
      ru: clampText(p.descriptionI18n.ru, MAX_PRODUCT_LONG_TEXT),
      en: clampText(p.descriptionI18n.en, MAX_PRODUCT_LONG_TEXT)
    } : undefined,
    productCode: String(p.productCode || `PRD-${String(p.id || index + 1).padStart(6, '0')}`),
    viewCount: Number.isFinite(Number(p.viewCount)) ? Number(p.viewCount) : 0,
    featuredStatus: isFeaturedActive ? 'Aktiv' : String(p.featuredStatus || 'Yoxdur'),
    featuredPlanDays: Number(p.featuredPlanDays || 0),
    featuredPlanLabel: clampText(p.featuredPlanLabel, MAX_PRODUCT_SHORT_TEXT),
    featuredUntil,
    featuredBadgeText: clampText(p.featuredBadgeText || 'PRO', MAX_PRODUCT_SHORT_TEXT),
    featuredPriority: Number(p.featuredPriority || 0),
    createdAt: p.createdAt || new Date().toISOString(),
    reviewCount: Number.isFinite(Number(p.reviewCount)) ? Number(p.reviewCount) : 0,
    rating: Number.isFinite(Number(p.rating)) ? Number(p.rating) : 0,
    features: Array.isArray(p.features)
      ? p.features.map((item: any) => clampText(item, MAX_PRODUCT_SHORT_TEXT)).filter(Boolean)
      : [],
    tags: Array.isArray(p.tags)
      ? p.tags.map((item: any) => clampText(item, MAX_PRODUCT_SHORT_TEXT)).filter(Boolean)
      : [],
    attributes,
    seo: p?.seo ? {
      title: clampText(p.seo.title, MAX_PRODUCT_SHORT_TEXT),
      description: clampText(p.seo.description, MAX_PRODUCT_MEDIUM_TEXT),
      keywords: clampText(p.seo.keywords, MAX_PRODUCT_SHORT_TEXT)
    } : undefined,
    media: {
      videoUrl: String(p?.media?.videoUrl || '').trim(),
      videoPoster: String(p?.media?.videoPoster || '').trim(),
      lifestyleImages: Array.isArray(p?.media?.lifestyleImages)
        ? p.media.lifestyleImages.map((item: any) => String(item || '').trim()).filter(Boolean)
        : []
    }
  }
}

export const readProducts = async () => {
  const [categories, schemas] = await Promise.all([
    readCategories(),
    readCategoryFilterSchemas()
  ])
  const existing = await safeReadJson()
  if (existing) {
    return existing.map((p: any, index: number) => normalizeProduct(p, index, categories, schemas))
  }
  const normalizedSeed = (seedProducts as any[]).map((p: any, index: number) => normalizeProduct(p, index, categories, schemas))
  await atomicWriteJson(normalizedSeed)
  return normalizedSeed
}

export const writeProducts = async (products: unknown[]) => {
  await atomicWriteJson((products || []).map((p: any, index: number) => normalizeProduct(p, index)))
}
