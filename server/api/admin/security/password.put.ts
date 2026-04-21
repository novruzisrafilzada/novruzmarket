import { createError, readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { appendLog } from '~/server/utils/logs-db'
import { createPassword, readUsers, verifyPassword, writeUsers } from '~/server/utils/users-db'

export default defineEventHandler(async (event) => {
  const currentUser = await getRequestUser(event, { required: true, roles: ['Admin'] })
  const body = await readBody<any>(event)
  const currentPassword = String(body?.currentPassword || '')
  const nextPassword = String(body?.nextPassword || '')

  if (!currentPassword || !nextPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Şifrə məlumatları natamamdır' })
  }

  if (nextPassword.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Yeni şifrə ən azı 6 simvol olmalıdır' })
  }

  const users = await readUsers()
  const userIndex = users.findIndex((user) => Number(user.id) === Number(currentUser.id) && user.role === 'Admin')
  if (userIndex === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Admin hesabı tapılmadı' })
  }

  if (!verifyPassword(currentPassword, users[userIndex].salt, users[userIndex].passwordHash)) {
    throw createError({ statusCode: 400, statusMessage: 'Cari şifrə yanlışdır' })
  }

  const nextAuth = createPassword(nextPassword)
  users[userIndex] = {
    ...users[userIndex],
    passwordHash: nextAuth.hash,
    salt: nextAuth.salt,
    mustChangePassword: false
  }

  await writeUsers(users)

  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({ user: users[userIndex].email, action: 'Admin giriş şifrəsi yeniləndi', ip })

  return { success: true }
})
