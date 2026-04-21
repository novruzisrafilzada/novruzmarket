import { readBody } from 'h3'
import { readBlogPosts, writeBlogPosts } from '~/server/utils/blog-db'
import { autoNotifyNewsletter } from '~/server/utils/newsletter-notify'
import { getRequestUser } from '~/server/utils/auth-session'
import { estimateReadingTime, isBlogPostPublic, slugifyBlogTitle, type BlogPostStatus } from '~/utils/blog'

export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event, { required: true, roles: ['Admin'] })
  const body = await readBody<any>(event)
  const posts = await readBlogPosts()
  const title = String(body?.title || '').trim()
  const content = String(body?.content || '').trim()
  const category = String(body?.category || '').trim()
  if (!title || !content || !category) {
    throw createError({ statusCode: 400, statusMessage: 'Başlıq, məzmun və kateqoriya tələb olunur' })
  }

  const slug = String(body?.slug || '').trim() || slugifyBlogTitle(title)
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Slug yaratmaq olmadı' })
  }
  if (posts.some((post) => String(post.slug || '').trim() === slug)) {
    throw createError({ statusCode: 409, statusMessage: 'Bu slug artıq mövcuddur' })
  }

  const normalizeStatus = (value: any): BlogPostStatus => {
    const status = String(value || '').trim()
    if (status === 'Draft' || status === 'Scheduled' || status === 'Aktiv' || status === 'Deaktiv') return status
    return 'Aktiv'
  }
  const status = normalizeStatus(body?.status)
  const nowIso = new Date().toISOString()
  const candidatePublishedAt = String(body?.publishedAt || '').trim()
  if (status === 'Scheduled' && (!candidatePublishedAt || !Number.isFinite(new Date(candidatePublishedAt).getTime()))) {
    throw createError({ statusCode: 400, statusMessage: 'Scheduled status üçün yayımlanma tarixi tələb olunur' })
  }
  const publishedAt = candidatePublishedAt && Number.isFinite(new Date(candidatePublishedAt).getTime())
    ? new Date(candidatePublishedAt).toISOString()
    : nowIso
  const tags = Array.isArray(body?.tags)
    ? Array.from(new Set(body.tags.map((item: any) => String(item || '').trim()).filter(Boolean)))
    : String(body?.tags || '').split(',').map((item) => item.trim()).filter(Boolean)
  const excerpt = String(body?.excerpt || '').trim() || content.slice(0, 180)
  const maxId = posts.length > 0 ? Math.max(...posts.map((p: any) => Number(p.id) || 0)) : 0
  const created = {
    id: maxId + 1,
    title,
    slug,
    excerpt,
    content,
    image: String(body?.image || '').trim(),
    date: publishedAt.split('T')[0],
    category,
    status,
    author: String(body?.author || user.name || 'Markett Team').trim(),
    tags,
    featured: Boolean(body?.featured),
    readingTime: Math.max(1, Number(body?.readingTime || estimateReadingTime(content))),
    publishedAt,
    updatedAt: nowIso,
    seo: {
      title: String(body?.seo?.title || title).trim(),
      description: String(body?.seo?.description || excerpt).trim(),
      keywords: String(body?.seo?.keywords || tags.join(', ')).trim()
    }
  }
  posts.unshift(created)
  await writeBlogPosts(posts)

  if (isBlogPostPublic(created)) {
    const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
    await autoNotifyNewsletter({
      type: 'newBlog',
      subject: `Yeni bloq: ${String(created.title || '').trim()}`.trim(),
      html: `<h2>Yeni bloq yazısı</h2><p><b>${String(created.title || '').trim()}</b></p><p>${String(created.excerpt || '').slice(0, 220)}...</p>`,
      ip
    })
  }
  return created
})
