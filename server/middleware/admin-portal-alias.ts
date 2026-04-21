import { readAdminPortalConfig } from '~/server/utils/admin-portal-db'

export default defineEventHandler(async (event) => {
  const config = await readAdminPortalConfig()
  if (config.pathSegment === 'admin') return
  const url = String(event.node.req.url || '/')
  const prefix = `/${config.pathSegment}`
  if (url === prefix || url.startsWith(`${prefix}/`)) {
    event.node.req.url = `/admin${url.slice(prefix.length)}`
  }
})
