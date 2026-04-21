import { readBody } from 'h3'
import { readPages, writePages } from '~/server/utils/pages-db'
import { getRequestUser } from '~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const body = await readBody<any>(event)
  const pages = await readPages()
  const idx = pages.findIndex(p => p.id === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const nextSlug = body?.slug !== undefined ? String(body?.slug || '').trim() : pages[idx].slug
  if (!nextSlug) throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })
  if (pages.some(p => p.slug === nextSlug && p.id !== id)) {
    throw createError({ statusCode: 409, statusMessage: 'Slug already exists' })
  }

  const updated = {
    ...pages[idx],
    slug: nextSlug,
    status: body?.status === 'Deaktiv' ? 'Deaktiv' : 'Aktiv',
    title: body?.title !== undefined ? String(body?.title || '').trim() : pages[idx].title,
    content: body?.content !== undefined ? String(body?.content || '') : pages[idx].content,
    titleI18n: body?.titleI18n !== undefined ? body?.titleI18n : pages[idx].titleI18n,
    contentI18n: body?.contentI18n !== undefined ? body?.contentI18n : pages[idx].contentI18n,
    heroBgImage: body?.heroBgImage !== undefined ? (body?.heroBgImage ? String(body?.heroBgImage || '').trim() : '') : pages[idx].heroBgImage,
    pageLayout: body?.pageLayout !== undefined ? (body?.pageLayout === 'faq' ? 'faq' : 'basic') : pages[idx].pageLayout,
    sections: body?.sections !== undefined ? (Array.isArray(body?.sections) ? body.sections : []) : pages[idx].sections,
    faqs: body?.faqs !== undefined ? (Array.isArray(body?.faqs) ? body.faqs : []) : pages[idx].faqs
  }
  pages[idx] = updated as any
  await writePages(pages as any)
  return updated
})
