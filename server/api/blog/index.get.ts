import { readBlogPosts } from '~/server/utils/blog-db'
import { getRequestUser } from '~/server/utils/auth-session'
import { isBlogPostPublic } from '~/utils/blog'

export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event).catch(() => null)
  const posts = await readBlogPosts()
  return user?.role === 'Admin' ? posts : posts.filter((post) => isBlogPostPublic(post))
})
