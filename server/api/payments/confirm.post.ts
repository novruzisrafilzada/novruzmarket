import { createError, readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { appendLog } from '~/server/utils/logs-db'
import { maybeSendAutomationEmail } from '~/server/utils/email-automation'
import { createStoredOrder } from '~/server/utils/order-create'
import { readPaymentSessions, writePaymentSessions } from '~/server/utils/payment-session-db'
import { readSettings } from '~/server/utils/settings-db'
import { getStripeCheckoutSession } from '~/server/utils/stripe-payments'
import { markCouponUsed } from '~/server/utils/coupon-engine'

export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event, { required: true })
  const body = await readBody<any>(event)
  const sessionId = String(body?.sessionId || '').trim()
  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Sessiya identifikatoru tapılmadı' })
  }

  const settings = await readSettings()
  if (settings.integrations?.paymentProvider !== 'stripe' || !settings.integrations?.paymentSecret?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Stripe inteqrasiyası hazır deyil' })
  }

  const stripeSession = await getStripeCheckoutSession(settings.integrations.paymentSecret.trim(), sessionId)
  const paymentDraftId = String(stripeSession.metadata?.paymentDraftId || '').trim()
  if (!paymentDraftId || stripeSession.payment_status !== 'paid') {
    throw createError({ statusCode: 400, statusMessage: 'Ödəniş tamamlanmayıb' })
  }

  const sessions = await readPaymentSessions()
  const current = sessions.find((entry) => entry.id === paymentDraftId && entry.stripeSessionId === sessionId)
  if (!current) {
    throw createError({ statusCode: 404, statusMessage: 'Ödəniş draftı tapılmadı' })
  }
  if (current.userId !== Number(user.id)) {
    throw createError({ statusCode: 403, statusMessage: 'Bu ödəniş sizə aid deyil' })
  }

  if (current.orderId) {
    return {
      orderId: current.orderId,
      trackingCode: current.trackingCode,
      email: current.email
    }
  }

  const created = await createStoredOrder({
    customer: current.customer,
    email: current.email,
    amount: current.amount,
    address: current.address,
    phone: current.phone,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    paymentProvider: 'stripe',
    paymentSessionId: sessionId,
    items: current.items,
    couponCode: current.couponCode,
    discountAmount: current.discountAmount,
    shippingMethodId: current.shippingMethodId,
    shippingMethodName: current.shippingMethodName,
    shippingFee: current.shippingFee,
    shippingEta: current.shippingEta,
    shippingRegion: current.shippingRegion
  })
  if (current.couponCode) {
    await markCouponUsed(current.couponCode)
  }

  const nextSessions = sessions.map((entry) => entry.id === current.id ? {
    ...entry,
    confirmedAt: new Date().toISOString(),
    orderId: created.id,
    trackingCode: created.trackingCode
  } : entry)
  await writePaymentSessions(nextSessions)

  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({ user: created.email || created.customer || 'Müştəri', action: `Stripe ödənişi təsdiqləndi (${created.id})`, ip })
  await maybeSendAutomationEmail({
    kind: 'orderCreated',
    to: created.email,
    ip,
    vars: { name: created.customer, email: created.email, orderId: created.id, status: created.status }
  })

  return {
    orderId: created.id,
    trackingCode: created.trackingCode,
    email: created.email
  }
})
