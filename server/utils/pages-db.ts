import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { seedPages, type Page } from '~/server/data/seed-pages'
import { replaceJsonFile } from '~/server/utils/json-file'

const dataDir = join(process.cwd(), '.data')
const pagesPath = join(dataDir, 'pages.json')

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const safeReadJson = async () => {
  try {
    const raw = await fs.readFile(pagesPath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

const atomicWriteJson = async (value: unknown) => {
  await ensureDir()
  await replaceJsonFile(pagesPath, value)
}

const normalizePage = (p: any): Page | null => {
  if (!p || typeof p !== 'object') return null
  const id = Number(p.id)
  const slug = String(p.slug || '').trim()
  if (!Number.isFinite(id) || id <= 0 || !slug) return null
  const status = p.status === 'Deaktiv' ? 'Deaktiv' : 'Aktiv'
  const title = String(p.title || '').trim()
  const content = String(p.content || '')
  const titleI18n = p.titleI18n && typeof p.titleI18n === 'object' ? p.titleI18n : undefined
  const contentI18n = p.contentI18n && typeof p.contentI18n === 'object' ? p.contentI18n : undefined
  const heroBgImage = p.heroBgImage ? String(p.heroBgImage || '').trim() : undefined
  const pageLayout = p.pageLayout === 'faq' ? 'faq' : 'basic'
  const sections = Array.isArray(p.sections) ? p.sections : undefined
  const faqs = Array.isArray(p.faqs) ? p.faqs : undefined
  return { id, slug, status, title, content, titleI18n, contentI18n, heroBgImage, pageLayout, sections, faqs }
}

export const readPages = async () => {
  const existing = await safeReadJson()
  if (existing) {
    const normalized = existing.map(normalizePage).filter(Boolean) as Page[]
    if (!normalized.length) return seedPages

    const merged = [...normalized]
    let changed = false
    for (const seedPage of seedPages) {
      if (!merged.some((page) => page.slug === seedPage.slug)) {
        merged.push(seedPage)
        changed = true
      }
    }
    if (changed) {
      await atomicWriteJson(merged)
    }
    return merged
  }
  await atomicWriteJson(seedPages)
  return seedPages
}

export const writePages = async (pages: unknown[]) => {
  await atomicWriteJson(pages)
}
