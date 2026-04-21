import { ensureAdminUser } from '~/server/utils/users-db'

export default defineNitroPlugin(async () => {
  await ensureAdminUser()
})
