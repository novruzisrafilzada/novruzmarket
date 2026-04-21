import { readBody } from 'h3'
import { readCategories, writeCategories, type CategoryRecord } from '~/server/utils/categories-db'

const normalizeSlug = (raw: string) => {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04FF\u00C0-\u017F\u0180-\u024F\u0600-\u06FF]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  const categories = await readCategories()

  const parentId = body?.parentId === null || body?.parentId === undefined ? null : Number(body?.parentId)
  const safeParentId = parentId === null ? null : Number.isFinite(parentId) ? parentId : null
  if (safeParentId !== null && !categories.some(c => c.id === safeParentId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid parentId' })
  }

  const nameI18n = body?.nameI18n || {}
  const descriptionI18n = body?.descriptionI18n || {}
  const az = String(nameI18n.az || '').trim()
  const ru = String(nameI18n.ru || '').trim()
  const en = String(nameI18n.en || '').trim()
  const descriptionAz = String(descriptionI18n.az || '').trim()
  const descriptionRu = String(descriptionI18n.ru || '').trim()
  const descriptionEn = String(descriptionI18n.en || '').trim()
  if (!az) throw createError({ statusCode: 400, statusMessage: 'AZ name required' })

  const slug = normalizeSlug(body?.slug || az)
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug required' })
  if (categories.some(c => c.slug === slug)) throw createError({ statusCode: 409, statusMessage: 'Slug exists' })

  const icon = String(body?.icon || '').trim() || 'Tag'
  const image = String(body?.image || '').trim()
  const featuredOnHome = Boolean(body?.featuredOnHome)
  const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1

  const created: CategoryRecord = {
    id: newId,
    parentId: safeParentId,
    slug,
    icon,
    image,
    featuredOnHome,
    nameI18n: { az, ru, en },
    descriptionI18n: { az: descriptionAz, ru: descriptionRu, en: descriptionEn }
  }

  const next = [...categories, created]
  await writeCategories(next)
  return created
})
