import { createError, readBody } from 'h3'
import { readSettings } from '~/server/utils/settings-db'
import { readWaitlistEntries, writeWaitlistEntries } from '~/server/utils/waitlist-db'

export default defineEventHandler(async (event) => {
  const settings = await readSettings()
  if (!settings.creativeSuite?.waitlistEnabled) {
    throw createError({ statusCode: 403, statusMessage: 'Waitlist deaktivdir', message: 'Hazırda stok xəbərdarlığı qəbul edilmir.' })
  }

  const body = await readBody<any>(event)
  const productId = Number(body?.productId || 0)
  const email = String(body?.email || '').trim().toLowerCase()
  if (!Number.isFinite(productId) || productId <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Məhsul tapılmadı' })
  }
  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Email yanlışdır' })
  }

  const items = await readWaitlistEntries()
  if (items.some((item) => Number(item.productId) === productId && String(item.email || '').trim().toLowerCase() === email)) {
    return { ok: true, alreadyExists: true }
  }
  items.unshift({ id: `WAIT-${Date.now()}`, productId, email, createdAt: new Date().toISOString() })
  await writeWaitlistEntries(items)
  return { ok: true }
})
