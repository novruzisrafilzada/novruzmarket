import { createError, readBody } from 'h3'
import { requestPhoneVerificationCode } from '~/server/utils/phone-verification-db'
import { readSettings } from '~/server/utils/settings-db'
import { normalizePhone, readUsers } from '~/server/utils/users-db'

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  const phone = normalizePhone(body?.phone)
  const settings = await readSettings()
  const users = await readUsers()

  if (!settings.integrations?.phoneVerificationEnabled) {
    throw createError({ statusCode: 403, statusMessage: 'Telefon kod doğrulaması deaktivdir' })
  }

  if (users.some((user) => normalizePhone(user.phone || '') === phone)) {
    throw createError({ statusCode: 409, statusMessage: 'Bu nömrə artıq qeydiyyatdan keçib' })
  }

  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  return await requestPhoneVerificationCode(phone, ip)
})
