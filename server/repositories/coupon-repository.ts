import { join } from 'node:path'
import { createJsonCollectionStorage } from '~/server/storage/json-collection'

export interface CouponEntity {
  id: number
  code: string
  discount: number
  type: 'Percentage' | 'Fixed'
  expiryDate: string
  status: 'Aktiv' | 'Deaktiv'
  minSubtotal?: number
  usageLimit?: number
  usedCount?: number
  allowedUserEmails?: string[]
}

export interface CouponRepository {
  getAll(): Promise<CouponEntity[]>
  getByCode(code: string): Promise<CouponEntity | null>
  saveAll(items: CouponEntity[]): Promise<void>
}

const seedCoupons: CouponEntity[] = [
  { id: 1, code: 'YENI20', discount: 20, type: 'Percentage', expiryDate: '2026-12-31', status: 'Aktiv', minSubtotal: 50, usageLimit: 100, usedCount: 0, allowedUserEmails: [] },
  { id: 2, code: 'BAHAR10', discount: 10, type: 'Fixed', expiryDate: '2026-12-31', status: 'Aktiv', minSubtotal: 30, usageLimit: 50, usedCount: 0, allowedUserEmails: [] }
]

const storage = createJsonCollectionStorage<CouponEntity>(join(process.cwd(), '.data', 'coupons.json'), seedCoupons)

export const couponRepository: CouponRepository = {
  async getAll() {
    return await storage.read()
  },
  async getByCode(code: string) {
    const normalized = String(code || '').trim().toUpperCase()
    if (!normalized) return null
    const items = await storage.read()
    return items.find((item) => String(item.code || '').trim().toUpperCase() === normalized) || null
  },
  async saveAll(items: CouponEntity[]) {
    await storage.write(items)
  }
}
