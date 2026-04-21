import { readShopExperience } from '~/server/utils/shop-experience-db'

export default defineEventHandler(async () => {
  return await readShopExperience()
})
