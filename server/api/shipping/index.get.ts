import { readShippingMethods } from '~/server/utils/shipping-db'

export default defineEventHandler(async () => {
  return await readShippingMethods()
})
