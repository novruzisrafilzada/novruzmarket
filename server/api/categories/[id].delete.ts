import { readCategories, writeCategories } from '~/server/utils/categories-db'
import { readProducts, writeProducts } from '~/server/utils/products-db'

const collectDescendants = (all: { id: number; parentId: number | null }[], rootId: number) => {
  const ids = new Set<number>([rootId])
  let changed = true
  while (changed) {
    changed = false
    for (const c of all) {
      if (c.parentId !== null && ids.has(c.parentId) && !ids.has(c.id)) {
        ids.add(c.id)
        changed = true
      }
    }
  }
  return Array.from(ids)
}

export default defineEventHandler(async (event) => {
  const id = Number((event.context.params as any).id)
  if (!Number.isFinite(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })

  const categories = await readCategories()
  if (!categories.some(c => c.id === id)) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const toDelete = new Set<number>(collectDescendants(categories, id))
  const nextCategories = categories.filter(c => !toDelete.has(c.id))
  await writeCategories(nextCategories as any)

  const products = await readProducts()
  let changed = false
  const nextProducts = products.map((p: any) => {
    if (p?.categoryId && toDelete.has(Number(p.categoryId))) {
      changed = true
      return { ...p, categoryId: null }
    }
    return p
  })
  if (changed) await writeProducts(nextProducts)

  return { ok: true }
})

