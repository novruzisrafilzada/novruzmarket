import { getRequestUser } from '~/server/utils/auth-session'
import { readAnalytics } from '~/server/utils/analytics-db'
import { readOrders } from '~/server/utils/orders-db'
import { readProducts } from '~/server/utils/products-db'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })

  const [analytics, orders, products] = await Promise.all([
    readAnalytics(),
    readOrders(),
    readProducts()
  ])

  const totalRevenue = orders.reduce((sum: number, order: any) => sum + Number(order?.amount || 0), 0)
  const totalProductViews = products.reduce((sum: number, product: any) => sum + Number(product?.viewCount || 0), 0)
  const avgStaySeconds = analytics.totalVisits ? Math.round(analytics.totalDurationMs / analytics.totalVisits / 1000) : 0
  const uniqueSessions = Array.isArray((analytics as any).uniqueSessions) ? (analytics as any).uniqueSessions.length : 0
  const conversionRate = uniqueSessions ? Math.round((orders.length / uniqueSessions) * 100) : 0

  return {
    totals: {
      orderCount: orders.length,
      revenue: totalRevenue,
      productCount: products.length,
      totalProductViews,
      totalVisits: analytics.totalVisits,
      uniqueVisitors: Array.isArray((analytics as any).uniqueVisitors) ? (analytics as any).uniqueVisitors.length : 0,
      uniqueSessions,
      avgStaySeconds,
      conversionRate,
      lastVisitAt: analytics.lastVisitAt || ''
    },
    topProducts: [...products]
      .sort((a: any, b: any) => Number(b?.viewCount || 0) - Number(a?.viewCount || 0))
      .slice(0, 10),
    topPages: Object.entries(analytics.pageViews || {})
      .map(([path, views]) => ({ path, views: Number(views || 0) }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10),
    topDurationPages: Object.entries(analytics.durationByPath || {})
      .map(([path, durationMs]) => ({ path, durationMs: Number(durationMs || 0) }))
      .sort((a, b) => b.durationMs - a.durationMs)
      .slice(0, 10),
    topSources: Object.entries((analytics as any).sourceViews || {})
      .map(([source, views]) => ({ source, views: Number(views || 0) }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10),
    topReferrers: Object.entries((analytics as any).referrerViews || {})
      .map(([referrer, views]) => ({ referrer, views: Number(views || 0) }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10),
    topCampaigns: Object.entries((analytics as any).campaignViews || {})
      .map(([campaign, views]) => ({ campaign, views: Number(views || 0) }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10),
    latestOrders: orders.slice(0, 10)
  }
})
