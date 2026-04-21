import { createHash, randomBytes } from 'node:crypto'
import { createError, getRequestHeader, getRequestHost, readBody } from 'h3'
import { appendLog } from '~/server/utils/logs-db'
import { sendEmailViaResend } from '~/server/utils/mailer'
import { normalizeEmail, readUsers, writeUsers } from '~/server/utils/users-db'

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  const email = normalizeEmail(body?.email)

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Email vacibdir' })
  }

  const users = await readUsers()
  const user = users.find((item) => normalizeEmail(item.email) === email)
  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'

  if (!user) {
    await appendLog({ user: email, action: 'Şifrə sıfırlama cəhdi: istifadəçi tapılmadı', ip })
    return { ok: true }
  }

  const token = randomBytes(24).toString('hex')
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString()
  user.resetPasswordTokenHash = hashToken(token)
  user.resetPasswordExpiresAt = expiresAt
  await writeUsers(users)

  const origin = getRequestHeader(event, 'origin') || `http://${getRequestHost(event)}`
  const resetUrl = `${origin}/reset-password/${token}`

  try {
    await sendEmailViaResend({
      to: user.email,
      subject: 'Şifrə yeniləmə linki',
      html: `<p>Salam ${user.name},</p><p>Şifrənizi yeniləmək üçün bu linkə keçin:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Link 30 dəqiqə aktivdir.</p>`
    })
    await appendLog({ user: email, action: 'Şifrə sıfırlama emaili göndərildi', ip })
  } catch (error: any) {
    await appendLog({ user: email, action: `Şifrə sıfırlama linki yaradıldı: ${resetUrl}`, ip })
    await appendLog({ user: email, action: `Şifrə sıfırlama email xətası: ${String(error?.message || error)}`, ip })
  }

  return { ok: true }
})
