import { readBody } from 'h3'
import { readAnalytics, writeAnalytics } from '~/server/utils/analytics-db'

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  const section = String(body?.section || '').trim()
  const target = String(body?.target || '').trim() || 'unknown'
  const action = String(body?.action || 'click').trim()
  if (!section) return { ok: false }

  const analytics = await readAnalytics()
  const current = analytics.homeSectionClicks[section] || { clicks: 0, addToCarts: 0, lastClickedAt: '', lastAddedToCartAt: '', targets: {}, cartTargets: {} }
  if (action === 'add_to_cart') {
    current.addToCarts = Number(current.addToCarts || 0) + 1
    current.lastAddedToCartAt = new Date().toISOString()
    current.cartTargets[target] = Number(current.cartTargets[target] || 0) + 1
  } else {
    current.clicks = Number(current.clicks || 0) + 1
    current.lastClickedAt = new Date().toISOString()
    current.targets[target] = Number(current.targets[target] || 0) + 1
  }
  analytics.homeSectionClicks[section] = current

  await writeAnalytics(analytics)
  return { ok: true }
})
