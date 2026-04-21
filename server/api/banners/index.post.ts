import { readBody } from 'h3'
import { readBanners, writeBanners } from '~/server/utils/banners-db'
import { autoNotifyNewsletter } from '~/server/utils/newsletter-notify'

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  const banners = await readBanners()

  const maxId = banners.length > 0 ? Math.max(...banners.map((b: any) => Number(b.id) || 0)) : 0
  const created = { ...body, id: maxId + 1 }
  banners.unshift(created)
  await writeBanners(banners)
  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await autoNotifyNewsletter({
    type: 'newBanner',
    subject: `Yeni banner: ${String(created.title || '').trim()}`.trim(),
    html: `<h2>Yeni banner</h2><p><b>${String(created.title || '').trim()}</b></p><p>${String(created.subtitle || '').trim()}</p>`,
    ip
  })
  return created
})
