import { resolveCategoryFilterSchema } from '~/server/utils/category-filter-templates'
import { readCategoryFilterSchemas } from '~/server/utils/category-filters-db'
import { readCategories } from '~/server/utils/categories-db'

export default defineEventHandler(async (event) => {
  const categoryId = Number(getRouterParam(event, 'categoryId'))
  if (!Number.isFinite(categoryId) || categoryId <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid categoryId' })
  }
  const [categories, schemas] = await Promise.all([
    readCategories(),
    readCategoryFilterSchemas()
  ])
  return resolveCategoryFilterSchema(categoryId, categories, schemas)
})
