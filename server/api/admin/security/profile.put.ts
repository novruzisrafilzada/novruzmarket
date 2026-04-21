import { createError, readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { appendLog } from '~/server/utils/logs-db'
import { normalizeEmail, normalizeUsername, readUsers, writeUsers } from '~/server/utils/users-db'

export default defineEventHandler(async (event) => {
  const currentUser = await getRequestUser(event, { required: true, roles: ['Admin'] })
  const body = await readBody<any>(event)
  const name = String(body?.name || '').trim()
  const username = normalizeUsername(body?.username || '')
  const email = normalizeEmail(body?.email || '')

  if (!name || !username || !email) {
    throw createError({ statusCode: 400, statusMessage: 'Admin məlumatları natamamdır' })
  }

  const users = await readUsers()
  const adminIndex = users.findIndex((user) => Number(user.id) === Number(currentUser.id) && user.role === 'Admin')
  if (adminIndex === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Admin hesabı tapılmadı' })
  }

  if (users.some((user, index) => index !== adminIndex && normalizeUsername(user.username || '') === username)) {
    throw createError({ statusCode: 409, statusMessage: 'Bu admin giriş adı artıq istifadə olunur' })
  }

  if (users.some((user, index) => index !== adminIndex && normalizeEmail(user.email || '') === email)) {
    throw createError({ statusCode: 409, statusMessage: 'Bu email artıq istifadə olunur' })
  }

  users[adminIndex] = {
    ...users[adminIndex],
    name,
    username,
    email
  }

  await writeUsers(users)

  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({ user: users[adminIndex].email, action: 'Admin giriş məlumatları yeniləndi', ip })

  return {
    success: true,
    profile: {
      name: users[adminIndex].name,
      username: users[adminIndex].username,
      email: users[adminIndex].email
    }
  }
})
