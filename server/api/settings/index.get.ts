import { readSettings } from '~/server/utils/settings-db'

export default defineEventHandler(async () => {
  return await readSettings()
})

