import { join } from 'node:path'
import { createJsonCollectionStorage } from '~/server/storage/json-collection'

export interface WaitlistEntry {
  id: string
  productId: number
  email: string
  createdAt: string
}

const storage = createJsonCollectionStorage<WaitlistEntry>(join(process.cwd(), '.data', 'waitlist.json'), [])

export const readWaitlistEntries = async () => await storage.read()

export const writeWaitlistEntries = async (items: WaitlistEntry[]) => {
  await storage.write(items)
}
