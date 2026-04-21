import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { replaceJsonFile } from '~/server/utils/json-file'
import seedReviews from '../data/seed-reviews'

const dataDir = join(process.cwd(), '.data')
const reviewsPath = join(dataDir, 'reviews.json')

export interface Review {
  id: number
  productId: number
  name: string
  email: string
  rating: number
  comment: string
  createdAt: string
  verifiedPurchase?: boolean
  images?: string[]
  helpfulCount?: number
}

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const safeReadJson = async () => {
  try {
    const raw = await fs.readFile(reviewsPath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Review[]) : null
  } catch {
    return null
  }
}

const atomicWriteJson = async (value: unknown) => {
  await ensureDir()
  await replaceJsonFile(reviewsPath, value)
}

export const readReviews = async () => {
  const existing = await safeReadJson()
  if (existing) return existing
  await atomicWriteJson(seedReviews)
  return seedReviews as Review[]
}

export const writeReviews = async (reviews: Review[]) => {
  await atomicWriteJson(reviews)
}
