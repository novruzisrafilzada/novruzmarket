import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { replaceJsonFile } from '~/server/utils/json-file'

export interface DbShippingMethod {
  id: number
  name: string
  price: number
  duration: string
  status: 'Aktiv' | 'Deaktiv'
  regions?: string[]
  freeOver?: number
  etaDaysMin?: number
  etaDaysMax?: number
}

const seedMethods: DbShippingMethod[] = [
  { id: 1, name: 'Standart Çatdırılma', price: 5, duration: '2-3 gün', status: 'Aktiv', regions: ['Bakı', 'Sumqayıt'], freeOver: 120, etaDaysMin: 2, etaDaysMax: 3 },
  { id: 2, name: 'Sürətli Çatdırılma', price: 15, duration: '24 saat', status: 'Aktiv', regions: ['Bakı'], freeOver: 0, etaDaysMin: 1, etaDaysMax: 1 },
  { id: 3, name: 'Mağazadan götürmə', price: 0, duration: 'Dərhal', status: 'Aktiv', regions: [], freeOver: 0, etaDaysMin: 0, etaDaysMax: 0 }
]

const dataDir = join(process.cwd(), '.data')
const filePath = join(dataDir, 'shipping.json')

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const readRaw = async () => {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export const readShippingMethods = async () => {
  const existing = await readRaw()
  if (existing) return existing as DbShippingMethod[]
  await ensureDir()
  await replaceJsonFile(filePath, seedMethods)
  return seedMethods
}

export const writeShippingMethods = async (methods: DbShippingMethod[]) => {
  await ensureDir()
  await replaceJsonFile(filePath, methods)
}
