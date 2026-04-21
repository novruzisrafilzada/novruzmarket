import { createError, readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { appendLog } from '~/server/utils/logs-db'
import { readOrders, writeOrders } from '~/server/utils/orders-db'
import { statusToColor } from '~/server/utils/order-status'

export default defineEventHandler(async (event) => {
  const currentUser = await getRequestUser(event, { required: true })
  const id = String(event.context.params?.id || '')
  const body = await readBody<any>(event)
  const requestType = String(body?.type || '').trim()
  const note = String(body?.note || '').trim()
  const orders = await readOrders()
  const orderIndex = orders.findIndex((order: any) => String(order?.id) === id && String(order?.email || '').trim().toLowerCase() === String(currentUser.email || '').trim().toLowerCase())

  if (orderIndex === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Sifariş tapılmadı' })
  }

  const currentOrder = orders[orderIndex] as any
  let nextStatus = ''

  if (requestType === 'cancel') {
    if (['Çatdırıldı', 'İptal edildi', 'Qaytarıldı'].includes(String(currentOrder.status || ''))) {
      throw createError({ statusCode: 400, statusMessage: 'Bu sifariş ləğv edilə bilməz' })
    }
    nextStatus = 'Ləğv istəyi'
  } else if (requestType === 'return') {
    if (!['Çatdırıldı'].includes(String(currentOrder.status || ''))) {
      throw createError({ statusCode: 400, statusMessage: 'Qaytarma yalnız çatdırılmış sifarişlər üçün mümkündür' })
    }
    nextStatus = 'Qaytarma istəyi'
  } else {
    throw createError({ statusCode: 400, statusMessage: 'Sorğu tipi yanlışdır' })
  }

  orders[orderIndex] = {
    ...currentOrder,
    status: nextStatus,
    statusColor: statusToColor(nextStatus),
    customerRequestNote: note || undefined,
    customerRequestAt: new Date().toISOString()
  }

  await writeOrders(orders)
  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({ user: currentUser.email || currentUser.name, action: `${id} üçün ${nextStatus} göndərildi`, ip })
  return orders[orderIndex]
})
