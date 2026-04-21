import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { replaceJsonFile } from '~/server/utils/json-file'

const dataDir = join(process.cwd(), '.data')
const dealsPath = join(dataDir, 'top-deals.json')

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const safeReadJson = async () => {
  try {
    const raw = await fs.readFile(dealsPath, 'utf8')
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

const atomicWriteJson = async (value: unknown) => {
  await ensureDir()
  await replaceJsonFile(dealsPath, value)
}

const seed = () => {
  const endAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
  return {
    enabled: true,
    title: 'Günün ən yaxşı təklifləri',
    titleI18n: { az: 'Günün ən yaxşı təklifləri', ru: 'Лучшие предложения дня', en: 'Today’s best deals' },
    endAt,
    productIds: [] as number[]
  }
}

export const readTopDeals = async () => {
  const existing = await safeReadJson()
  const s = seed()
  if (existing) {
    const ex: any = existing
    const titleI18n = ex.titleI18n && typeof ex.titleI18n === 'object'
      ? { ...s.titleI18n, ...ex.titleI18n }
      : { ...s.titleI18n, az: String(ex.title || s.title) }
    const merged = { ...s, ...ex, titleI18n }
    return merged
  }
  await atomicWriteJson(s)
  return s
}

export const writeTopDeals = async (value: unknown) => {
  await atomicWriteJson(value)
}
