import { createError } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { readUsers } from '~/server/utils/users-db'

export default defineEventHandler(async (event) => {
  const currentUser = await getRequestUser(event, { required: true, roles: ['Admin'] })
  const users = await readUsers()
  const admin = users.find((user) => Number(user.id) === Number(currentUser.id) && user.role === 'Admin')
  if (!admin) {
    throw createError({ statusCode: 404, statusMessage: 'Admin hesabı tapılmadı' })
  }
  return {
    name: admin.name || 'Admin',
    username: admin.username || 'admin',
    email: admin.email || 'admin'
  }
})
