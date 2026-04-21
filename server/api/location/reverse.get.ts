import { createError, getQuery } from 'h3'
import { matchAzerbaijanLocation } from '~/utils/azerbaijan-locations'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const lat = Number(query.lat || 0)
  const lon = Number(query.lon || 0)

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw createError({ statusCode: 400, statusMessage: 'Koordinatlar yanlışdır' })
  }

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=az,en`, {
      headers: {
        'User-Agent': 'markett-local-checkout'
      }
    })
    const payload = await response.json() as any
    const address = payload?.address || {}
    const candidates = [
      address.city,
      address.town,
      address.county,
      address.state_district,
      address.state,
      address.municipality
    ]

    for (const raw of candidates) {
      const matched = matchAzerbaijanLocation(String(raw || ''))
      if (matched) {
        return { city: matched, source: 'device-geolocation' }
      }
    }
  } catch {}

  return { city: '', source: 'none' }
})
