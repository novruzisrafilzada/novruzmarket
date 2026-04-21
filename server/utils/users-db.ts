import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { replaceJsonFile } from '~/server/utils/json-file'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const dataDir = join(process.cwd(), '.data')
const usersPath = join(dataDir, 'users.json')

export interface DbUser {
  id: number
  name: string
  username?: string
  email: string
  emailVerified?: boolean
  phone?: string
  phoneVerified?: boolean
  passwordHash: string
  salt: string
  createdAt: string
  role?: 'Admin' | 'Müştəri' | 'Satıcı'
  status?: 'Aktiv' | 'Gözləyir' | 'Deaktiv'
  resetPasswordTokenHash?: string
  resetPasswordExpiresAt?: string
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
    const raw = await fs.readFile(usersPath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as DbUser[]) : null
  } catch {
    return null
  }
}

const atomicWriteJson = async (value: unknown) => {
  await ensureDir()
  await replaceJsonFile(usersPath, value)
}

export const readUsers = async () => {
  const existing = await safeReadJson()
  if (existing) return existing
  await atomicWriteJson([])
  return [] as DbUser[]
}

export const writeUsers = async (users: DbUser[]) => {
  await atomicWriteJson(users)
}

export const ensureAdminUser = async () => {
  const users = await readUsers()
  const existingIndex = users.findIndex((user) => user.role === 'Admin')
  if (existingIndex !== -1) {
    if (!users[existingIndex].username) {
      users[existingIndex] = {
        ...users[existingIndex],
        username: normalizeUsername(users[existingIndex].name || 'admin') || 'admin'
      }
      await writeUsers(users)
    }
    return users[existingIndex]
  }

  const auth = createPassword('admin')
  const nextId = users.reduce((max, user) => Math.max(max, Number(user.id) || 0), 0) + 1
  const adminUser: DbUser = {
    id: nextId,
    name: 'Admin',
    username: 'admin',
    email: 'admin',
    emailVerified: true,
    passwordHash: auth.hash,
    salt: auth.salt,
    createdAt: new Date().toISOString(),
    role: 'Admin',
    status: 'Aktiv',
    mustChangePassword: true
  }
  users.unshift(adminUser)
  await writeUsers(users)
  return adminUser
}

export const normalizeEmail = (email: string) => String(email || '').trim().toLowerCase()
export const normalizePhone = (phone: string) => String(phone || '').replace(/[^\d+]/g, '').trim()
export const normalizeUsername = (value: string) => String(value || '').trim().toLowerCase()

export const createPassword = (password: string) => {
  const salt = randomBytes(16).toString('base64')
  const hash = scryptSync(String(password || ''), salt, 64).toString('base64')
  return { salt, hash }
}

export const verifyPassword = (password: string, salt: string, hash: string) => {
  const derived = scryptSync(String(password || ''), salt, 64).toString('base64')
  const a = Buffer.from(derived, 'base64')
  const b = Buffer.from(String(hash || ''), 'base64')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
