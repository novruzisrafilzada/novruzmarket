import { readSubscribers } from '~/server/utils/newsletter-db'

export default defineEventHandler(async () => {
  return await readSubscribers()
})

