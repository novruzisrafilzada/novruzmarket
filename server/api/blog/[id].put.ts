import { createError, readBody } from 'h3'
import { readBlogPosts, writeBlogPosts } from '~/server/utils/blog-db'
import { getRequestUser } from '~/server/utils/auth-session'
import { estimateReadingTime, slugifyBlogTitle, type BlogPostStatus } from '~/utils/blog'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  const id = Number(event.context.params?.id)
  const body = await readBody<any>(event)
  const posts = await readBlogPosts()

  const idx = posts.findIndex((p: any) => Number(p.id) === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'Post not found' })

  const current = posts[idx]
  const title = String(body?.title ?? current.title ?? '').trim()
  const content = String(body?.content ?? current.content ?? '').trim()
  const category = String(body?.category ?? current.category ?? '').trim()
  if (!title || !content || !category) {
    throw createError({ statusCode: 400, statusMessage: 'Başlıq, məzmun və kateqoriya tələb olunur' })
  }

  const slug = String(body?.slug ?? current.slug ?? '').trim() || slugifyBlogTitle(title)
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug yaratmaq olmadı' })
  if (posts.some((post: any, index: number) => index !== idx && String(post.slug || '').trim() === slug)) {
    throw createError({ statusCode: 409, statusMessage: 'Bu slug artıq mövcuddur' })
  }

  const normalizeStatus = (value: any): BlogPostStatus => {
    const status = String(value || '').trim()
    if (status === 'Draft' || status === 'Scheduled' || status === 'Aktiv' || status === 'Deaktiv') return status
    return current.status
  }
  const status = normalizeStatus(body?.status)
  const rawPublishedAt = String(body?.publishedAt ?? current.publishedAt ?? '').trim()
  if (status === 'Scheduled' && (!rawPublishedAt || !Number.isFinite(new Date(rawPublishedAt).getTime()))) {
    throw createError({ statusCode: 400, statusMessage: 'Scheduled status üçün yayımlanma tarixi tələb olunur' })
  }
  const publishedAt = rawPublishedAt && Number.isFinite(new Date(rawPublishedAt).getTime())
    ? new Date(rawPublishedAt).toISOString()
    : String(current.publishedAt || new Date().toISOString())
  const tags = body?.tags === undefined
    ? current.tags
    : Array.isArray(body?.tags)
      ? Array.from(new Set(body.tags.map((item: any) => String(item || '').trim()).filter(Boolean)))
      : String(body?.tags || '').split(',').map((item) => item.trim()).filter(Boolean)
  const excerpt = String(body?.excerpt ?? current.excerpt ?? '').trim() || content.slice(0, 180)

  posts[idx] = {
    ...current,
    id,
    title,
    slug,
    excerpt,
    content,
    image: String(body?.image ?? current.image ?? '').trim(),
    date: publishedAt.split('T')[0],
    category,
    status,
    author: String(body?.author ?? current.author ?? 'Markett Team').trim(),
    tags,
    featured: body?.featured === undefined ? Boolean(current.featured) : Boolean(body.featured),
    readingTime: Math.max(1, Number(body?.readingTime || estimateReadingTime(content))),
    publishedAt,
    updatedAt: new Date().toISOString(),
    seo: {
      title: String(body?.seo?.title || current.seo?.title || title).trim(),
      description: String(body?.seo?.description || current.seo?.description || excerpt).trim(),
      keywords: String(body?.seo?.keywords || current.seo?.keywords || tags.join(', ')).trim()
    }
  }
  await writeBlogPosts(posts)
  return posts[idx]
})
