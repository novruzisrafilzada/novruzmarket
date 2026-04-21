import { createError, readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { appendLog } from '~/server/utils/logs-db'
import { readSellerPayoutRequests, writeSellerPayoutRequests } from '~/server/utils/seller-payouts-db'

export default defineEventHandler(async (event) => {
  const currentUser = await getRequestUser(event, { required: true, roles: ['Admin'] })
  const id = String(event.context.params?.id || '')
  const body = await readBody<any>(event)
  const status = String(body?.status || '').trim()
  const transferReference = String(body?.transferReference || '').trim()
  const failureReason = String(body?.failureReason || '').trim()
  if (!['Gözləyir', 'Təsdiqləndi', 'İmtina edildi'].includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Status yanlışdır' })
  }
  const items = await readSellerPayoutRequests()
  const index = items.findIndex((item) => String(item.id) === id)
  if (index === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Sorğu tapılmadı' })
  }
  items[index] = {
    ...items[index],
    status: status as any,
    processedAt: status === 'Gözləyir' ? undefined : new Date().toISOString(),
    processedBy: status === 'Gözləyir' ? undefined : String(currentUser.email || currentUser.name || 'Admin'),
    transferReference: status === 'Təsdiqləndi' ? (transferReference || items[index].transferReference) : undefined,
    failureReason: status === 'İmtina edildi' ? (failureReason || items[index].failureReason) : undefined
  }
  await writeSellerPayoutRequests(items)
  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({ user: currentUser.email || currentUser.name, action: `Seller payout statusu yeniləndi: ${status}`, ip })
  return items[index]
})
