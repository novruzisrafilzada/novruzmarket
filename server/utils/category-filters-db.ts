import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { replaceJsonFile } from '~/server/utils/json-file'

export type CategoryFilterGroup = {
  key: string
  label: string
  options: string[]
}

export type CategoryFilterSchema = {
  categoryId: number
  groups: CategoryFilterGroup[]
  updatedAt: string
}

const dataDir = join(process.cwd(), '.data')
const schemasPath = join(dataDir, 'category-filters.json')

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const safeReadJson = async () => {
  try {
    const raw = await fs.readFile(schemasPath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

const atomicWriteJson = async (value: unknown) => {
  await ensureDir()
  await replaceJsonFile(schemasPath, value)
}

export const readCategoryFilterSchemas = async () => {
  const existing = await safeReadJson()
  if (existing) return existing as CategoryFilterSchema[]
  await atomicWriteJson([])
  return [] as CategoryFilterSchema[]
}

export const writeCategoryFilterSchemas = async (schemas: unknown[]) => {
  await atomicWriteJson(schemas)
}
