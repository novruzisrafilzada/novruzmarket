import { readCategories } from '~/server/utils/categories-db'

export default defineEventHandler(async () => {
  return await readCategories()
})

