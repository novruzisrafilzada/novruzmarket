import { getQuery } from 'h3'
import { readSettings } from '~/server/utils/settings-db'
import { getNormalizedSearchInsights } from '~/server/utils/search-insights-db'

export default defineEventHandler(async (event) => {
  const settings = await readSettings()
  if (!settings.creativeSuite?.popularSearchesEnabled) return []

  const query = getQuery(event)
  const limit = Math.min(12, Math.max(1, Number(query.limit || 6)))
  const searchSynonyms = Array.isArray(settings.creativeSuite?.searchSynonyms) ? settings.creativeSuite.searchSynonyms : []
  const insights = await getNormalizedSearchInsights(searchSynonyms)

  return insights
    .slice()
    .sort((a, b) => Number(b.count || 0) - Number(a.count || 0))
    .slice(0, limit)
    .map((item) => String(item.term || '').trim())
    .filter(Boolean)
})
