import { readBody } from 'h3'
import { getRequestUser } from '~/server/utils/auth-session'
import { readShopExperience, writeShopExperience } from '~/server/utils/shop-experience-db'

export default defineEventHandler(async (event) => {
  await getRequestUser(event, { required: true, roles: ['Admin'] })
  const current = await readShopExperience()
  const body = await readBody<Record<string, any>>(event)
  return await writeShopExperience({
    ...current,
    ...(body || {})
  })
})
