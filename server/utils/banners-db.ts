import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import seedBanners from '~/data/seed-banners'
import { replaceJsonFile } from '~/server/utils/json-file'
import type { Banner } from '~/stores/banners'

const dataDir = join(process.cwd(), '.data')
const bannersPath = join(dataDir, 'banners.json')

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const safeReadJson = async () => {
  try {
    const raw = await fs.readFile(bannersPath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Banner[]) : null
  } catch {
    return null
  }
}

const atomicWriteJson = async (value: unknown) => {
  await ensureDir()
  await replaceJsonFile(bannersPath, value)
}

export const readBanners = async () => {
  const existing = await safeReadJson()
  if (existing) return existing
  await atomicWriteJson(seedBanners)
  return seedBanners as unknown as Banner[]
}

export const writeBanners = async (banners: Banner[]) => {
  await atomicWriteJson(banners)
}
