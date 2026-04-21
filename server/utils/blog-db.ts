import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import seedBlog from '~/data/seed-blog'
import { replaceJsonFile } from '~/server/utils/json-file'
import type { BlogPost } from '~/stores/blog'
import { estimateReadingTime, slugifyBlogTitle } from '~/utils/blog'

const dataDir = join(process.cwd(), '.data')
const blogPath = join(dataDir, 'blog.json')

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const safeReadJson = async () => {
  try {
    const raw = await fs.readFile(blogPath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map((post: any, index: number) => normalizePost(post, index)) : null
  } catch {
    return null
  }
}

const atomicWriteJson = async (value: unknown) => {
  await ensureDir()
  await replaceJsonFile(blogPath, value)
}

const normalizeStatus = (value: any): BlogPost['status'] => {
  const status = String(value || '').trim()
  if (status === 'Draft' || status === 'Scheduled' || status === 'Aktiv' || status === 'Deaktiv') return status
  return 'Aktiv'
}

const toDateOnly = (value: any) => {
  const raw = String(value || '').trim()
  if (!raw) return new Date().toISOString().split('T')[0]
  const date = new Date(raw)
  if (!Number.isFinite(date.getTime())) return raw.slice(0, 10)
  return date.toISOString().split('T')[0]
}

const normalizeTags = (value: any) => {
  if (!Array.isArray(value)) return []
  return Array.from(new Set(value.map((item: any) => String(item || '').trim()).filter(Boolean)))
}

const normalizePost = (post: any, index: number): BlogPost => {
  const id = Number(post?.id || index + 1)
  const title = String(post?.title || '').trim()
  const content = String(post?.content || '')
  const excerpt = String(post?.excerpt || '').trim() || content.replace(/\s+/g, ' ').trim().slice(0, 180)
  const publishedAtRaw = String(post?.publishedAt || post?.date || '').trim()
  const publishedAt = publishedAtRaw
    ? (() => {
        const date = new Date(publishedAtRaw)
        return Number.isFinite(date.getTime()) ? date.toISOString() : new Date().toISOString()
      })()
    : new Date().toISOString()
  const updatedAtRaw = String(post?.updatedAt || publishedAt).trim()
  const updatedAt = Number.isFinite(new Date(updatedAtRaw).getTime()) ? new Date(updatedAtRaw).toISOString() : publishedAt

  return {
    id,
    title,
    slug: String(post?.slug || '').trim() || slugifyBlogTitle(title) || `blog-${id}`,
    excerpt,
    content,
    image: String(post?.image || '').trim(),
    date: toDateOnly(post?.date || publishedAt),
    category: String(post?.category || '').trim(),
    status: normalizeStatus(post?.status),
    author: String(post?.author || 'Markett Team').trim(),
    tags: normalizeTags(post?.tags),
    featured: Boolean(post?.featured),
    readingTime: Math.max(1, Number(post?.readingTime || estimateReadingTime(content))),
    publishedAt,
    updatedAt,
    seo: {
      title: String(post?.seo?.title || title).trim(),
      description: String(post?.seo?.description || excerpt).trim(),
      keywords: String(post?.seo?.keywords || normalizeTags(post?.tags).join(', ')).trim()
    }
  }
}

export const readBlogPosts = async () => {
  const existing = await safeReadJson()
  if (existing) return existing
  const normalizedSeed = (seedBlog as any[]).map((post: any, index: number) => normalizePost(post, index))
  await atomicWriteJson(normalizedSeed)
  return normalizedSeed
}

export const writeBlogPosts = async (posts: BlogPost[]) => {
  await atomicWriteJson(posts.map((post: any, index: number) => normalizePost(post, index)))
}
