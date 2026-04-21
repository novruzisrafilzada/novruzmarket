import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import seedLogs from '../data/seed-logs'
import { replaceJsonFile } from '~/server/utils/json-file'

const dataDir = join(process.cwd(), '.data')
const logsPath = join(dataDir, 'logs.json')

export interface DbLog {
  id: number
  user: string
  action: string
  ip: string
  date: string
}

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const safeReadJson = async () => {
  try {
    const raw = await fs.readFile(logsPath, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as DbLog[]) : null
  } catch {
    return null
  }
}

const atomicWriteJson = async (value: unknown) => {
  await ensureDir()
  await replaceJsonFile(logsPath, value)
}

export const readLogs = async () => {
  const existing = await safeReadJson()
  if (existing) return existing
  await atomicWriteJson(seedLogs)
  return seedLogs as DbLog[]
}

export const writeLogs = async (logs: DbLog[]) => {
  await atomicWriteJson(logs)
}

export const appendLog = async (entry: Omit<DbLog, 'id' | 'date'>) => {
  const logs = await readLogs()
  const maxId = logs.length > 0 ? Math.max(...logs.map(l => Number(l.id) || 0)) : 0
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  const created: DbLog = { id: maxId + 1, date, ...entry }
  logs.unshift(created)
  await writeLogs(logs)
  return created
}
