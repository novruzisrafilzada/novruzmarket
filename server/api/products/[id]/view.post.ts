import { createError } from 'h3'
import { readProducts, writeProducts } from '~/server/utils/products-db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const products = await readProducts()
  const product = products.find((item: any) => Number(item.id) === id)

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  product.viewCount = Number(product.viewCount || 0) + 1
  await writeProducts(products)

  return { ok: true, viewCount: product.viewCount }
})
