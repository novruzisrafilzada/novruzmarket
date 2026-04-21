import { randomBytes, createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { replaceJsonFile } from '~/server/utils/json-file'
import { createError, deleteCookie, getCookie, setCookie, type H3Event } from 'h3'
import { readUsers, type DbUser } from '~/server/utils/users-db'

const dataDir = join(process.cwd(), '.data')
const sessionsPath = join(dataDir, 'sessions.json')
const sessionCookieName = 'markett_session'
const sessionMaxAge = 60 * 60 * 24 * 30

interface DbSession {
  tokenHash: string
  userId: number
  createdAt: string
  expiresAt: string
}

export interface SessionUser {
  id: number
  name: string
  username?: string
  email: string
  emailVerified?: boolean
  phone?: string
  phoneVerified?: boolean
  addresses?: Array<{
    id: string
    label: string
    recipient: string
    phone: string
    city: string
    address: string
    zip?: string
    isDefault?: boolean
  }>
  role: 'Admin' | 'Müştəri' | 'Satıcı'
  status: 'Aktiv' | 'Gözləyir' | 'Deaktiv'
  mustChangePassword?: boolean
  sellerProfile?: {
    shopName?: string
    phone?: string
    note?: string
    profileImage?: string
    coverImage?: string
    categoryIds?: number[]
    featuredStatus?: 'Yoxdur' | 'Gözləyir' | 'Aktiv' | 'Bitib'
    featuredPlanDays?: number
    featuredPlanLabel?: string
    featuredUntil?: string
    featuredBadgeText?: string
    featuredPriority?: number
    featuredPaymentStatus?: 'Gözləyir' | 'Təsdiqləndi' | 'Rədd edildi'
    featuredApprovedAt?: string
    tagline?: string
    storefrontLayout?: 'classic' | 'editorial' | 'premium'
    themeColor?: string
    campaignHeadline?: string
    heroLabel?: string
    verifiedStatus?: 'Yoxdur' | 'Gözləyir' | 'Təsdiqləndi'
    verifiedAt?: string
    verifiedByName?: string
    verifiedNote?: string
    verificationHistory?: Array<{
      at: string
      by: string
      fromStatus: 'Yoxdur' | 'Gözləyir' | 'Təsdiqləndi'
      toStatus: 'Yoxdur' | 'Gözləyir' | 'Təsdiqləndi'
      note?: string
    }>
    verificationDocuments?: Array<{
      id: string
      title: string
      url: string
      status: 'pending' | 'approved' | 'rejected'
      uploadedAt: string
      reviewedAt?: string
      reviewedBy?: string
      note?: string
    }>
  }
}

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const safeReadJson = async () => {
  try {
    const raw = await fs.readFile(sessionsPath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed as DbSession[] : null
  } catch {
    return null
  }
}

const atomicWriteJson = async (value: unknown) => {
  await ensureDir()
  await replaceJsonFile(sessionsPath, value)
}

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

const readSessions = async () => {
  const existing = await safeReadJson()
  if (existing) return existing
  await atomicWriteJson([])
  return [] as DbSession[]
}

const writeSessions = async (sessions: DbSession[]) => {
  await atomicWriteJson(sessions)
}

const normalizeSessions = (sessions: DbSession[]) => {
  const now = Date.now()
  return sessions.filter((session) => {
    const expiresAt = new Date(session.expiresAt).getTime()
    return Number.isFinite(expiresAt) && expiresAt > now
  })
}

const sanitizeUser = (user: DbUser): SessionUser => ({
  id: user.id,
  name: user.name,
  username: user.username,
  email: user.email,
  emailVerified: Boolean(user.emailVerified),
  phone: user.phone,
  phoneVerified: Boolean(user.phoneVerified),
  addresses: Array.isArray(user.addresses) ? user.addresses : [],
  role: (user.role || 'Müştəri') as SessionUser['role'],
  status: (user.status || 'Aktiv') as SessionUser['status'],
  mustChangePassword: Boolean(user.mustChangePassword),
  sellerProfile: user.sellerProfile
})

export const createAuthSession = async (event: H3Event, userId: number) => {
  const sessions = normalizeSessions(await readSessions())
  const token = randomBytes(32).toString('hex')
  const now = new Date()
  const expiresAt = new Date(now.getTime() + sessionMaxAge * 1000)

  sessions.push({
    tokenHash: hashToken(token),
    userId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  })

  await writeSessions(sessions)
  setCookie(event, sessionCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: sessionMaxAge
  })
}

export const clearAuthSession = async (event: H3Event) => {
  const token = getCookie(event, sessionCookieName)
  deleteCookie(event, sessionCookieName, { path: '/' })
  if (!token) return

  const tokenHash = hashToken(token)
  const sessions = await readSessions()
  const nextSessions = sessions.filter((session) => session.tokenHash !== tokenHash)
  if (nextSessions.length !== sessions.length) {
    await writeSessions(normalizeSessions(nextSessions))
  }
}

export const getRequestUser = async (
  event: H3Event,
  options?: {
    required?: boolean
    roles?: SessionUser['role'][]
  }
) => {
  const token = getCookie(event, sessionCookieName)
  if (!token) {
    if (options?.required) {
      throw createError({ statusCode: 401, statusMessage: 'Giriş tələb olunur' })
    }
    return null
  }

  const tokenHash = hashToken(token)
  const sessions = normalizeSessions(await readSessions())
  const session = sessions.find((item) => item.tokenHash === tokenHash)

  if (!session) {
    await writeSessions(sessions)
    deleteCookie(event, sessionCookieName, { path: '/' })
    if (options?.required) {
      throw createError({ statusCode: 401, statusMessage: 'Sessiya bitib' })
    }
    return null
  }

  const users = await readUsers()
  const user = users.find((item) => Number(item.id) === Number(session.userId))
  if (!user) {
    const nextSessions = sessions.filter((item) => item.tokenHash !== tokenHash)
    await writeSessions(nextSessions)
    deleteCookie(event, sessionCookieName, { path: '/' })
    if (options?.required) {
      throw createError({ statusCode: 401, statusMessage: 'İstifadəçi tapılmadı' })
    }
    return null
  }

  const publicUser = sanitizeUser(user)

  if (options?.roles?.length && !options.roles.includes(publicUser.role)) {
    throw createError({ statusCode: 403, statusMessage: 'İcazəniz yoxdur' })
  }

  return publicUser
}
