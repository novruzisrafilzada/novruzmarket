import { createError } from 'h3'
import { couponRepository, type CouponEntity } from '~/server/repositories/coupon-repository'

const normalizeEmail = (value: string) => String(value || '').trim().toLowerCase()

const parseExpiry = (raw: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(raw || '').trim())
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 23, 59, 59, 999)
  return Number.isFinite(date.getTime()) ? date : null
}

export const validateCouponForCheckout = async (args: {
  code: string
  subtotal: number
  userEmail?: string
}) => {
  const rawCode = String(args.code || '').trim().toUpperCase()
  if (!rawCode) {
    throw createError({ statusCode: 400, statusMessage: 'Kupon kodu vacibdir', message: 'Kupon kodunu daxil edin.' })
  }

  const coupon = await couponRepository.getByCode(rawCode)
  if (!coupon || coupon.status !== 'Aktiv') {
    throw createError({ statusCode: 404, statusMessage: 'Kupon tapılmadı', message: 'Bu kupon mövcud deyil və ya deaktivdir.' })
  }

  const expiry = parseExpiry(coupon.expiryDate)
  if (!expiry || expiry.getTime() < Date.now()) {
    throw createError({ statusCode: 400, statusMessage: 'Kuponun vaxtı bitib', message: 'Bu kuponun istifadə vaxtı bitib.' })
  }

  const subtotal = Math.max(0, Number(args.subtotal || 0))
  const minSubtotal = Math.max(0, Number(coupon.minSubtotal || 0))
  if (minSubtotal > 0 && subtotal < minSubtotal) {
    throw createError({ statusCode: 400, statusMessage: 'Minimum səbət şərti ödənmir', message: `Bu kupon üçün minimum səbət məbləği ${minSubtotal.toFixed(2)} AZN-dir.` })
  }

  const usageLimit = Math.max(0, Number(coupon.usageLimit || 0))
  const usedCount = Math.max(0, Number(coupon.usedCount || 0))
  if (usageLimit > 0 && usedCount >= usageLimit) {
    throw createError({ statusCode: 400, statusMessage: 'Kupon limiti bitib', message: 'Bu kuponun istifadə limiti dolub.' })
  }

  const allowedUserEmails = Array.isArray(coupon.allowedUserEmails)
    ? coupon.allowedUserEmails.map((item) => normalizeEmail(item)).filter(Boolean)
    : []
  const userEmail = normalizeEmail(String(args.userEmail || ''))
  if (allowedUserEmails.length > 0 && (!userEmail || !allowedUserEmails.includes(userEmail))) {
    throw createError({ statusCode: 403, statusMessage: 'Kupon sizə aid deyil', message: 'Bu kupon yalnız seçilmiş istifadəçilər üçündür.' })
  }

  let discountAmount = coupon.type === 'Percentage'
    ? (subtotal * Math.max(0, Number(coupon.discount || 0))) / 100
    : Math.max(0, Number(coupon.discount || 0))
  discountAmount = Math.max(0, Math.min(subtotal, Number(discountAmount.toFixed(2))))

  return {
    coupon,
    normalizedCode: rawCode,
    discountAmount
  }
}

export const markCouponUsed = async (couponOrCode: CouponEntity | string) => {
  const normalized = typeof couponOrCode === 'string'
    ? String(couponOrCode || '').trim().toUpperCase()
    : String(couponOrCode.code || '').trim().toUpperCase()
  if (!normalized) return
  const items = await couponRepository.getAll()
  const index = items.findIndex((item) => String(item.code || '').trim().toUpperCase() === normalized)
  if (index === -1) return
  items[index] = {
    ...items[index],
    usedCount: Math.max(0, Number(items[index].usedCount || 0) + 1)
  }
  await couponRepository.saveAll(items)
}
