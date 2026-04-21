import { readBanners, writeBanners } from '~/server/utils/banners-db'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  const banners = await readBanners()
  const next = banners.filter((b: any) => Number(b.id) !== id)
  await writeBanners(next)
  return { ok: true }
})

