import { promises as fs } from 'node:fs'
import { dirname } from 'node:path'
import { replaceJsonFile } from '~/server/utils/json-file'

export interface CollectionStorage<T> {
  read(): Promise<T[]>
  write(items: T[]): Promise<void>
}

export const createJsonCollectionStorage = <T>(filePath: string, seed: T[] = []): CollectionStorage<T> => {
  const ensureDir = async () => {
    await fs.mkdir(dirname(filePath), { recursive: true })
  }

  return {
    async read() {
      try {
        const raw = await fs.readFile(filePath, 'utf8')
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed as T[] : [...seed]
      } catch {
        await ensureDir()
        await replaceJsonFile(filePath, seed)
        return [...seed]
      }
    },
    async write(items: T[]) {
      await ensureDir()
      await replaceJsonFile(filePath, items)
    }
  }
}
