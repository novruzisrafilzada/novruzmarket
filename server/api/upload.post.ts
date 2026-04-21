import { promises as fs } from 'node:fs'
import { join, extname } from 'node:path'
import { randomUUID } from 'node:crypto'

const uploadDir = (() => {
  if (process.env.NODE_ENV === 'production') {
    return join(process.cwd(), '.output', 'public', 'uploads')
  }
  return join(process.cwd(), 'public', 'uploads')
})()

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  const files = (parts || []).filter((p: any) => p && p.filename && p.data)
  if (files.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No file' })
  }

  await fs.mkdir(uploadDir, { recursive: true })

  const urls: string[] = []
  for (const file of files) {
    const original = String(file.filename || '')
    const ext = extname(original) || '.png'
    const name = `${Date.now()}-${randomUUID()}${ext}`
    await fs.writeFile(join(uploadDir, name), file.data)
    urls.push(`/uploads/${name}`)
  }

  return { url: urls[0], urls }
})
