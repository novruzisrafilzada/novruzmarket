import { createError, readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { appendLog } from '~/server/utils/logs-db'
import { sendSmsMessage } from '~/server/utils/sms'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  const body = await readBody<any>(event)
  const to = String(body?.to || '').trim()
  const message = String(body?.message || '').trim()

  if (!to) {
    throw createError({ statusCode: 400, statusMessage: 'Telefon nömrəsi vacibdir' })
  }
  if (!message) {
    throw createError({ statusCode: 400, statusMessage: 'Mesaj mətni vacibdir' })
  }

  await sendSmsMessage({ to, message })
  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({ user: to, action: 'SMS test göndərildi', ip })
  return { ok: true }
})
