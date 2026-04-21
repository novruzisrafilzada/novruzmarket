import { readBody } from 'h3'
import { readTopDeals, writeTopDeals } from '~/server/utils/top-deals-db'

const normalizeEndAt = (value: unknown) => {
  const s = String(value || '').trim()
  if (!s) return ''
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) return s
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return `${s}:00+04:00`
  return s
}

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  const current = await readTopDeals()
  const next = {
    enabled: typeof body?.enabled === 'boolean' ? body.enabled : Boolean(current?.enabled),
    title: String(body?.title ?? current?.title ?? 'Günün ən yaxşı təklifləri'),
    titleI18n: {
      az: String(body?.titleI18n?.az ?? current?.titleI18n?.az ?? body?.title ?? current?.title ?? 'Günün ən yaxşı təklifləri'),
      ru: String(body?.titleI18n?.ru ?? current?.titleI18n?.ru ?? 'Лучшие предложения дня'),
      en: String(body?.titleI18n?.en ?? current?.titleI18n?.en ?? 'Today’s best deals'),
    },
    endAt: normalizeEndAt(body?.endAt ?? current?.endAt),
    productIds: Array.isArray(body?.productIds) ? body.productIds.map((n: any) => Number(n)).filter((n: any) => Number.isFinite(n)) : (Array.isArray(current?.productIds) ? current.productIds : [])
  }
  await writeTopDeals(next)
  return next
})
