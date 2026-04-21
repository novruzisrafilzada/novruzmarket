import { createError, readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { couponRepository } from '~/server/repositories/coupon-repository'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  const id = Number(event.context.params?.id || 0)
  const body = await readBody<any>(event)
  const items = await couponRepository.getAll()
  const index = items.findIndex((item) => Number(item.id) === id)
  if (index === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Kupon tapılmadı' })
  }

  const code = String(body?.code || items[index].code || '').trim().toUpperCase()
  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Kupon kodu vacibdir' })
  }
  if (items.some((item, itemIndex) => itemIndex !== index && String(item.code || '').trim().toUpperCase() === code)) {
    throw createError({ statusCode: 400, statusMessage: 'Bu kod artıq mövcuddur' })
  }

  items[index] = {
    ...items[index],
    code,
    discount: Number(body?.discount ?? items[index].discount ?? 0),
    type: body?.type === 'Fixed' ? 'Fixed' : body?.type === 'Percentage' ? 'Percentage' : items[index].type,
    expiryDate: String(body?.expiryDate || items[index].expiryDate || '').trim(),
    status: body?.status === 'Deaktiv' ? 'Deaktiv' : body?.status === 'Aktiv' ? 'Aktiv' : items[index].status,
    minSubtotal: Number(body?.minSubtotal ?? items[index].minSubtotal ?? 0),
    usageLimit: Number(body?.usageLimit ?? items[index].usageLimit ?? 0),
    usedCount: Number(body?.usedCount ?? items[index].usedCount ?? 0),
    allowedUserEmails: Array.isArray(body?.allowedUserEmails) ? body.allowedUserEmails.map((item: any) => String(item || '').trim().toLowerCase()).filter(Boolean) : items[index].allowedUserEmails || []
  }
  await couponRepository.saveAll(items)
  return items[index]
})
