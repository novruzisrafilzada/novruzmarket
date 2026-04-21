import { readHomeSections } from '~/server/utils/home-sections-db'

export default defineEventHandler(async () => {
  return await readHomeSections()
})

