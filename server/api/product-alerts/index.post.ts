import { readBody } from 'h3'
import { addProductAlert } from '~/server/utils/product-alerts-db'

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, any>>(event)
  const productId = Number(body?.productId || 0)
  const productName = String(body?.productName || '').trim()
  const email = String(body?.email || '').trim()
  const type = body?.type === 'restock' ? 'restock' : 'price_drop'

  if (!productId || !productName || !email) {
    throw createError({ statusCode: 400, statusMessage: 'Məlumat natamamdır' })
  }

  const saved = await addProductAlert({ productId, productName, email, type })
  return { ok: true, alert: saved }
})
