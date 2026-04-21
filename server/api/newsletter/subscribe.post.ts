import { createError, readBody } from 'h3'
import { appendLog } from '~/server/utils/logs-db'
import { readSubscribers, writeSubscribers } from '~/server/utils/newsletter-db'
import { normalizeEmail } from '~/server/utils/users-db'
import { maybeSendAutomationEmail } from '~/server/utils/email-automation'

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  const email = normalizeEmail(body?.email)
  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email' })
  }

  const subs = await readSubscribers()
  const exists = subs.find(s => normalizeEmail(s.email) === email)
  if (exists) return { ok: true }

  const maxId = subs.length > 0 ? Math.max(...subs.map(s => Number(s.id) || 0)) : 0
  const created = {
    id: maxId + 1,
    email,
    status: 'Aktiv' as const,
    createdAt: new Date().toISOString()
  }
  subs.unshift(created)
  await writeSubscribers(subs)

  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({ user: email, action: 'Newsletter abunə oldu', ip })
  await maybeSendAutomationEmail({
    kind: 'welcomeNewsletter',
    to: email,
    ip,
    vars: { email }
  })

  return { ok: true }
})
