import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import seedSliders from '~/data/seed-sliders'
import { replaceJsonFile } from '~/server/utils/json-file'
import type { Slider } from '~/stores/sliders'

const dataDir = join(process.cwd(), '.data')
const slidersPath = join(dataDir, 'sliders.json')

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const safeReadJson = async () => {
  try {
    const raw = await fs.readFile(slidersPath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Slider[]) : null
  } catch {
    return null
  }
}

const atomicWriteJson = async (value: unknown) => {
  await ensureDir()
  await replaceJsonFile(slidersPath, value)
}

export const readSliders = async () => {
  const existing = await safeReadJson()
  if (existing) return existing
  await atomicWriteJson(seedSliders)
  return seedSliders as unknown as Slider[]
}

export const writeSliders = async (sliders: Slider[]) => {
  await atomicWriteJson(sliders)
}
