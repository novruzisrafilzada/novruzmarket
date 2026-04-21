import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import seedFaq from '../data/seed-faq'
import { replaceJsonFile } from '~/server/utils/json-file'

const dataDir = join(process.cwd(), '.data')
const faqPath = join(dataDir, 'faq.json')

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const safeReadJson = async () => {
  try {
    const raw = await fs.readFile(faqPath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

const atomicWriteJson = async (value: unknown) => {
  await ensureDir()
  await replaceJsonFile(faqPath, value)
}

export const readFaq = async () => {
  const existing = await safeReadJson()
  if (existing) return existing
  await atomicWriteJson(seedFaq)
  return seedFaq
}

export const writeFaq = async (items: unknown[]) => {
  await atomicWriteJson(items)
}
