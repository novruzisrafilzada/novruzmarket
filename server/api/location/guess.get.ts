import { matchAzerbaijanLocation } from '~/utils/azerbaijan-locations'

export default defineEventHandler((event) => {
  const headers = event.node.req.headers
  const candidates = [
    headers['x-vercel-ip-city'],
    headers['cf-ipcity'],
    headers['x-appengine-city'],
    headers['x-city']
  ]

  for (const raw of candidates) {
    const value = String(Array.isArray(raw) ? raw[0] : raw || '').trim()
    const matched = matchAzerbaijanLocation(value)
    if (matched) {
      return { city: matched, source: 'ip-header' }
    }
  }

  return { city: '', source: 'none' }
})
