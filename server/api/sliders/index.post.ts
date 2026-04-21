import { readBody } from 'h3'
import type { Slider } from '~/stores/sliders'
import { readSliders, writeSliders } from '~/server/utils/sliders-db'
import { appendLog } from '~/server/utils/logs-db'
import { autoNotifyNewsletter } from '~/server/utils/newsletter-notify'

export default defineEventHandler(async (event) => {
  const body = await readBody<Omit<Slider, 'id'>>(event)
  const sliders = await readSliders()
  const maxId = sliders.length > 0 ? Math.max(...sliders.map(s => Number(s.id) || 0)) : 0
  const created: Slider = { id: maxId + 1, ...body }
  sliders.unshift(created)
  await writeSliders(sliders)

  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({ user: 'Admin', action: `Slider əlavə olundu (${created.id})`, ip })
  await autoNotifyNewsletter({
    type: 'newSlider',
    subject: `Yeni slider: ${String(created.title || '').trim()}`.trim(),
    html: `<h2>Yeni slider</h2><p><b>${String(created.title || '').trim()}</b></p><p>${String(created.subtitle || '').trim()}</p>`,
    ip
  })

  return created
})
