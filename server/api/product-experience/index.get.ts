import { readProductExperience } from '~/server/utils/product-experience-db'

export default defineEventHandler(async () => {
  return await readProductExperience()
})
