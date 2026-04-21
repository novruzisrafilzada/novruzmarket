import { createError } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Giriş edilməyib' })
  }
  return user
})
