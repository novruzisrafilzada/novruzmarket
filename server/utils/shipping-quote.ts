import { createError } from 'h3'
import { readShippingMethods } from '~/server/utils/shipping-db'

const normalizeRegionValue = (value: string) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ə/g, 'e')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')

const regionMatches = (methodRegion: string, requestedRegion: string) => {
  const left = normalizeRegionValue(methodRegion)
  const right = normalizeRegionValue(requestedRegion)
  if (!left || !right) return false
  return left === right || left.includes(right) || right.includes(left)
}

export const resolveShippingQuote = async (args: {
  shippingMethodId?: number
  subtotal: number
  region?: string
}) => {
  const methods = await readShippingMethods()
  const method = methods.find((item) => Number(item.id) === Number(args.shippingMethodId) && item.status === 'Aktiv')
  if (!method) {
    throw createError({ statusCode: 400, statusMessage: 'Çatdırılma üsulu tapılmadı', message: 'Aktiv çatdırılma üsulu seçin.' })
  }

  const region = String(args.region || '').trim()
  if (Array.isArray(method.regions) && method.regions.length > 0 && region) {
    const regionMatched = method.regions.some((item) => regionMatches(String(item || ''), region))
    if (!regionMatched) {
      throw createError({ statusCode: 400, statusMessage: 'Bu bölgə üçün çatdırılma yoxdur', message: 'Seçilmiş bölgə üçün başqa çatdırılma üsulu seçin.' })
    }
  }

  const subtotal = Math.max(0, Number(args.subtotal || 0))
  const freeOver = Math.max(0, Number(method.freeOver || 0))
  const shippingFee = freeOver > 0 && subtotal >= freeOver ? 0 : Math.max(0, Number(method.price || 0))

  return {
    shippingMethodId: method.id,
    shippingMethodName: method.name,
    shippingFee,
    shippingEta: method.duration,
    shippingRegion: String(args.region || '').trim()
  }
}
