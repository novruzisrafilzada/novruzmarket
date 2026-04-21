import { getRequestUser } from '~/server/utils/auth-session'
import { readProductFeaturedRequests } from '~/server/utils/product-featured-requests-db'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  const requests = await readProductFeaturedRequests()
  return requests.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
})
