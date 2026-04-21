export type BlogPostStatus = 'Draft' | 'Scheduled' | 'Aktiv' | 'Deaktiv'

export const slugifyBlogTitle = (value: string) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

export const parseBlogRouteId = (value: string | number | null | undefined) => {
  const raw = String(value || '').trim()
  const match = raw.match(/^(\d+)/)
  const id = Number(match?.[1] || raw)
  return Number.isFinite(id) && id > 0 ? id : 0
}

export const buildBlogHref = (post: { id?: number | string | null, slug?: string | null, title?: string | null }) => {
  const id = parseBlogRouteId(post?.id)
  if (!id) return '/blog'
  const slug = String(post?.slug || '').trim() || slugifyBlogTitle(String(post?.title || ''))
  return slug ? `/blog/${id}-${slug}` : `/blog/${id}`
}

export const estimateReadingTime = (content: string) => {
  const words = String(content || '').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 180))
}

export const isBlogPostPublic = (post: { status?: string | null, publishedAt?: string | null }) => {
  const status = String(post?.status || '')
  if (status !== 'Aktiv' && status !== 'Scheduled') return false
  const publishedAt = String(post?.publishedAt || '').trim()
  if (!publishedAt) return status === 'Aktiv'
  const publishedMs = new Date(publishedAt).getTime()
  if (!Number.isFinite(publishedMs)) return status === 'Aktiv'
  return publishedMs <= Date.now()
}
