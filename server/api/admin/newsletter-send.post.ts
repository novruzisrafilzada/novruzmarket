import { createError, readBody } from 'h3'
import { appendLog } from '~/server/utils/logs-db'
import { readSubscribers } from '~/server/utils/newsletter-db'
import { sendEmailViaResend } from '~/server/utils/mailer'

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  const subject = String(body?.subject || '').trim()
  const html = String(body?.html || '').trim()
  const testTo = String(body?.testTo || '').trim()

  if (!subject || !html) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }

  const targets = testTo
    ? [testTo]
    : (await readSubscribers()).filter(s => s.status === 'Aktiv').map(s => s.email)

  let sent = 0
  const errors: string[] = []

  for (const to of targets) {
    try {
      await sendEmailViaResend({ to, subject, html })
      sent++
    } catch (e: any) {
      errors.push(String(e?.message || e))
    }
  }

  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({ user: 'Admin', action: `Newsletter göndərildi (sent: ${sent})`, ip })

  return { ok: true, sent, failed: errors.length, errors: errors.slice(0, 5) }
})

