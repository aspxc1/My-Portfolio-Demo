const cacheMs = 60 * 60 * 1000
const requests = new Map()

export function normalizeRepositories(payload, username) {
  if (!Array.isArray(payload)) throw new Error("Repository list unavailable")
  const repos = payload.map((row) => {
    if (!row || typeof row.name !== "string" || !/^[a-z\d_.-]+$/i.test(row.name) || !Number.isSafeInteger(row.id)
      || !Number.isSafeInteger(row.size) || row.size < 0
      || !(row.pushed_at === null || (typeof row.pushed_at === "string" && Number.isFinite(Date.parse(row.pushed_at))))) {
      throw new Error("Invalid repository data")
    }
    const normalized = {
      id: row.id,
      name: row.name,
      url: `https://github.com/${encodeURIComponent(username)}/${encodeURIComponent(row.name)}`,
      language: typeof row.language === "string" ? row.language : null,
      pushedAt: row.pushed_at,
      size: row.size,
    }
    if (typeof row.description === "string" && row.description.trim()) {
      normalized.description = row.description.trim()
    }
    if (Number.isSafeInteger(row.stargazers_count) && row.stargazers_count > 0) {
      normalized.stars = row.stargazers_count
    }
    if (typeof row.homepage === "string" && /^https?:\/\//i.test(row.homepage.trim())) {
      normalized.homepage = row.homepage.trim()
    }
    if (typeof row.fork === "boolean" && row.fork) {
      normalized.fork = true
    }
    return normalized
  }).sort((a, b) => (Date.parse(b.pushedAt) || 0) - (Date.parse(a.pushedAt) || 0) || a.name.localeCompare(b.name))

  return { repos, totalSize: repos.reduce((total, repo) => total + repo.size, 0) }
}

export function loadRepositories(username, { fetcher = fetch, now = new Date() } = {}) {
  if (!/^[a-z\d-]{1,39}$/i.test(username)) return Promise.reject(new Error("Invalid GitHub username"))
  const timestamp = new Date(now).getTime()
  const cached = requests.get(username)
  if (cached && cached.expiresAt > timestamp) return cached.promise
  const entry = { expiresAt: timestamp + cacheMs }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 12000)
  entry.promise = (async () => {
    const response = await fetcher(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&direction=desc&per_page=100`, {
      signal: controller.signal, credentials: "omit", referrerPolicy: "no-referrer",
    })
    if (!response.ok) {
      const limited = response.status === 429 || (response.status === 403 && (
        response.headers?.get("x-ratelimit-remaining") === "0" || response.headers?.get("retry-after")
      ))
      const error = new Error(`GitHub repositories unavailable (${response.status})`)
      error.status = limited ? 429 : response.status
      throw error
    }
    return {
      ...normalizeRepositories(await response.json(), username),
      hasMore: response.headers?.get("link")?.includes('rel="next"') ?? false,
      updatedAt: new Date(timestamp).toISOString(),
    }
  })().catch((error) => {
    if (requests.get(username) === entry) requests.delete(username)
    throw error
  }).finally(() => clearTimeout(timer))
  requests.set(username, entry)
  return entry.promise
}
