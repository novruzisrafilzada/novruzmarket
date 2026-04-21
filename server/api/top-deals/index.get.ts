import { readTopDeals } from '~/server/utils/top-deals-db'

export default defineEventHandler(async () => {
  return await readTopDeals()
})

