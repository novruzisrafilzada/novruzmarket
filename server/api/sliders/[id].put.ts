import { createError, readBody } from 'h3'
import type { Slider } from '~/stores/sliders'
import { readSliders, writeSliders } from '~/server/utils/sliders-db'
import { appendLog } from '~/server/utils/logs-db'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  const patch = await readBody<Partial<Slider>>(event)
  const sliders = await readSliders()
  const idx = sliders.findIndex(s => Number(s.id) === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'Slider not found' })

  sliders[idx] = { ...sliders[idx], ...patch, id }
  await writeSliders(sliders)

  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({ user: 'Admin', action: `Slider yeniləndi (${id})`, ip })

  return sliders[idx]
})

