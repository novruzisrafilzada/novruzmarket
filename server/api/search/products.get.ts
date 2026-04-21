import { getQuery } from 'h3'
import { productRepository } from '~/server/repositories/product-repository'
import { readCategories } from '~/server/utils/categories-db'
import { readSettings } from '~/server/utils/settings-db'
import { trackSearchTerm } from '~/server/utils/search-insights-db'
import { fuzzyMatchScore } from '~/utils/fuzzy-search'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = String(query.q || '').trim()
  const categoryId = query.categoryId != null ? Number(query.categoryId) : null
  const limit = Math.min(20, Math.max(1, Number(query.limit || 8)))
  const track = String(query.track || 'true') !== 'false'

  if (!q) return []

  const [settings, categories] = await Promise.all([readSettings(), readCategories()])
  const products = await productRepository.getAll()
  const categoryIds = new Set<number>()
  if (categoryId != null && Number.isFinite(categoryId) && categoryId > 0) {
    categoryIds.add(categoryId)
    let changed = true
    while (changed) {
      changed = false
      for (const category of categories) {
        const parentId = category.parentId === null ? null : Number(category.parentId)
        if (parentId !== null && categoryIds.has(parentId) && !categoryIds.has(Number(category.id))) {
          categoryIds.add(Number(category.id))
          changed = true
        }
      }
    }
  }
  const searchSynonyms = Array.isArray(settings.creativeSuite?.searchSynonyms) ? settings.creativeSuite.searchSynonyms : []
  const searchCandidates = Array.from(new Set(products.flatMap((product: any) => [
    String(product.brand || '').trim(),
    String(product.category || '').trim(),
    ...(Array.isArray(product.tags) ? product.tags.map((tag: any) => String(tag || '').trim()) : [])
  ].filter(Boolean))))
  if (track && settings.creativeSuite?.popularSearchesEnabled) {
    await trackSearchTerm(q, searchSynonyms, searchCandidates)
  }
  const synonymQueryParts = [q]
  for (const synonym of searchSynonyms) {
    const term = String(synonym?.term || '').trim()
    const aliases = Array.isArray(synonym?.aliases) ? synonym.aliases.map((item: any) => String(item || '').trim()).filter(Boolean) : []
    if ([term, ...aliases].some((item) => item.toLowerCase() === q.toLowerCase())) {
      synonymQueryParts.push(term, ...aliases)
    }
  }
  const expandedQuery = Array.from(new Set(synonymQueryParts.filter(Boolean))).join(' ')

  return products
    .map((product: any) => ({
      ...product,
      _score: fuzzyMatchScore(expandedQuery, [
        product.name,
        product.category,
        product.description,
        ...(Array.isArray(product.tags) ? product.tags : [])
      ])
    }))
    .filter((product: any) => (!product.status || product.status === 'Aktiv') && product._score > 0 && (categoryId == null || categoryIds.has(Number(product.categoryId))))
    .sort((a: any, b: any) => b._score - a._score || Number(b.sold || 0) - Number(a.sold || 0))
    .slice(0, limit)
    .map(({ _score, ...product }: any) => product)
})
