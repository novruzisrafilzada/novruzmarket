import { promises as fs } from 'node:fs'
import { join } from 'node:path'

const dataDir = join(process.cwd(), '.data')
const adminPortalPath = join(dataDir, 'admin-portal.json')

export type AdminPortalConfig = {
  pathSegment: string
}

const reservedSegments = new Set(['', 'api', '_nuxt', 'login', 'signup', 'seller'])

export const normalizeAdminPathSegment = (value: string) => {
  const cleaned = String(value || 'admin')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '')
  if (!cleaned || reservedSegments.has(cleaned)) return 'admin'
  return cleaned
}

const ensureDir = async () => {
  await fs.mkdir(dataDir, { recursive: true })
}

const defaultConfig = (): AdminPortalConfig => ({
  pathSegment: 'admin'
})

export const readAdminPortalConfig = async () => {
  try {
    const raw = await fs.readFile(adminPortalPath, 'utf8')
    const parsed = JSON.parse(raw || '{}')
    return {
      pathSegment: normalizeAdminPathSegment(parsed?.pathSegment || 'admin')
    } as AdminPortalConfig
  } catch {
    const fallback = defaultConfig()
    await writeAdminPortalConfig(fallback)
    return fallback
  }
}

export const writeAdminPortalConfig = async (input: Partial<AdminPortalConfig>) => {
  const next: AdminPortalConfig = {
    ...defaultConfig(),
    ...(input || {}),
    pathSegment: normalizeAdminPathSegment(String(input?.pathSegment || 'admin'))
  }
  await ensureDir()
  await fs.writeFile(adminPortalPath, JSON.stringify(next, null, 2), 'utf8')
  return next
}
