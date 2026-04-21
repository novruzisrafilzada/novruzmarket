import { createError, readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { couponRepository } from '~/server/repositories/coupon-repository'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  const body = await readBody<any>(event)
  const code = String(body?.code || '').trim().toUpperCase()
  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Kupon kodu vacibdir' })
  }

  const items = await couponRepository.getAll()
  if (items.some((item) => String(item.code || '').trim().toUpperCase() === code)) {
    throw createError({ statusCode: 400, statusMessage: 'Bu kod artıq mövcuddur' })
  }

  const created = {
    id: items.length > 0 ? Math.max(...items.map((item) => Number(item.id || 0))) + 1 : 1,
    code,
    discount: Number(body?.discount || 0),
    type: body?.type === 'Fixed' ? 'Fixed' : 'Percentage',
    expiryDate: String(body?.expiryDate || '').trim(),
    status: body?.status === 'Deaktiv' ? 'Deaktiv' : 'Aktiv',
    minSubtotal: Number(body?.minSubtotal || 0),
    usageLimit: Number(body?.usageLimit || 0),
    usedCount: Number(body?.usedCount || 0),
    allowedUserEmails: Array.isArray(body?.allowedUserEmails) ? body.allowedUserEmails.map((item: any) => String(item || '').trim().toLowerCase()).filter(Boolean) : []
  } as const

  items.unshift(created as any)
  await couponRepository.saveAll(items)
  return created
})
