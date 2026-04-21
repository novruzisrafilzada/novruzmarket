import { createHash, randomInt } from 'node:crypto'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { replaceJsonFile } from '~/server/utils/json-file'
import { createError } from 'h3'
import { appendLog } from '~/server/utils/logs-db'
import { sendEmailViaResend } from '~/server/utils/mailer'
import { normalizeEmail } from '~/server/utils/users-db'

const dataDir = join(process.cwd(), '.data')
const codesPath = join(dataDir, 'email-verifications.json')
const otpTtlMs = 10 * 60 * 1000

interface EmailVerificationEntry {
  email: string
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
    return Array.isArray(parsed) ? parsed as EmailVerificationEntry[] : null
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
  return [] as EmailVerificationEntry[]
}

const writeEntries = async (entries: EmailVerificationEntry[]) => {
  await atomicWriteJson(entries)
}

const hashCode = (code: string) => createHash('sha256').update(code).digest('hex')

const normalizeEntries = (entries: EmailVerificationEntry[]) => {
  const now = Date.now()
  return entries.filter((entry) => {
    const expiresAt = new Date(entry.expiresAt).getTime()
    return Number.isFinite(expiresAt) && expiresAt > now
  })
}

export const requestEmailVerificationCode = async (emailInput: string, ip: string) => {
  const email = normalizeEmail(emailInput)
  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Email ünvanı yanlışdır' })
  }

  const code = String(randomInt(100000, 999999))
  const now = new Date()
  const expiresAt = new Date(now.getTime() + otpTtlMs)
  const entries = normalizeEntries(await readEntries()).filter((entry) => entry.email !== email)

  entries.push({
    email,
    codeHash: hashCode(code),
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  })

  await writeEntries(entries)
  await sendEmailViaResend({
    to: email,
    subject: 'Qeydiyyat təsdiq kodu',
    html: `<h2>Email təsdiqi</h2><p>Qeydiyyatı tamamlamaq üçün kodunuz:</p><p style="font-size:28px;font-weight:800;letter-spacing:6px">${code}</p><p>Kod 10 dəqiqə ərzində aktivdir.</p>`
  })
  await appendLog({
    user: email,
    action: 'Email doğrulama kodu göndərildi',
    ip
  })

  return {
    email,
    expiresAt: expiresAt.toISOString(),
    message: 'Kod email ünvanına göndərildi'
  }
}

export const verifyEmailVerificationCode = async (emailInput: string, codeInput: string) => {
  const email = normalizeEmail(emailInput)
  const code = String(codeInput || '').trim()
  if (!email || !code) {
    throw createError({ statusCode: 400, statusMessage: 'Email və kod vacibdir' })
  }

  const entries = normalizeEntries(await readEntries())
  const entry = entries.find((item) => item.email === email)
  if (!entry) {
    await writeEntries(entries)
    throw createError({ statusCode: 400, statusMessage: 'Kodun vaxtı bitib və ya tapılmadı' })
  }

  if (entry.codeHash !== hashCode(code)) {
    throw createError({ statusCode: 400, statusMessage: 'Kod yanlışdır' })
  }

  await writeEntries(entries.filter((item) => item.email !== email))
  return { email, verified: true as const }
}
