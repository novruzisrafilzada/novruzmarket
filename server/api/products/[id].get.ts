import { createError } from 'h3'
import { productRepository } from '~/server/repositories/product-repository'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const products = await productRepository.getAll()
  const product = products.find((item: any) => Number(item?.id) === id)

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Məhsul tapılmadı' })
  }

  return product
})
