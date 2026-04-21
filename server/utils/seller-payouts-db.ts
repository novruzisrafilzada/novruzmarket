import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { replaceJsonFile } from '~/server/utils/json-file'

export interface SellerPayoutRequest {
  id: string
  sellerId: number
  sellerName: string
  amount: number
  note?: string
  status: 'Gözləyir' | 'Təsdiqləndi' | 'İmtina edildi'
  createdAt: string
  processedAt?: string
  processedBy?: string
  transferReference?: string
  failureReason?: string
}

const dataDir = join(process.cwd(), '.data')
const filePath = join(dataDir, 'seller-payouts.json')

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

export const readSellerPayoutRequests = async () => {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed as SellerPayoutRequest[] : []
  } catch {
    return []
  }
}

export const writeSellerPayoutRequests = async (items: SellerPayoutRequest[]) => {
  await ensureDir()
  await replaceJsonFile(filePath, items)
}
