import { getRequestUser } from '~/server/utils/auth-session'
import { readSellerPayoutRequests } from '~/server/utils/seller-payouts-db'

export default defineEventHandler(async (event) => {
  const currentUser = await getRequestUser(event, { required: true, roles: ['Satıcı'] })
  const requests = await readSellerPayoutRequests()
  return requests.filter((item) => Number(item.sellerId) === Number(currentUser.id))
})
