import { readBody } from 'h3'
import { readFaq, writeFaq } from '~/server/utils/faq-db'

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  const items = await readFaq()
  const maxId = items.length > 0 ? Math.max(...items.map((i: any) => Number(i.id) || 0)) : 0
  const created = { ...body, id: maxId + 1 }
  items.unshift(created)
  await writeFaq(items)
  return created
})

