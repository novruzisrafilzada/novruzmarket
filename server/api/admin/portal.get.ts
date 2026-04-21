import { getRequestUser } from '~/server/utils/auth-session'
import { readAdminPortalConfig } from '~/server/utils/admin-portal-db'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  return await readAdminPortalConfig()
})
