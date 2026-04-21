import { getRequestUser } from '~/server/utils/auth-session'
import { couponRepository } from '~/server/repositories/coupon-repository'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  return await couponRepository.getAll()
})
