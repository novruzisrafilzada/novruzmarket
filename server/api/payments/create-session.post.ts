import { createError, getRequestURL, readBody } from 'h3'
import { randomUUID } from 'node:crypto'
import { getRequestUser } from '~/server/utils/auth-session'
import { readSettings } from '~/server/utils/settings-db'
import { createStripeCheckoutSession } from '~/server/utils/stripe-payments'
import { readPaymentSessions, writePaymentSessions } from '~/server/utils/payment-session-db'
import { validateCouponForCheckout } from '~/server/utils/coupon-engine'
import { resolveShippingQuote } from '~/server/utils/shipping-quote'

export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event, { required: true })
  const body = await readBody<any>(event)
  const settings = await readSettings()
  const resolvedEmail = String(user.email || body?.email || '').trim()
  const resolvedPhone = String(body?.phone || '').trim()
  const resolvedAddress = String(body?.address || '').trim()
  const resolvedCustomer = String(body?.customer || user?.name || '').trim()
  const cardMethod = settings.paymentMethods?.find((method) => method.key === 'card')
  const callbackBase = String(settings.integrations?.paymentCallbackUrl || '').trim().replace(/\/$/, '') || getRequestURL(event).origin

  if (settings.integrations?.paymentProvider !== 'stripe') {
    throw createError({ statusCode: 400, statusMessage: 'Aktiv kart provider tapılmadı' })
  }
  if (!cardMethod?.enabled) {
    throw createError({ statusCode: 400, statusMessage: 'Kartla ödəniş deaktivdir' })
  }
  if (!settings.integrations?.paymentApiKey?.trim() || !settings.integrations?.paymentSecret?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Ödəniş açarları natamamdır' })
  }

  const items = Array.isArray(body?.items) ? body.items : []
  if (!items.length) {
    throw createError({ statusCode: 400, statusMessage: 'Səbət boşdur' })
  }
  if (!resolvedCustomer || resolvedCustomer.length < 4) {
    throw createError({ statusCode: 400, statusMessage: 'Müştəri adı natamamdır' })
  }
  if (!resolvedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resolvedEmail)) {
    throw createError({ statusCode: 400, statusMessage: 'Düzgün email tələb olunur' })
  }
  if (!resolvedPhone || !/^\+?[0-9\s\-()]{9,20}$/.test(resolvedPhone)) {
    throw createError({ statusCode: 400, statusMessage: 'Telefon nömrəsi natamamdır' })
  }
  if (!resolvedAddress || resolvedAddress.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Çatdırılma ünvanı natamamdır' })
  }
  const subtotal = items.reduce((sum: number, item: any) => sum + Number(item?.price || 0) * Number(item?.qty || item?.quantity || 0), 0)
  let validatedCouponCode: string | undefined
  let validatedDiscountAmount: number | undefined
  if (String(body?.couponCode || '').trim()) {
    const result = await validateCouponForCheckout({
      code: String(body.couponCode || ''),
      subtotal,
      userEmail: resolvedEmail
    })
    validatedCouponCode = result.normalizedCode
    validatedDiscountAmount = result.discountAmount
  }
  const shippingQuote = await resolveShippingQuote({
    shippingMethodId: body?.shippingMethodId != null ? Number(body.shippingMethodId) : undefined,
    subtotal: Math.max(0, subtotal - Number(validatedDiscountAmount || 0)),
    region: String(body?.shippingRegion || '').trim()
  })
  const finalAmount = Math.max(0, subtotal - Number(validatedDiscountAmount || 0) + Number(shippingQuote.shippingFee || 0))

  const paymentDraftId = randomUUID()
  const stripeSession = await createStripeCheckoutSession({
    secretKey: settings.integrations.paymentSecret.trim(),
    successUrl: `${callbackBase}/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${callbackBase}/checkout?payment=cancelled`,
    currency: String(settings.currency || 'AZN'),
    customerEmail: resolvedEmail,
    items: [{
      name: `Sifariş ödənişi${shippingQuote.shippingMethodName ? ` · ${shippingQuote.shippingMethodName}` : ''}`,
      price: finalAmount,
      qty: 1
    }],
    metadata: {
      paymentDraftId,
      userId: String(user.id)
    }
  })

  const sessions = await readPaymentSessions()
  sessions.unshift({
    id: paymentDraftId,
    provider: 'stripe',
    stripeSessionId: stripeSession.id,
    userId: Number(user.id),
    customer: resolvedCustomer,
    email: resolvedEmail,
    phone: resolvedPhone,
    address: resolvedAddress,
    amount: finalAmount,
    items,
    couponCode: validatedCouponCode,
    discountAmount: validatedDiscountAmount,
    shippingMethodId: shippingQuote.shippingMethodId,
    shippingMethodName: shippingQuote.shippingMethodName,
    shippingFee: shippingQuote.shippingFee,
    shippingEta: shippingQuote.shippingEta,
    shippingRegion: shippingQuote.shippingRegion,
    createdAt: new Date().toISOString()
  })
  await writePaymentSessions(sessions)

  return {
    url: stripeSession.url,
    sessionId: stripeSession.id
  }
})
