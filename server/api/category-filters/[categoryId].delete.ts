import { readCategoryFilterSchemas, writeCategoryFilterSchemas } from '~/server/utils/category-filters-db'

export default defineEventHandler(async (event) => {
  const categoryId = Number(getRouterParam(event, 'categoryId'))
  if (!Number.isFinite(categoryId) || categoryId <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid categoryId' })
  }
  const schemas = await readCategoryFilterSchemas()
  const next = schemas.filter(s => Number(s.categoryId) !== categoryId)
  await writeCategoryFilterSchemas(next as any)
  return { ok: true }
})

