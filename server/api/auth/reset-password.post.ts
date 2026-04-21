import { createHash } from 'node:crypto'
import { createError, readBody } from 'h3'
import { createPassword, readUsers, writeUsers } from '~/server/utils/users-db'

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  const token = String(body?.token || '').trim()
  const password = String(body?.password || '')

  if (!token || password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Token və yeni şifrə vacibdir' })
  }

  const tokenHash = hashToken(token)
  const users = await readUsers()
  const user = users.find((item) => String(item.resetPasswordTokenHash || '') === tokenHash)

  if (!user || !user.resetPasswordExpiresAt || new Date(user.resetPasswordExpiresAt).getTime() <= Date.now()) {
    throw createError({ statusCode: 400, statusMessage: 'Linkin vaxtı bitib və ya etibarsızdır' })
  }

  const { salt, hash } = createPassword(password)
  user.salt = salt
  user.passwordHash = hash
  user.resetPasswordTokenHash = undefined
  user.resetPasswordExpiresAt = undefined
  await writeUsers(users)

  return { ok: true }
})
