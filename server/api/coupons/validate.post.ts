import { readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { validateCouponForCheckout } from '~/server/utils/coupon-engine'

export default defineEventHandler(async (event) => {
  const currentUser = await getRequestUser(event).catch(() => null)
  const body = await readBody<any>(event)
  const items = Array.isArray(body?.items) ? body.items : []
  const subtotal = items.reduce((sum: number, item: any) => sum + Number(item?.price || 0) * Number(item?.qty || item?.quantity || 0), 0)
  const result = await validateCouponForCheckout({
    code: String(body?.code || ''),
    subtotal,
    userEmail: String(currentUser?.email || body?.email || '')
  })

  return {
    code: result.normalizedCode,
    discountAmount: result.discountAmount,
    coupon: result.coupon
  }
})
