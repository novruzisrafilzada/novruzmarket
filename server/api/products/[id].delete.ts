import { createError } from 'h3'
import { readProducts, writeProducts } from '../../utils/products-db'
import { getRequestUser } from '~/server/utils/auth-session'

export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event, { required: true, roles: ['Admin', 'Satıcı'] })
  const id = Number(getRouterParam(event, 'id'))
  const products = await readProducts()
  const target = products.find((p: any) => Number(p.id) === id)
  if (!target) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }
  if (user.role === 'Satıcı' && Number((target as any).sellerId) !== Number(user.id)) {
    throw createError({ statusCode: 403, statusMessage: 'Bu məhsulu silməyə icazəniz yoxdur' })
  }
  const next = products.filter((p: any) => Number(p.id) !== id)
  await writeProducts(next)
  return { ok: true }
})
