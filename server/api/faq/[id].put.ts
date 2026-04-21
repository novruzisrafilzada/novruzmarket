import { createError, readBody } from 'h3'
import { readFaq, writeFaq } from '~/server/utils/faq-db'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  const body = await readBody<any>(event)
  const items = await readFaq()

  const idx = items.findIndex((i: any) => Number(i.id) === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'FAQ not found' })

  items[idx] = { ...items[idx], ...body, id }
  await writeFaq(items)
  return items[idx]
})

