import { readBanners } from '~/server/utils/banners-db'

export default defineEventHandler(async () => {
  return await readBanners()
})

