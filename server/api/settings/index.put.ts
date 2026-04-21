import { readBody } from 'h3'
import type { SiteSettings } from '~/stores/settings'
import { getRequestUser } from '~/server/utils/auth-session'
import { readSettings, writeSettings } from '~/server/utils/settings-db'
import { appendLog } from '~/server/utils/logs-db'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  const patch = await readBody<Partial<SiteSettings>>(event)
  const current = await readSettings()
  const next = { ...current, ...patch } as SiteSettings
  await writeSettings(next)

  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({ user: 'Admin', action: 'Sistem ayarları yeniləndi', ip })

  return next
})
