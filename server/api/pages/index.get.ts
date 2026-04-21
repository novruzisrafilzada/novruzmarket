import { readPages } from '~/server/utils/pages-db'

export default defineEventHandler(async () => {
  return await readPages()
})

