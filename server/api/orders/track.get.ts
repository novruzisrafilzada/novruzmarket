import { createError, getQuery } from 'h3'
import { readOrders } from '~/server/utils/orders-db'
import { normalizeEmail } from '~/server/utils/users-db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const trackingCode = String(query.trackingCode || '').trim().toUpperCase()
  const email = normalizeEmail(String(query.email || ''))

  if (!trackingCode || !email) {
    throw createError({ statusCode: 400, statusMessage: 'Tracking code və email vacibdir' })
  }

  const orders = await readOrders()
  const order = orders.find((item: any) => String(item?.trackingCode || '').toUpperCase() === trackingCode && normalizeEmail(item?.email || '') === email)

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Sifariş tapılmadı' })
  }

  return order
})
