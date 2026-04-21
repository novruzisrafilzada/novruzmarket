import { buildResolvedCategoryFilterSchemas } from '~/server/utils/category-filter-templates'
import { readCategoryFilterSchemas } from '~/server/utils/category-filters-db'
import { readCategories } from '~/server/utils/categories-db'

export default defineEventHandler(async () => {
  const [categories, schemas] = await Promise.all([
    readCategories(),
    readCategoryFilterSchemas()
  ])
  return buildResolvedCategoryFilterSchemas(categories, schemas)
})
