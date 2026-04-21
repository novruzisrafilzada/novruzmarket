import { getQuery } from 'h3'
import { readOrders } from '~/server/utils/orders-db'
import { readProducts } from '~/server/utils/products-db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.max(1, Math.min(8, Number(query.limit || 4)))
  const orders = await readOrders()
  const products = await readProducts()
  const productMap = new Map(products.map((item: any) => [Number(item.id), item]))
  const pairs = new Map<string, { ids: [number, number]; count: number }>()

  for (const order of orders) {
    const ids = Array.from(new Set((order?.items || []).map((item: any) => Number(item?.id || 0)).filter((id: number) => id > 0)))
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        const sorted = [ids[i], ids[j]].sort((a, b) => a - b) as [number, number]
        const key = sorted.join(':')
        const current = pairs.get(key) || { ids: sorted, count: 0 }
        current.count += 1
        pairs.set(key, current)
      }
    }
  }

  return Array.from(pairs.values())
    .sort((a, b) => b.count - a.count)
    .map((pair) => ({
      count: pair.count,
      products: pair.ids.map((id) => productMap.get(id)).filter(Boolean)
    }))
    .filter((pair) => pair.products.length === 2)
    .slice(0, limit)
})
