import { readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { updateProductAlert } from '~/server/utils/product-alerts-db'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  const id = String(event.context.params?.id || '').trim()
  const body = await readBody<Record<string, any>>(event)
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Alert ID tələb olunur' })
  }
  const status = body?.status === 'sent' ? 'sent' : body?.status === 'dismissed' ? 'dismissed' : 'pending'
  const updated = await updateProductAlert(id, { status })
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Alert tapılmadı' })
  }
  return { ok: true, item: updated }
})
