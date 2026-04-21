import { createError } from 'h3'
import { readOrders } from '~/server/utils/orders-db'
import { readProducts } from '~/server/utils/products-db'

export default defineEventHandler(async (event) => {
  const productId = Number(event.context.params?.id || 0)
  if (!Number.isFinite(productId) || productId <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid product id' })
  }

  const [orders, products] = await Promise.all([readOrders(), readProducts()])
  const productMap = new Map(products.map((item: any) => [Number(item.id), item]))
  const counts = new Map<number, number>()

  for (const order of orders) {
    const ids = Array.from(new Set((order?.items || []).map((item: any) => Number(item?.id || 0)).filter((id: number) => id > 0)))
    if (!ids.includes(productId)) continue
    for (const id of ids) {
      if (id === productId) continue
      counts.set(id, (counts.get(id) || 0) + 1)
    }
  }

  const related = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({
      count,
      product: productMap.get(id)
    }))
    .filter((item) => item.product && item.product.status === 'Aktiv')
    .slice(0, 4)

  return related
})
