import { getQuery } from 'h3'
import { readReviews } from '~/server/utils/reviews-db'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const productId = Number(q.productId)
  const all = await readReviews()
  if (!Number.isFinite(productId) || productId <= 0) return []
  return all.filter(r => Number(r.productId) === productId)
})

