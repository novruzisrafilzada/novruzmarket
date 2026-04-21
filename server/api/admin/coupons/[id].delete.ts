import { createError } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { couponRepository } from '~/server/repositories/coupon-repository'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  const id = Number(event.context.params?.id || 0)
  const items = await couponRepository.getAll()
  const index = items.findIndex((item) => Number(item.id) === id)
  if (index === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Kupon tapılmadı' })
  }
  const nextItems = items.filter((item) => Number(item.id) !== id)
  await couponRepository.saveAll(nextItems)
  return { ok: true }
})
