import { readBody } from 'h3'
import { readCategories, writeCategories } from '~/server/utils/categories-db'

const normalizeSlug = (raw: string) => {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04FF\u00C0-\u017F\u0180-\u024F\u0600-\u06FF]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default defineEventHandler(async (event) => {
  const id = Number((event.context.params as any).id)
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const body = await readBody<any>(event)
  const categories = await readCategories()
  const idx = categories.findIndex(c => c.id === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const current = categories[idx]

  const parentIdRaw = body?.parentId === null || body?.parentId === undefined ? current.parentId : Number(body?.parentId)
  const parentId = parentIdRaw === null ? null : Number.isFinite(parentIdRaw) ? parentIdRaw : null
  if (parentId !== null) {
    if (parentId === id) throw createError({ statusCode: 400, statusMessage: 'Invalid parentId' })
    if (!categories.some(c => c.id === parentId)) throw createError({ statusCode: 400, statusMessage: 'Invalid parentId' })
  }

  const nameI18nRaw = body?.nameI18n || {}
  const descriptionI18nRaw = body?.descriptionI18n || {}
  const az = typeof nameI18nRaw.az === 'string' ? nameI18nRaw.az.trim() : current.nameI18n.az
  const ru = typeof nameI18nRaw.ru === 'string' ? nameI18nRaw.ru.trim() : current.nameI18n.ru
  const en = typeof nameI18nRaw.en === 'string' ? nameI18nRaw.en.trim() : current.nameI18n.en
  const currentDescription = current.descriptionI18n || { az: '', ru: '', en: '' }
  const descriptionAz = typeof descriptionI18nRaw.az === 'string' ? descriptionI18nRaw.az.trim() : currentDescription.az
  const descriptionRu = typeof descriptionI18nRaw.ru === 'string' ? descriptionI18nRaw.ru.trim() : currentDescription.ru
  const descriptionEn = typeof descriptionI18nRaw.en === 'string' ? descriptionI18nRaw.en.trim() : currentDescription.en
  if (!az) throw createError({ statusCode: 400, statusMessage: 'AZ name required' })

  const slugNext = body?.slug !== undefined ? normalizeSlug(body.slug) : current.slug
  if (!slugNext) throw createError({ statusCode: 400, statusMessage: 'Slug required' })
  if (categories.some(c => c.id !== id && c.slug === slugNext)) throw createError({ statusCode: 409, statusMessage: 'Slug exists' })

  const icon = body?.icon !== undefined ? String(body.icon || '').trim() || 'Tag' : current.icon
  const image = body?.image !== undefined ? String(body.image || '').trim() : (current as any).image || ''
  const featuredOnHome = body?.featuredOnHome !== undefined ? Boolean(body.featuredOnHome) : Boolean((current as any).featuredOnHome)

  const updated = {
    ...current,
    parentId,
    slug: slugNext,
    icon,
    image,
    featuredOnHome,
    nameI18n: { az, ru, en },
    descriptionI18n: { az: descriptionAz, ru: descriptionRu, en: descriptionEn }
  }

  const next = [...categories]
  next[idx] = updated as any
  await writeCategories(next)
  return updated
})
