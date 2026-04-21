import { writeSearchInsights } from '~/server/utils/search-insights-db'

export default defineEventHandler(async () => {
  await writeSearchInsights([])
  return { ok: true }
})
