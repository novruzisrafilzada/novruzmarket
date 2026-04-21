import { readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { appendLog } from '~/server/utils/logs-db'
import { writeAdminPortalConfig } from '~/server/utils/admin-portal-db'

export default defineEventHandler(async (event) => {
  const currentUser = await getRequestUser(event, { required: true, roles: ['Admin'] })
  const body = await readBody<any>(event)
  const next = await writeAdminPortalConfig({
    pathSegment: String(body?.pathSegment || 'admin')
  })
  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({ user: currentUser.email, action: `Admin giriş yolu yeniləndi: /${next.pathSegment}`, ip })
  return next
})
