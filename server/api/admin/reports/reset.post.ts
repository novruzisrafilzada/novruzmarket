import { getRequestUser } from '~/server/utils/auth-session'
import { appendLog } from '~/server/utils/logs-db'
import { resetLaunchMetrics } from '~/server/utils/launch-reset'

export default defineEventHandler(async (event) => {
  const currentUser = await getRequestUser(event, { required: true, roles: ['Admin'] })
  const summary = await resetLaunchMetrics()
  const ip = String(event.node.req.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.node.req.socket.remoteAddress || 'Localhost'
  await appendLog({
    user: currentUser.email || currentUser.name || 'admin',
    action: `Launch statistikaları sıfırlandı (${summary.clearedOrders} sifariş, ${summary.resetProducts} məhsul, ${summary.cleanedTempFiles} tmp fayl)`,
    ip
  })
  return {
    ok: true,
    ...summary
  }
})
