import { readUsers } from '~/server/utils/users-db'
import { getRequestUser } from '~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  const users = await readUsers()
  return users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: (u.role || 'Müştəri') as 'Admin' | 'Müştəri' | 'Satıcı',
    status: (u.status || 'Aktiv') as 'Aktiv' | 'Gözləyir' | 'Deaktiv',
    date: String(u.createdAt || '').split('T')[0] || new Date().toISOString().split('T')[0]
  }))
})
