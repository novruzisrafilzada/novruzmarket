export const normalizeSearchText = (value: string) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9а-яəöğüşçı\s-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const levenshteinDistance = (a: string, b: string) => {
  const rows = a.length + 1
  const cols = b.length + 1
  const dp = Array.from({ length: rows }, () => Array(cols).fill(0))
  for (let i = 0; i < rows; i++) dp[i][0] = i
  for (let j = 0; j < cols; j++) dp[0][j] = j
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      )
    }
  }
  return dp[a.length][b.length]
}

export const fuzzyMatchScore = (query: string, haystackParts: string[]) => {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return 0
  const qTokens = normalizedQuery.split(' ').filter(Boolean)
  const normalizedParts = haystackParts.map((item) => normalizeSearchText(item)).filter(Boolean)
  let score = 0

  for (const token of qTokens) {
    let tokenScore = 0
    for (const part of normalizedParts) {
      if (!part) continue
      if (part.includes(token)) {
        tokenScore = Math.max(tokenScore, token.length >= 4 ? 120 : 90)
        continue
      }
      const partTokens = part.split(' ').filter(Boolean)
      for (const partToken of partTokens) {
        if (partToken.startsWith(token) || token.startsWith(partToken)) {
          tokenScore = Math.max(tokenScore, 80)
          continue
        }
        const distance = levenshteinDistance(token, partToken)
        const threshold = token.length <= 4 ? 1 : 2
        if (distance <= threshold) {
          tokenScore = Math.max(tokenScore, 65 - distance * 10)
        }
      }
    }
    if (!tokenScore) return 0
    score += tokenScore
  }

  return score
}
