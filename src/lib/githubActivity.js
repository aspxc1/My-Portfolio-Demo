const dayMs = 86400000
const cacheMs = 60 * 60 * 1000
const requests = new Map()

export function getGitHubUsername(href) {
  try {
    const url = new URL(href)
    return url.hostname === "github.com" ? url.pathname.match(/^\/([a-z\d-]{1,39})\/?$/i)?.[1] || null : null
  } catch { return null }
}

/** Reject incomplete data rather than painting missing activity as zero. */
export function normalizeContributions(payload, now = new Date()) {
  if (!Array.isArray(payload?.contributions) || !payload.contributions.length) throw new Error("Contribution data unavailable")
  const today = new Date(now).toISOString().slice(0, 10)
  const days = payload.contributions.map(({ date, count, level }) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(`${date}T00:00:00Z`))
      || new Date(`${date}T00:00:00Z`).toISOString().slice(0,10) !== date
      || !Number.isSafeInteger(count) || count < 0 || !Number.isInteger(level) || level < 0 || level > 4) {
      throw new Error("Invalid contribution data")
    }
    return { date, count, level }
  }).filter(day => day.date <= today).sort((a,b) => a.date.localeCompare(b.date)).slice(-366)
  if (!days.length) throw new Error("Contribution data unavailable")
  for (let i = 1; i < days.length; i++) {
    if (Date.parse(days[i].date) - Date.parse(days[i-1].date) !== dayMs) throw new Error("Incomplete contribution data")
  }
  const leading = new Date(`${days[0].date}T00:00:00Z`).getUTCDay()
  const cells = [...Array(leading).fill(null), ...days]
  const weeks = Array.from({length:Math.ceil(cells.length / 7)}, (_,i) => Array.from({length:7}, (_,j) => cells[i*7+j] || null))
  return { days, weeks, total:days.reduce((sum,day) => sum + day.count,0), activeDays:days.filter(day => day.count > 0).length }
}

/** Public feed is cached upstream for one hour. Share requests across route visits. */
export function loadContributions(username, { fetcher = fetch, now = new Date() } = {}) {
  if (!/^[a-z\d-]{1,39}$/i.test(username)) return Promise.reject(new Error("Invalid GitHub username"))
  const timestamp = new Date(now).getTime()
  const cached = requests.get(username)
  if (cached && cached.expiresAt > timestamp) return cached.promise
  const entry = {expiresAt:timestamp + cacheMs}
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 12000)
  entry.promise = (async () => {
    const response = await fetcher(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`, {
      signal:controller.signal, credentials:"omit", referrerPolicy:"no-referrer",
    })
    if (!response.ok) throw new Error(`GitHub activity unavailable (${response.status})`)
    return normalizeContributions(await response.json(), now)
  })().catch(error => {
    if (requests.get(username) === entry) requests.delete(username)
    throw error
  }).finally(() => clearTimeout(timer))
  requests.set(username, entry)
  return entry.promise
}
