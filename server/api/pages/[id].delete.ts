import { readPages, writePages } from '~/server/utils/pages-db'
import { getRequestUser } from '~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id) || id <= 0) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  const pages = await readPages()
  const next = pages.filter(p => p.id !== id)
  await writePages(next as any)
  return { ok: true }
})
