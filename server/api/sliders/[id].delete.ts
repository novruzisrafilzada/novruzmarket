import { readSliders, writeSliders } from '~/server/utils/sliders-db'
import { appendLog } from '~/server/utils/logs-db'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  const sliders = await readSliders()
  const next = sliders.filter(s => Number(s.id) !== id)
  await writeSliders(next)

  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({ user: 'Admin', action: `Slider silindi (${id})`, ip })

  return { ok: true }
})

