import { getRequestUser } from '~/server/utils/auth-session'
import { readSellerFeaturedRequests } from '~/server/utils/seller-featured-requests-db'

export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event, { required: true, roles: ['Satıcı'] })
  const requests = await readSellerFeaturedRequests()
  return requests.filter((request) => Number(request.sellerId) === Number(user.id)).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
})
