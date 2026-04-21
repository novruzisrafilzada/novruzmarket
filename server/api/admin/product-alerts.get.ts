import { getQuery, setHeader } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { readProductAlerts } from '~/server/utils/product-alerts-db'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  const alerts = await readProductAlerts()
  const query = getQuery(event)
  if (query.format === 'csv') {
    const rows = [
      ['id', 'productId', 'productName', 'email', 'type', 'status', 'createdAt', 'sentAt'],
      ...alerts.map((item) => [item.id, item.productId, item.productName, item.email, item.type, item.status, item.createdAt, item.sentAt || ''])
    ]
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    setHeader(event, 'content-type', 'text/csv; charset=utf-8')
    setHeader(event, 'content-disposition', 'attachment; filename="product-alerts.csv"')
    return csv
  }
  return {
    total: alerts.length,
    priceDrop: alerts.filter((item) => item.type === 'price_drop').length,
    restock: alerts.filter((item) => item.type === 'restock').length,
    pending: alerts.filter((item) => item.status === 'pending').length,
    sent: alerts.filter((item) => item.status === 'sent').length,
    dismissed: alerts.filter((item) => item.status === 'dismissed').length,
    items: alerts.slice(0, 100)
  }
})
