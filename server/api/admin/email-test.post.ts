import { createError, readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { appendLog } from '~/server/utils/logs-db'
import { sendEmailViaResend } from '~/server/utils/mailer'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  const body = await readBody<any>(event)
  const to = String(body?.to || '').trim()
  const subject = String(body?.subject || '').trim()
  const html = String(body?.html || '').trim()

  if (!to || !to.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid to' })
  }
  if (!subject) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid subject' })
  }
  if (!html) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid html' })
  }

  await sendEmailViaResend({ to, subject, html })
  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({ user: to, action: `Email test göndərildi: ${subject}`, ip })
  return { ok: true }
})
