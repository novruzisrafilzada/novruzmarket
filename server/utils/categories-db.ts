import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import seedCategories from '~/data/seed-categories'
import { replaceJsonFile } from '~/server/utils/json-file'

export type CategoryI18n = {
  az: string
  ru: string
  en: string
}

export type CategoryRecord = {
  id: number
  parentId: number | null
  slug: string
  icon: string
  image?: string
  featuredOnHome?: boolean
  nameI18n: CategoryI18n
  descriptionI18n?: CategoryI18n
}

const dataDir = join(process.cwd(), '.data')
const categoriesPath = join(dataDir, 'categories.json')

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const safeReadJson = async () => {
  try {
    const raw = await fs.readFile(categoriesPath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

const atomicWriteJson = async (value: unknown) => {
  await ensureDir()
  await replaceJsonFile(categoriesPath, value)
}

const normalize = (raw: any): CategoryRecord | null => {
  if (!raw || typeof raw !== 'object') return null
  const id = Number(raw.id)
  if (!Number.isFinite(id) || id <= 0) return null
  const parentIdRaw = raw.parentId === null || raw.parentId === undefined ? null : Number(raw.parentId)
  const parentId = parentIdRaw === null ? null : Number.isFinite(parentIdRaw) && parentIdRaw > 0 ? parentIdRaw : null
  const slug = String(raw.slug || '').trim()
  if (!slug) return null
  const icon = String(raw.icon || '').trim() || 'Tag'
  const image = String(raw.image || '').trim()
  const featuredOnHome = raw.featuredOnHome === undefined ? undefined : Boolean(raw.featuredOnHome)
  const nameI18nRaw = raw.nameI18n || {}
  const descriptionI18nRaw = raw.descriptionI18n || {}
  const az = String(nameI18nRaw.az || '').trim()
  const ru = String(nameI18nRaw.ru || '').trim()
  const en = String(nameI18nRaw.en || '').trim()
  const descriptionAz = String(descriptionI18nRaw.az || '').trim()
  const descriptionRu = String(descriptionI18nRaw.ru || '').trim()
  const descriptionEn = String(descriptionI18nRaw.en || '').trim()
  if (!az) return null
  return {
    id,
    parentId,
    slug,
    icon,
    image,
    featuredOnHome,
    nameI18n: { az, ru, en },
    descriptionI18n: { az: descriptionAz, ru: descriptionRu, en: descriptionEn }
  }
}

const applySeedBackfill = (category: CategoryRecord) => {
  const seed = (seedCategories as CategoryRecord[]).find((item) => item.id === category.id)
  if (!seed) return { merged: category, changed: false }

  const merged: CategoryRecord = {
    ...category,
    image: category.image || seed.image || '',
    featuredOnHome: category.featuredOnHome === undefined ? seed.featuredOnHome : category.featuredOnHome
  }

  const changed =
    String(merged.image || '') !== String(category.image || '') ||
    merged.featuredOnHome !== category.featuredOnHome

  return { merged, changed }
}

export const readCategories = async () => {
  const existing = await safeReadJson()
  if (existing) {
    const normalized = existing.map(normalize).filter(Boolean) as CategoryRecord[]
    if (normalized.length > 0) {
      let changed = false
      const merged = normalized.map((item) => {
        const result = applySeedBackfill(item)
        if (result.changed) changed = true
        return result.merged
      })
      if (changed) await atomicWriteJson(merged)
      return merged
    }
  }
  await atomicWriteJson(seedCategories)
  return seedCategories as unknown as CategoryRecord[]
}

export const writeCategories = async (categories: unknown[]) => {
  await atomicWriteJson(categories)
}
