import { readBlogPosts, writeBlogPosts } from '~/server/utils/blog-db'
import { getRequestUser } from '~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  const id = Number(event.context.params?.id)
  const posts = await readBlogPosts()
  if (!posts.some((p: any) => Number(p.id) === id)) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }
  const next = posts.filter((p: any) => Number(p.id) !== id)
  await writeBlogPosts(next)
  return { ok: true }
})
