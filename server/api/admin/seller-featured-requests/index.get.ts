import { getRequestUser } from '~/server/utils/auth-session'
import { readSellerFeaturedRequests } from '~/server/utils/seller-featured-requests-db'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  const requests = await readSellerFeaturedRequests()
  return requests.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
})
