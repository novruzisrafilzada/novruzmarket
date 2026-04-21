import { readOrders } from '~/server/utils/orders-db'
import { readProducts } from '~/server/utils/products-db'
import { getRequestUser } from '~/server/utils/auth-session'
import { normalizeEmail } from '~/server/utils/users-db'

export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event)
  if (!user) {
    return []
  }

  const orders = await readOrders()
  if (user.role === 'Admin') {
    return orders
  }

  if (user.role === 'Satıcı') {
    const products = await readProducts()
    const sellerProductIds = new Set(
      products
        .filter((product: any) => Number(product?.sellerId) === Number(user.id))
        .map((product: any) => Number(product?.id))
    )

    return orders
      .map((order: any) => {
        const items = Array.isArray(order?.items)
          ? order.items.filter((item: any) => sellerProductIds.has(Number(item?.id)))
          : []
        if (!items.length) return null
        const amount = items.reduce((sum: number, item: any) => sum + Number(item?.price || 0) * Number(item?.qty || 0), 0)
        return { ...order, items, amount }
      })
      .filter(Boolean)
  }

  return orders.filter((order: any) => normalizeEmail(order?.email) === normalizeEmail(user.email))
})
