import { createError, readBody } from 'h3'
import { requestEmailVerificationCode } from '~/server/utils/email-verification-db'
import { readSettings } from '~/server/utils/settings-db'
import { normalizeEmail, readUsers } from '~/server/utils/users-db'

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  const email = normalizeEmail(body?.email)
  const [users, settings] = await Promise.all([readUsers(), readSettings()])

  if (!settings.integrations?.emailVerificationEnabled) {
    throw createError({ statusCode: 400, statusMessage: 'Email kod doğrulaması deaktivdir' })
  }

  if (users.some((user) => normalizeEmail(user.email) === email)) {
    throw createError({ statusCode: 409, statusMessage: 'Bu email artıq qeydiyyatdan keçib' })
  }

  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  return await requestEmailVerificationCode(email, ip)
})
