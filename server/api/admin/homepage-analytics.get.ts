import { getRequestUser } from '~/server/utils/auth-session'
import { readAnalytics } from '~/server/utils/analytics-db'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  const analytics = await readAnalytics()
  const sections = Object.entries(analytics.homeSectionClicks || {})
    .map(([section, value]: [string, any]) => ({
      section,
      clicks: Number(value?.clicks || 0),
      addToCarts: Number(value?.addToCarts || 0),
      lastClickedAt: value?.lastClickedAt || '',
      lastAddedToCartAt: value?.lastAddedToCartAt || '',
      topTargets: Object.entries(value?.targets || {})
        .map(([target, count]) => ({ target, count: Number(count || 0) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      topCartTargets: Object.entries(value?.cartTargets || {})
        .map(([target, count]) => ({ target, count: Number(count || 0) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    }))
    .sort((a, b) => b.clicks - a.clicks)

  return {
    totalSectionClicks: sections.reduce((sum, item) => sum + item.clicks, 0),
    totalAddToCarts: sections.reduce((sum, item) => sum + item.addToCarts, 0),
    sections
  }
})
