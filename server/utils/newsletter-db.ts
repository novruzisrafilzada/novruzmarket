import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { replaceJsonFile } from '~/server/utils/json-file'
import { normalizeEmail } from '~/server/utils/users-db'
import seedNewsletter from '../data/seed-newsletter'

const dataDir = join(process.cwd(), '.data')
const subsPath = join(dataDir, 'newsletter-subscribers.json')

export interface NewsletterSubscriber {
  id: number
  email: string
  status: 'Aktiv' | 'Deaktiv'
  createdAt: string
}

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const safeReadJson = async () => {
  try {
    const raw = await fs.readFile(subsPath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as NewsletterSubscriber[]) : null
  } catch {
    return null
  }
}

const atomicWriteJson = async (value: unknown) => {
  await ensureDir()
  await replaceJsonFile(subsPath, value)
}

export const readSubscribers = async () => {
  const existing = await safeReadJson()
  if (existing) return existing
  await atomicWriteJson(seedNewsletter)
  return seedNewsletter as NewsletterSubscriber[]
}

export const writeSubscribers = async (subs: NewsletterSubscriber[]) => {
  await atomicWriteJson(subs)
}
