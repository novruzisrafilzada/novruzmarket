import { productRepository } from '~/server/repositories/product-repository'

export default defineEventHandler(async () => {
  return await productRepository.getAll()
})
