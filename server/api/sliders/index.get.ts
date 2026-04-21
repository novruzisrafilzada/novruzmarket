import { readSliders } from '~/server/utils/sliders-db'

export default defineEventHandler(async () => {
  return await readSliders()
})

