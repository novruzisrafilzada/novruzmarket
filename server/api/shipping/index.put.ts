import { readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { type DbShippingMethod, writeShippingMethods } from '~/server/utils/shipping-db'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  const body = await readBody<DbShippingMethod[]>(event)
  const methods = Array.isArray(body) ? body : []
  await writeShippingMethods(methods)
  return methods
})
