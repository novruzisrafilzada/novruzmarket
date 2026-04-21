import { clearAuthSession } from '~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  await clearAuthSession(event)
  return { ok: true }
})
