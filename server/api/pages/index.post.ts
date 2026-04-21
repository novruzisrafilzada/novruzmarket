import { readBody } from 'h3'
import { readPages, writePages } from '~/server/utils/pages-db'
import { getRequestUser } from '~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  const body = await readBody<any>(event)
  const slug = String(body?.slug || '').trim()
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })

  const pages = await readPages()
  if (pages.some(p => p.slug === slug)) {
    throw createError({ statusCode: 409, statusMessage: 'Slug already exists' })
  }

  const newId = pages.length > 0 ? Math.max(...pages.map(p => p.id)) + 1 : 1
  const created = {
    id: newId,
    slug,
    status: body?.status === 'Deaktiv' ? 'Deaktiv' : 'Aktiv',
    title: String(body?.title || '').trim(),
    content: String(body?.content || ''),
    titleI18n: body?.titleI18n,
    contentI18n: body?.contentI18n,
    heroBgImage: body?.heroBgImage ? String(body?.heroBgImage || '').trim() : undefined,
    pageLayout: body?.pageLayout === 'faq' ? 'faq' : 'basic',
    sections: Array.isArray(body?.sections) ? body.sections : [],
    faqs: Array.isArray(body?.faqs) ? body.faqs : []
  }

  pages.push(created as any)
  await writePages(pages as any)
  return created
})
