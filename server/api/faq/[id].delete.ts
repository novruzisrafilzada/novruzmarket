import { readFaq, writeFaq } from '~/server/utils/faq-db'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  const items = await readFaq()
  const next = items.filter((i: any) => Number(i.id) !== id)
  await writeFaq(next)
  return { ok: true }
})

