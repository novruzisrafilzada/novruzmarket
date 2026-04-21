import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { writeAnalytics } from '~/server/utils/analytics-db'
import { readOrders, writeOrders } from '~/server/utils/orders-db'
import { readProducts, writeProducts } from '~/server/utils/products-db'
import { writeLogs } from '~/server/utils/logs-db'
import { writeSearchInsights } from '~/server/utils/search-insights-db'

const dataDir = join(process.cwd(), '.data')

export const resetLaunchMetrics = async () => {
  const [orders, products] = await Promise.all([
    readOrders(),
    readProducts()
  ])

  const nextProducts = products.map((product: any) => ({
    ...product,
    viewCount: 0,
    sold: 0
  }))

  await Promise.all([
    writeOrders([]),
    writeAnalytics({
      totalVisits: 0,
      totalDurationMs: 0,
      uniqueVisitors: [],
      uniqueSessions: [],
      pageViews: {},
      durationByPath: {},
      lastVisitAt: ''
    }),
    writeProducts(nextProducts),
    writeLogs([]),
    writeSearchInsights([])
  ])

  const fileNames = await fs.readdir(dataDir).catch(() => [])
  const tmpFiles = fileNames
    .filter((fileName) => fileName.endsWith('.tmp'))
    .map((fileName) => join(dataDir, fileName))

  if (tmpFiles.length) {
    await Promise.all(tmpFiles.map((filePath) => fs.rm(filePath, { force: true })))
  }

  return {
    clearedOrders: orders.length,
    resetProducts: nextProducts.length,
    cleanedTempFiles: tmpFiles.length
  }
}
