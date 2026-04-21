import { readAdminPortalConfig } from '~/server/utils/admin-portal-db'

export default defineEventHandler(async () => {
  return await readAdminPortalConfig()
})
