import { readBody } from 'h3'
import { readHomeSections, writeHomeSections } from '~/server/utils/home-sections-db'

export default defineEventHandler(async (event) => {
  const body = await readBody<any>(event)
  const current = await readHomeSections()
  const next = { ...current, ...body }
  await writeHomeSections(next)
  return next
})

