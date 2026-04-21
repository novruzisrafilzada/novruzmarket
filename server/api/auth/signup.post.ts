import { createError, readBody } from 'h3'
import { createAuthSession } from '~/server/utils/auth-session'
import { maybeSendAutomationEmail } from '~/server/utils/email-automation'
import { appendLog } from '~/server/utils/logs-db'
import { readSettings } from '~/server/utils/settings-db'
import { createPassword, normalizeEmail, normalizePhone, readUsers, writeUsers } from '~/server/utils/users-db'

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  const name = String(body?.name || '').trim()
  const email = normalizeEmail(body?.email || '')
  const phone = normalizePhone(body?.phone || '')
  const password = String(body?.password || '')
  const role = body?.role === 'Satıcı' ? 'Satıcı' : 'Müştəri'
  const rawCategoryIds = Array.isArray(body?.sellerProfile?.categoryIds) ? body.sellerProfile.categoryIds : []
  const sellerCategoryIds = [...new Set(rawCategoryIds.map((value: any) => Number(value)).filter((value: number) => Number.isFinite(value) && value > 0))]
  const sellerProfile = role === 'Satıcı'
    ? {
        shopName: String(body?.sellerProfile?.shopName || '').trim(),
        phone: String(body?.sellerProfile?.phone || '').trim(),
        note: String(body?.sellerProfile?.note || '').trim(),
        profileImage: String(body?.sellerProfile?.profileImage || '').trim(),
        coverImage: String(body?.sellerProfile?.coverImage || '').trim(),
        categoryIds: sellerCategoryIds,
        featuredStatus: 'Yoxdur' as const,
        featuredPlanDays: 0,
        featuredPlanLabel: '',
        featuredUntil: '',
        featuredBadgeText: 'PRO',
        featuredPriority: 0,
        featuredPaymentStatus: 'Gözləyir' as const,
        featuredApprovedAt: ''
      }
    : undefined

  if (!name || !email || password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Ad, email və şifrə (minimum 6 simvol) vacibdir' })
  }
  if (role === 'Satıcı' && !sellerProfile?.shopName) {
    throw createError({ statusCode: 400, statusMessage: 'Mağaza adı vacibdir' })
  }
  if (role === 'Satıcı' && !sellerProfile?.categoryIds?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Satış kateqoriyalarını seçin' })
  }

  const users = await readUsers()
  if (users.some((user) => normalizeEmail(user.email) === email)) {
    throw createError({ statusCode: 409, statusMessage: 'Bu email artıq qeydiyyatdan keçib' })
  }
  if (phone && users.some((user) => normalizePhone(user.phone || '') === phone)) {
    throw createError({ statusCode: 409, statusMessage: 'Bu nömrə artıq qeydiyyatdan keçib' })
  }

  const settings = await readSettings()
  const verificationEnabled = Boolean(settings.integrations?.emailVerificationEnabled)

  const maxId = users.length > 0 ? Math.max(...users.map((user) => Number(user.id) || 0)) : 0
  const { salt, hash } = createPassword(password)
  const created = {
    id: maxId + 1,
    name,
    email,
    emailVerified: !verificationEnabled,
    phone: phone || undefined,
    phoneVerified: false,
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString(),
    role,
    status: 'Aktiv' as const,
    sellerProfile
  }

  users.unshift(created)
  await writeUsers(users)

  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({ user: created.email, action: verificationEnabled ? 'Email kodu ilə qeydiyyat oldu' : 'Email kodu olmadan qeydiyyat oldu', ip })
  await createAuthSession(event, created.id)
  await maybeSendAutomationEmail({
    kind: 'welcomeSignup',
    to: created.email,
    ip,
    vars: { name: created.name, email: created.email }
  })

  return {
    id: created.id,
    name: created.name,
    email: created.email,
    emailVerified: created.emailVerified,
    phone: created.phone,
    phoneVerified: created.phoneVerified,
    role: created.role || 'Müştəri',
    status: created.status || 'Aktiv',
    sellerProfile: created.sellerProfile
  }
})