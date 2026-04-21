import { createHash, randomInt } from 'node:crypto'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { replaceJsonFile } from '~/server/utils/json-file'
import { createError } from 'h3'
import { appendLog } from '~/server/utils/logs-db'
import { sendSmsMessage } from '~/server/utils/sms'
import { normalizePhone } from '~/server/utils/users-db'

const dataDir = join(process.cwd(), '.data')
const codesPath = join(dataDir, 'phone-verifications.json')
const otpTtlMs = 10 * 60 * 1000

interface PhoneVerificationEntry {
  phone: string
  codeHash: string
  createdAt: string
  expiresAt: string
}

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const safeReadJson = async () => {
  try {
    const raw = await fs.readFile(codesPath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed as PhoneVerificationEntry[] : null
  } catch {
    return null
  }
}

const atomicWriteJson = async (value: unknown) => {
  await ensureDir()
  await replaceJsonFile(codesPath, value)
}

const readEntries = async () => {
  const existing = await safeReadJson()
  if (existing) return existing
  await atomicWriteJson([])
  return [] as PhoneVerificationEntry[]
}

const writeEntries = async (entries: PhoneVerificationEntry[]) => {
  await atomicWriteJson(entries)
}

const hashCode = (code: string) => createHash('sha256').update(code).digest('hex')

const normalizeEntries = (entries: PhoneVerificationEntry[]) => {
  const now = Date.now()
  return entries.filter((entry) => {
    const expiresAt = new Date(entry.expiresAt).getTime()
    return Number.isFinite(expiresAt) && expiresAt > now
  })
}

export const requestPhoneVerificationCode = async (phoneInput: string, ip: string) => {
  const phone = normalizePhone(phoneInput)
  if (!phone || phone.length < 7) {
    throw createError({ statusCode: 400, statusMessage: 'Telefon nömrəsi yanlışdır' })
  }

  const code = String(randomInt(100000, 999999))
  const now = new Date()
  const expiresAt = new Date(now.getTime() + otpTtlMs)
  const entries = normalizeEntries(await readEntries()).filter((entry) => entry.phone !== phone)

  entries.push({
    phone,
    codeHash: hashCode(code),
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  })

  await writeEntries(entries)
  await sendSmsMessage({
    to: phone,
    message: `NovruzMarket təsdiq kodunuz: ${code}`
  })
  await appendLog({
    user: phone,
    action: 'SMS doğrulama kodu göndərildi',
    ip
  })

  return {
    phone,
    expiresAt: expiresAt.toISOString(),
    message: 'Kod göndərildi'
  }
}

export const verifyPhoneVerificationCode = async (phoneInput: string, codeInput: string) => {
  const phone = normalizePhone(phoneInput)
  const code = String(codeInput || '').trim()
  if (!phone || !code) {
    throw createError({ statusCode: 400, statusMessage: 'Telefon və kod vacibdir' })
  }

  const entries = normalizeEntries(await readEntries())
  const entry = entries.find((item) => item.phone === phone)
  if (!entry) {
    await writeEntries(entries)
    throw createError({ statusCode: 400, statusMessage: 'Kodun vaxtı bitib və ya tapılmadı' })
  }

  if (entry.codeHash !== hashCode(code)) {
    throw createError({ statusCode: 400, statusMessage: 'Kod yanlışdır' })
  }

  await writeEntries(entries.filter((item) => item.phone !== phone))
  return { phone, verified: true as const }
}
