import { createError, readBody } from 'h3'
import { createAuthSession } from '~/server/utils/auth-session'
import { maybeSendAutomationEmail } from '~/server/utils/email-automation'
import { verifyPhoneVerificationCode } from '~/server/utils/phone-verification-db'
import { appendLog } from '~/server/utils/logs-db'
import { readSettings } from '~/server/utils/settings-db'
import { createPassword, normalizeEmail, normalizePhone, readUsers, writeUsers } from '~/server/utils/users-db'

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  const name = String(body?.name || '').trim()
  const phone = normalizePhone(body?.phone)
  const code = String(body?.code || '').trim()
  const password = String(body?.password || '')
  const email = normalizeEmail(body?.email || '')
  const settings = await readSettings()
  const verificationEnabled = Boolean(settings.integrations?.phoneVerificationEnabled)

  if (!name || !phone || password.length < 6 || (verificationEnabled && !code)) {
    throw createError({ statusCode: 400, statusMessage: 'Məlumatlar natamamdır' })
  }

  if (verificationEnabled) {
    await verifyPhoneVerificationCode(phone, code)
  }

  const users = await readUsers()
  if (users.some((user) => normalizePhone(user.phone || '') === phone)) {
    throw createError({ statusCode: 409, statusMessage: 'Bu nömrə artıq qeydiyyatdan keçib' })
  }
  if (email && users.some((user) => normalizeEmail(user.email) === email)) {
    throw createError({ statusCode: 409, statusMessage: 'Bu email artıq qeydiyyatdan keçib' })
  }

  const maxId = users.length > 0 ? Math.max(...users.map((user) => Number(user.id) || 0)) : 0
  const { salt, hash } = createPassword(password)
  const fallbackEmail = email || `phone-${phone.replace(/[^\d]/g, '')}@local.markett`

  const created = {
    id: maxId + 1,
    name,
    email: fallbackEmail,
    phone,
    phoneVerified: verificationEnabled,
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString(),
    role: 'Müştəri' as const,
    status: 'Aktiv' as const
  }

  users.unshift(created)
  await writeUsers(users)

  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({ user: phone, action: verificationEnabled ? 'Telefon kodu ilə qeydiyyat oldu' : 'Telefon kodu olmadan qeydiyyat oldu', ip })
  await createAuthSession(event, created.id)

  if (email && email.includes('@')) {
    await maybeSendAutomationEmail({
      kind: 'welcomeSignup',
      to: email,
      ip,
      vars: { name: created.name, email }
    })
  }

  return {
    id: created.id,
    name: created.name,
    email: created.email,
    emailVerified: Boolean((created as any).emailVerified),
    phone: created.phone,
    phoneVerified: created.phoneVerified,
    role: created.role,
    status: created.status
  }
})
