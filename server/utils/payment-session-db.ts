import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { replaceJsonFile } from '~/server/utils/json-file'

const dataDir = join(process.cwd(), '.data')
const filePath = join(dataDir, 'payment-sessions.json')

export interface PendingPaymentSession {
  id: string
  provider: 'stripe'
  stripeSessionId: string
  userId: number
  customer: string
  email: string
  phone: string
  address: string
  amount: number
  items: any[]
  couponCode?: string
  discountAmount?: number
  shippingMethodId?: number
  shippingMethodName?: string
  shippingFee?: number
  shippingEta?: string
  shippingRegion?: string
  createdAt: string
  confirmedAt?: string
  orderId?: string
  trackingCode?: string
}

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const safeReadJson = async () => {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed as PendingPaymentSession[] : null
  } catch {
    return null
  }
}

const atomicWriteJson = async (value: unknown) => {
  await ensureDir()
  await replaceJsonFile(filePath, value)
}

export const readPaymentSessions = async () => {
  const existing = await safeReadJson()
  if (existing) return existing
  await atomicWriteJson([])
  return [] as PendingPaymentSession[]
}

export const writePaymentSessions = async (entries: PendingPaymentSession[]) => {
  await atomicWriteJson(entries)
}
