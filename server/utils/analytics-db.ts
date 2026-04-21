import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { replaceJsonFile } from '~/server/utils/json-file'

const dataDir = join(process.cwd(), '.data')
const filePath = join(dataDir, 'analytics.json')

export interface AnalyticsStore {
  totalVisits: number
  totalDurationMs: number
  uniqueVisitors: string[]
  uniqueSessions: string[]
  pageViews: Record<string, number>
  durationByPath: Record<string, number>
  sourceViews: Record<string, number>
  referrerViews: Record<string, number>
  campaignViews: Record<string, number>
  homeSectionClicks: Record<string, { clicks: number; addToCarts: number; lastClickedAt?: string; lastAddedToCartAt?: string; targets: Record<string, number>; cartTargets: Record<string, number> }>
  lastVisitAt?: string
}

const defaultAnalytics = (): AnalyticsStore => ({
  totalVisits: 0,
  totalDurationMs: 0,
  uniqueVisitors: [],
  uniqueSessions: [],
  pageViews: {},
  durationByPath: {},
  sourceViews: {},
  referrerViews: {},
  campaignViews: {},
  homeSectionClicks: {}
})

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const atomicWriteJson = async (value: unknown) => {
  await ensureDir()
  await replaceJsonFile(filePath, value)
}

const safeReadJson = async () => {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed as AnalyticsStore : null
  } catch {
    return null
  }
}

export const readAnalytics = async () => {
  const existing = await safeReadJson()
  if (existing) {
    return {
      totalVisits: Number(existing.totalVisits || 0),
      totalDurationMs: Number(existing.totalDurationMs || 0),
      uniqueVisitors: Array.isArray((existing as any).uniqueVisitors) ? (existing as any).uniqueVisitors : [],
      uniqueSessions: Array.isArray((existing as any).uniqueSessions) ? (existing as any).uniqueSessions : [],
      pageViews: existing.pageViews || {},
      durationByPath: (existing as any).durationByPath || {},
      sourceViews: (existing as any).sourceViews || {},
      referrerViews: (existing as any).referrerViews || {},
      campaignViews: (existing as any).campaignViews || {},
      homeSectionClicks: Object.fromEntries(
        Object.entries((existing as any).homeSectionClicks || {}).map(([key, value]: [string, any]) => [
          key,
          {
            clicks: Number(value?.clicks || 0),
            addToCarts: Number(value?.addToCarts || 0),
            lastClickedAt: value?.lastClickedAt || '',
            lastAddedToCartAt: value?.lastAddedToCartAt || '',
            targets: value?.targets || {},
            cartTargets: value?.cartTargets || {}
          }
        ])
      ),
      lastVisitAt: existing.lastVisitAt || ''
    } as AnalyticsStore
  }
  const fresh = defaultAnalytics()
  await atomicWriteJson(fresh)
  return fresh
}

export const writeAnalytics = async (analytics: AnalyticsStore) => {
  await atomicWriteJson(analytics)
}
