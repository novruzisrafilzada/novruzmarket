import { createError, readBody } from 'h3'
import { readBanners, writeBanners } from '~/server/utils/banners-db'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  const body = await readBody<any>(event)
  const banners = await readBanners()

  const idx = banners.findIndex((b: any) => Number(b.id) === id)
  if (idx === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Banner not found' })
  }

  banners[idx] = { ...banners[idx], ...body, id }
  await writeBanners(banners)
  return banners[idx]
})
