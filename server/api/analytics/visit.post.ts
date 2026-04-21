import { readBody } from 'h3'
import { readAnalytics, writeAnalytics } from '~/server/utils/analytics-db'

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  const path = String(body?.path || '/').trim() || '/'
  const durationMs = Math.max(0, Number(body?.durationMs || 0))
  const analytics = await readAnalytics()
  const visitorId = String(body?.visitorId || '').trim()
  const sessionId = String(body?.sessionId || '').trim()
  const source = String(body?.source || 'direct').trim() || 'direct'
  const referrer = String(body?.referrer || '').trim() || 'direct'
  const campaign = String(body?.campaign || '').trim()

  analytics.totalVisits += 1
  analytics.totalDurationMs += durationMs
  analytics.durationByPath[path] = Number(analytics.durationByPath[path] || 0) + durationMs
  if (visitorId && !analytics.uniqueVisitors.includes(visitorId)) analytics.uniqueVisitors.push(visitorId)
  if (sessionId && !analytics.uniqueSessions.includes(sessionId)) analytics.uniqueSessions.push(sessionId)
  analytics.pageViews[path] = Number(analytics.pageViews[path] || 0) + 1
  analytics.sourceViews[source] = Number(analytics.sourceViews[source] || 0) + 1
  analytics.referrerViews[referrer] = Number(analytics.referrerViews[referrer] || 0) + 1
  if (campaign) analytics.campaignViews[campaign] = Number(analytics.campaignViews[campaign] || 0) + 1
  analytics.lastVisitAt = new Date().toISOString()

  await writeAnalytics(analytics)
  return {
    ok: true
  }
})
