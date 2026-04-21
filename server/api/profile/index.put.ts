import { readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { appendLog } from '~/server/utils/logs-db'
import { readUsers, writeUsers } from '~/server/utils/users-db'

export default defineEventHandler(async (event) => {
  const currentUser = await getRequestUser(event, { required: true })
  const body = await readBody<any>(event)
  const users = await readUsers()
  const userIndex = users.findIndex((user) => Number(user.id) === Number(currentUser.id))
  if (userIndex === -1) {
    throw createError({ statusCode: 404, statusMessage: 'İstifadəçi tapılmadı' })
  }

  const rawAddresses = Array.isArray(body?.addresses) ? body.addresses : []
  const addresses = rawAddresses
    .map((item: any, index: number) => ({
      id: String(item?.id || `addr-${Date.now()}-${index}`),
      label: String(item?.label || '').trim() || `Ünvan ${index + 1}`,
      recipient: String(item?.recipient || body?.name || users[userIndex].name || '').trim(),
      phone: String(item?.phone || users[userIndex].phone || '').trim(),
      city: String(item?.city || '').trim(),
      address: String(item?.address || '').trim(),
      zip: String(item?.zip || '').trim(),
      isDefault: Boolean(item?.isDefault)
    }))
    .filter((item: any) => item.recipient && item.phone && item.city && item.address)
    .map((item: any, index: number) => ({
      ...item,
      isDefault: index === 0 ? true : item.isDefault
    }))

  const defaultIndex = addresses.findIndex((item: any) => item.isDefault)
  if (defaultIndex > 0) {
    const [selected] = addresses.splice(defaultIndex, 1)
    addresses.unshift({ ...selected, isDefault: true })
  }
  if (addresses.length > 0) {
    addresses[0] = { ...addresses[0], isDefault: true }
  }

  users[userIndex] = {
    ...users[userIndex],
    name: String(body?.name || users[userIndex].name || '').trim() || users[userIndex].name,
    phone: String(body?.phone || users[userIndex].phone || '').trim(),
    addresses
  }

  await writeUsers(users)
  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({ user: users[userIndex].email || users[userIndex].name, action: 'Profil ünvanları yeniləndi', ip })
  return {
    ok: true,
    user: {
      name: users[userIndex].name,
      phone: users[userIndex].phone,
      addresses: users[userIndex].addresses || []
    }
  }
})
