import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { replaceJsonFile } from '~/server/utils/json-file'

const dataDir = join(process.cwd(), '.data')
const filePath = join(dataDir, 'product-featured-requests.json')

export interface ProductFeaturedRequest {
  id: number
  productId: number
  productName: string
  sellerId: number
  sellerName: string
  shopName: string
  planDays: number
  planLabel: string
  amount: number
  paymentNote: string
  status: 'Gözləyir' | 'Təsdiqləndi' | 'Rədd edildi'
  submittedAt: string
  approvedAt?: string
  approvedBy?: string
}

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
    return Array.isArray(parsed) ? parsed as ProductFeaturedRequest[] : null
  } catch {
    return null
  }
}

export const readProductFeaturedRequests = async () => {
  const existing = await safeReadJson()
  if (existing) return existing
  await atomicWriteJson([])
  return [] as ProductFeaturedRequest[]
}

export const writeProductFeaturedRequests = async (requests: ProductFeaturedRequest[]) => {
  await atomicWriteJson(requests)
}
