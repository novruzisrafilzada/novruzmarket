import { getRequestUser } from '~/server/utils/auth-session'
import { readProductFeaturedRequests } from '~/server/utils/product-featured-requests-db'

export default defineEventHandler(async (event) => {
  const user = await getRequestUser(event, { required: true, roles: ['Satıcı'] })
  const requests = await readProductFeaturedRequests()
  return requests.filter((request) => Number(request.sellerId) === Number(user.id)).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
})
