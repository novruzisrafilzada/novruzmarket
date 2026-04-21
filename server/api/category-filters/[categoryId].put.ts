import { readBody } from 'h3'
import { readCategories } from '~/server/utils/categories-db'
import { readCategoryFilterSchemas, writeCategoryFilterSchemas, type CategoryFilterGroup, type CategoryFilterSchema } from '~/server/utils/category-filters-db'

const normalizeKey = (raw: string) => {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04FF\u00C0-\u017F\u0180-\u024F\u0600-\u06FF]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const normalizeGroup = (raw: any): CategoryFilterGroup | null => {
  if (!raw || typeof raw !== 'object') return null
  const label = String(raw.label || '').trim()
  const key = normalizeKey(raw.key || label)
  if (!label || !key) return null
  const optionsRaw = Array.isArray(raw.options) ? raw.options : []
  const options = Array.from(new Set(optionsRaw.map(v => String(v || '').trim()).filter(Boolean)))
  if (options.length === 0) return null
  return { key, label, options }
}

export default defineEventHandler(async (event) => {
  const categoryId = Number(getRouterParam(event, 'categoryId'))
  if (!Number.isFinite(categoryId) || categoryId <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid categoryId' })
  }
  const categories = await readCategories()
  if (!categories.some(c => c.id === categoryId)) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }

  const body = await readBody<any>(event)
  const groupsRaw = Array.isArray(body?.groups) ? body.groups : []
  const groups = groupsRaw.map(normalizeGroup).filter(Boolean) as CategoryFilterGroup[]
  const uniqueByKey = new Map<string, CategoryFilterGroup>()
  for (const g of groups) {
    if (!uniqueByKey.has(g.key)) uniqueByKey.set(g.key, g)
  }

  const schemas = await readCategoryFilterSchemas()
  const nextSchema: CategoryFilterSchema = {
    categoryId,
    groups: Array.from(uniqueByKey.values()),
    updatedAt: new Date().toISOString()
  }
  const next = schemas.filter(s => Number(s.categoryId) !== categoryId)
  next.push(nextSchema)
  await writeCategoryFilterSchemas(next as any)
  return nextSchema
})

