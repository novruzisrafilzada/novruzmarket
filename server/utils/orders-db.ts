import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { replaceJsonFile } from '~/server/utils/json-file'

const dataDir = join(process.cwd(), '.data')
const ordersPath = join(dataDir, 'orders.json')

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const safeReadJson = async () => {
  try {
    const raw = await fs.readFile(ordersPath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

const atomicWriteJson = async (value: unknown) => {
  await ensureDir()
  await replaceJsonFile(ordersPath, value)
}

export const readOrders = async () => {
  const existing = await safeReadJson()
  if (existing) {
    return existing.map((order: any, index: number) => ({
      ...order,
      trackingCode: String(order?.trackingCode || `TRK-${String(index + 1).padStart(6, '0')}`)
    }))
  }
  await atomicWriteJson([])
  return []
}

export const writeOrders = async (orders: unknown[]) => {
  await atomicWriteJson(orders)
}
