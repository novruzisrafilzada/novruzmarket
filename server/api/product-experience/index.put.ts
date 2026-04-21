import { readProductExperience, writeProductExperience } from '~/server/utils/product-experience-db'

export default defineEventHandler(async (event) => {
  const current = await readProductExperience()
  const body = await readBody(event)
  return await writeProductExperience({
    ...current,
    ...(body || {})
  } as any)
})
