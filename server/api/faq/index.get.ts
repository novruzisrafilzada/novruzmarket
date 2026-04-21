import { readFaq } from '~/server/utils/faq-db'

export default defineEventHandler(async () => {
  return await readFaq()
})

