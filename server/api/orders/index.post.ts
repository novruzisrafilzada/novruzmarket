import { createError, readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { appendLog } from '~/server/utils/logs-db'
import { maybeSendAutomationEmail } from '~/server/utils/email-automation'
import { readSettings } from '~/server/utils/settings-db'
import { createStoredOrder } from '~/server/utils/order-create'
import { markCouponUsed, validateCouponForCheckout } from '~/server/utils/coupon-engine'
import { resolveShippingQuote } from '~/server/utils/shipping-quote'

export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event, { required: true })
  const body = await readBody<any>(event)
  const settings = await readSettings()
  const cardPaymentReady = Boolean(
    settings.integrations?.paymentProvider === 'stripe'
    && settings.paymentMethods?.some((method) => method.key === 'card' && method.enabled)
    && settings.integrations?.paymentApiKey?.trim()
    && settings.integrations?.paymentSecret?.trim()
    && settings.integrations?.paymentCallbackUrl?.trim()
  )
  const cashPaymentReady = Boolean(settings.paymentMethods?.some((method) => method.key === 'cash' && method.enabled))
  const paymentMethod = body?.paymentMethod === 'cash' ? 'cash' : 'card'

  if (paymentMethod === 'card' && !cardPaymentReady) {
    throw createError({ statusCode: 400, statusMessage: 'Kartla ödəniş hələ aktiv deyil' })
  }
  if (paymentMethod === 'cash' && !cashPaymentReady) {
    throw createError({ statusCode: 400, statusMessage: 'Nağd ödəniş hazırda aktiv deyil' })
  }

  const items = Array.isArray(body?.items) ? body.items : []
  const subtotal = items.reduce((sum: number, item: any) => sum + Number(item?.price || 0) * Number(item?.qty || item?.quantity || 0), 0)
  let validatedCouponCode: string | undefined
  let validatedDiscountAmount: number | undefined
  if (String(body?.couponCode || '').trim()) {
    const result = await validateCouponForCheckout({
      code: String(body.couponCode || ''),
      subtotal,
      userEmail: String(user?.email || body?.email || '')
    })
    validatedCouponCode = result.normalizedCode
    validatedDiscountAmount = result.discountAmount
  }
  const shippingQuote = await resolveShippingQuote({
    shippingMethodId: body?.shippingMethodId != null ? Number(body.shippingMethodId) : undefined,
    subtotal: Math.max(0, subtotal - Number(validatedDiscountAmount || 0)),
    region: String(body?.shippingRegion || '').trim()
  })

  const created = await createStoredOrder({
    customer: String(body?.customer || user?.name || '').trim(),
    email: String(user?.email || body?.email || '').trim(),
    amount: Math.max(0, subtotal - Number(validatedDiscountAmount || 0) + Number(shippingQuote.shippingFee || 0)),
    address: String(body?.address || '').trim(),
    phone: String(body?.phone || '').trim(),
    paymentMethod,
    paymentStatus: paymentMethod === 'card' ? 'paid' : 'pending',
    paymentProvider: paymentMethod === 'card' ? settings.integrations?.paymentProvider || 'stripe' : '',
    items,
    couponCode: validatedCouponCode,
    discountAmount: validatedDiscountAmount,
    shippingMethodId: shippingQuote.shippingMethodId,
    shippingMethodName: shippingQuote.shippingMethodName,
    shippingFee: shippingQuote.shippingFee,
    shippingEta: shippingQuote.shippingEta,
    shippingRegion: shippingQuote.shippingRegion
  })
  if (validatedCouponCode) {
    await markCouponUsed(validatedCouponCode)
  }
  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({ user: created.email || created.customer || 'Müştəri', action: `Sifariş yaradıldı (${created.id})`, ip })
  await maybeSendAutomationEmail({
    kind: 'orderCreated',
    to: created.email,
    ip,
    vars: { name: created.customer, email: created.email, orderId: created.id, status: created.status }
  })
  return created
})
