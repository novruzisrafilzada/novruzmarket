import { createError, readBody } from 'h3'
import { createAuthSession } from '~/server/utils/auth-session'
import { ensureAdminUser, normalizeEmail, normalizePhone, normalizeUsername, readUsers, verifyPassword } from '~/server/utils/users-db'
import { appendLog } from '~/server/utils/logs-db'

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  const identifier = String(body?.email || '').trim()
  const adminOnly = Boolean(body?.adminOnly)
  const email = normalizeEmail(identifier)
  const phone = normalizePhone(identifier)
  const username = normalizeUsername(identifier)
  const password = String(body?.password || '')

  if (!identifier || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid data' })
  }

  await ensureAdminUser()
  const users = await readUsers()
  const hasEmailIdentifier = identifier.includes('@')
  const hasPhoneIdentifier = Boolean(phone)
  const hasUsernameIdentifier = Boolean(username)
  const user = users.find((u) => {
    const userEmail = normalizeEmail(u.email)
    const userPhone = normalizePhone(u.phone || '')
    const userUsername = normalizeUsername(u.username || '')
    const userName = normalizeUsername(u.name || '')

    if (hasEmailIdentifier && userEmail && userEmail === email) {
      return true
    }
    if (hasPhoneIdentifier && userPhone && userPhone === phone) {
      return true
    }
    if (hasUsernameIdentifier && userUsername && userUsername === username) {
      return true
    }
    if (hasUsernameIdentifier && userName && userName === username) {
      return true
    }
    return false
  })
  if (!user) {
    throw createError({
      statusCode: adminOnly ? 403 : 401,
      statusMessage: adminOnly ? 'Admin hesabı tapılmadı' : 'Invalid credentials',
      message: adminOnly
        ? 'Admin panelə daxil olmaq üçün admin username və ya admin email istifadə edin.'
        : 'Email, telefon və ya şifrə yanlışdır.'
    })
  }

  if (adminOnly && user.role !== 'Admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Bu giriş admin üçün deyil',
      message: 'Bu məlumatlar adi istifadəçi hesabına aiddir. Admin panel üçün yalnız admin hesabı ilə daxil olun.'
    })
  }

  const ok = verifyPassword(password, user.salt, user.passwordHash)
  if (!ok) {
    throw createError({
      statusCode: adminOnly ? 403 : 401,
      statusMessage: adminOnly ? 'Admin şifrəsi yanlışdır' : 'Invalid credentials',
      message: adminOnly
        ? 'Admin panel üçün daxil etdiyiniz şifrə yanlışdır.'
        : 'Email, telefon və ya şifrə yanlışdır.'
    })
  }

  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({ user: user.email, action: 'Daxil oldu', ip })
  await createAuthSession(event, user.id)

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    emailVerified: Boolean((user as any).emailVerified),
    phone: user.phone,
    phoneVerified: Boolean(user.phoneVerified),
    role: (user as any).role || 'Müştəri',
    status: (user as any).status || 'Aktiv',
    sellerProfile: (user as any).sellerProfile
  }
})
