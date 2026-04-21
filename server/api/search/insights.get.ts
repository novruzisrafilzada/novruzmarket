import { getRequestUser } from '~/server/utils/auth-session'
import { getNormalizedSearchInsights } from '~/server/utils/search-insights-db'
import { readSettings } from '~/server/utils/settings-db'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  const settings = await readSettings()
  const searchSynonyms = Array.isArray(settings.creativeSuite?.searchSynonyms) ? settings.creativeSuite.searchSynonyms : []
  return await getNormalizedSearchInsights(searchSynonyms)
})
