import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { replaceJsonFile } from '~/server/utils/json-file'

const dataDir = join(process.cwd(), '.data')
const filePath = join(dataDir, 'product-alerts.json')

export type ProductAlertType = 'price_drop' | 'restock'

export type ProductAlertRecord = {
  id: string
  productId: number
  productName: string
  email: string
  type: ProductAlertType
  status: 'pending' | 'sent' | 'dismissed'
  createdAt: string
  sentAt?: string
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
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

const normalize = (value: any): ProductAlertRecord | null => {
  const productId = Number(value?.productId || 0)
  const email = String(value?.email || '').trim().toLowerCase()
  const type = value?.type === 'restock' ? 'restock' : 'price_drop'
  if (!productId || !email) return null
  return {
    id: String(value?.id || randomUUID()),
    productId,
    productName: String(value?.productName || '').trim(),
    email,
    type,
    status: value?.status === 'sent' ? 'sent' : value?.status === 'dismissed' ? 'dismissed' : 'pending',
    createdAt: String(value?.createdAt || new Date().toISOString()),
    sentAt: value?.sentAt ? String(value.sentAt) : undefined
  }
}

export const readProductAlerts = async (): Promise<ProductAlertRecord[]> => {
  const existing = await safeReadJson()
  if (!existing) {
    await atomicWriteJson([])
    return []
  }
  const normalized = existing.map(normalize).filter(Boolean) as ProductAlertRecord[]
  if (normalized.length !== existing.length) await atomicWriteJson(normalized)
  return normalized
}

export const writeProductAlerts = async (value: ProductAlertRecord[]) => {
  await atomicWriteJson(value)
}

export const addProductAlert = async (input: Omit<ProductAlertRecord, 'id' | 'createdAt' | 'status' | 'sentAt'> & Partial<Pick<ProductAlertRecord, 'status' | 'sentAt'>>) => {
  const current = await readProductAlerts()
  const duplicate = current.find((item) =>
    item.productId === input.productId &&
    item.email === input.email.trim().toLowerCase() &&
    item.type === input.type
  )
  if (duplicate) return duplicate

  const record: ProductAlertRecord = {
    id: randomUUID(),
    productId: input.productId,
    productName: input.productName.trim(),
    email: input.email.trim().toLowerCase(),
    type: input.type,
    status: input.status || 'pending',
    createdAt: new Date().toISOString(),
    sentAt: input.sentAt
  }
  current.unshift(record)
  await writeProductAlerts(current)
  return record
}

export const updateProductAlert = async (id: string, patch: Partial<ProductAlertRecord>) => {
  const current = await readProductAlerts()
  const index = current.findIndex((item) => item.id === id)
  if (index === -1) return null
  current[index] = normalize({
    ...current[index],
    ...patch,
    sentAt: patch.status === 'sent'
      ? (patch.sentAt || current[index].sentAt || new Date().toISOString())
      : patch.status === 'pending'
        ? undefined
        : patch.sentAt ?? current[index].sentAt
  }) as ProductAlertRecord
  await writeProductAlerts(current)
  return current[index]
}
