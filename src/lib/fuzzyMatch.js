/**
 * Lightweight fzf-style subsequence fuzzy matcher.
 * Rewards consecutive matches, word-boundary starts, and shorter targets.
 */
export function fuzzyMatch(query, target) {
  const needle = query.trim().toLowerCase()
  if (!needle) return { matched: true, score: 0, indices: [] }

  const hay = target.toLowerCase()
  const indices = []
  let score = 0
  let needleIndex = 0
  let prevMatch = -2

  for (let i = 0; i < hay.length && needleIndex < needle.length; i++) {
    if (hay[i] === needle[needleIndex]) {
      indices.push(i)
      // Consecutive match bonus
      if (i === prevMatch + 1) score += 16
      // Word boundary / path separator bonus
      if (i === 0 || /[\s/._:-]/.test(hay[i - 1])) score += 12
      // Exact case match bonus
      if (target[i] === query.trim()[needleIndex]) score += 2
      // Small penalty for distance from previous match
      if (prevMatch >= 0) score -= Math.min(i - prevMatch - 1, 8)
      prevMatch = i
      needleIndex++
    }
  }

  if (needleIndex !== needle.length) return { matched: false, score: -Infinity, indices: [] }
  // Prefer concise matches
  score -= Math.floor((hay.length - needle.length) * 0.35)
  return { matched: true, score, indices }
}

/**
 * Filter and rank items by fuzzy matching across primary label and optional metadata.
 */
export function rankFuzzyItems(items, query, getText) {
  const trimmed = query.trim()
  if (!trimmed) return items.map((item) => ({ item, score: 0, indices: [] }))

  const ranked = []
  for (const item of items) {
    const label = getText(item)
    const primary = fuzzyMatch(trimmed, label)
    if (primary.matched) {
      ranked.push({ item, score: primary.score + 20, indices: primary.indices })
      continue
    }
    const extra = item.keywords ? fuzzyMatch(trimmed, item.keywords) : null
    if (extra?.matched) {
      ranked.push({ item, score: extra.score, indices: [] })
    }
  }

  return ranked.sort((a, b) => b.score - a.score)
}
