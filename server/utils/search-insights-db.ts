import { join } from 'node:path'
import { createJsonCollectionStorage } from '~/server/storage/json-collection'
import { fuzzyMatchScore, normalizeSearchText } from '~/utils/fuzzy-search'

export interface SearchInsightEntry {
  term: string
  count: number
  lastSearchedAt: string
}

const storage = createJsonCollectionStorage<SearchInsightEntry>(join(process.cwd(), '.data', 'search-insights.json'), [])
const ignoredSearchTerms = new Set([
  'a',
  'an',
  'and',
  'or',
  'the',
  'for',
  'of',
  'in',
  'on',
  'with',
  'to',
  've',
  'və',
  'ile',
  'ilə',
  'bir',
  'bu',
  'that',
  'is',
  'are'
])

const normalizeCandidateList = (value: any[] = []) =>
  Array.from(new Set(value.map((item) => normalizeSearchText(String(item || ''))).filter(Boolean)))

export const normalizeTrackedTerm = (term: string, synonyms: any[] = [], candidates: string[] = []) => {
  const normalized = normalizeSearchText(String(term || ''))
  if (!normalized || normalized.length < 2 || ignoredSearchTerms.has(normalized)) return ''

  for (const synonym of Array.isArray(synonyms) ? synonyms : []) {
    const canonical = normalizeSearchText(String(synonym?.term || ''))
    const aliases = normalizeCandidateList(Array.isArray(synonym?.aliases) ? synonym.aliases : [])
    if (canonical && [canonical, ...aliases].includes(normalized)) return canonical
  }

  const knownCandidates = normalizeCandidateList(candidates)
  let bestCandidate = ''
  let bestScore = 0
  for (const candidate of knownCandidates) {
    if (!candidate || candidate === normalized) continue
    const score = fuzzyMatchScore(normalized, [candidate])
    if (score > bestScore) {
      bestScore = score
      bestCandidate = candidate
    }
  }

  if (bestScore >= 72) return bestCandidate
  return normalized
}

export const readSearchInsights = async () => await storage.read()

export const writeSearchInsights = async (items: SearchInsightEntry[]) => {
  await storage.write(items)
}

export const getNormalizedSearchInsights = async (synonyms: any[] = [], candidates: string[] = []) => {
  const items = await storage.read()
  const merged = new Map<string, SearchInsightEntry>()

  for (const item of items) {
    const normalized = normalizeTrackedTerm(String(item.term || ''), synonyms, candidates)
    if (!normalized) continue
    const current = merged.get(normalized)
    if (!current) {
      merged.set(normalized, {
        term: normalized,
        count: Math.max(0, Number(item.count || 0)),
        lastSearchedAt: String(item.lastSearchedAt || '')
      })
      continue
    }
    current.count = Math.max(0, Number(current.count || 0) + Number(item.count || 0))
    if (String(item.lastSearchedAt || '') > String(current.lastSearchedAt || '')) {
      current.lastSearchedAt = String(item.lastSearchedAt || '')
    }
  }

  return [...merged.values()]
    .sort((a, b) => Number(b.count || 0) - Number(a.count || 0) || String(b.lastSearchedAt || '').localeCompare(String(a.lastSearchedAt || '')))
    .slice(0, 100)
}

export const trackSearchTerm = async (term: string, synonyms: any[] = [], candidates: string[] = []) => {
  const normalized = normalizeTrackedTerm(term, synonyms, candidates)
  if (!normalized) return
  const items = await storage.read()
  const index = items.findIndex((item) => String(item.term || '').trim().toLowerCase() === normalized)
  if (index === -1) {
    items.unshift({ term: normalized, count: 1, lastSearchedAt: new Date().toISOString() })
  } else {
    items[index] = {
      ...items[index],
      count: Math.max(0, Number(items[index].count || 0) + 1),
      lastSearchedAt: new Date().toISOString()
    }
  }
  await storage.write(items.sort((a, b) => Number(b.count || 0) - Number(a.count || 0)).slice(0, 100))
}
