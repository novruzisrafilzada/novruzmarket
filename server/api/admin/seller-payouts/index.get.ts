import { getRequestUser } from '~/server/utils/auth-session'
import { readSellerPayoutRequests } from '~/server/utils/seller-payouts-db'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  return await readSellerPayoutRequests()
})
