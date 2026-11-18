import assert from "node:assert/strict"
import { test } from "node:test"
import { loadRepositories, normalizeRepositories } from "../src/lib/githubRepositories.js"

const now = new Date("2026-11-16T12:00:00Z")
const entry = { id: 100, name: "queue-lab", language: "Python", pushed_at: "2026-11-15T10:00:00Z", size: 20 }
const older = { ...entry, id: 101, name: "empty-lab", language: null, pushed_at: null, size: 0 }

test("repo data is sorted by push date and has a real size total", () => {
  assert.deepEqual(normalizeRepositories([older, entry], "aspxc1"), {
    repos: [
      { id: 100, name: "queue-lab", language: "Python", pushedAt: entry.pushed_at, size: 20, url: "https://github.com/aspxc1/queue-lab" },
      { id: 101, name: "empty-lab", language: null, pushedAt: null, size: 0, url: "https://github.com/aspxc1/empty-lab" },
    ],
    totalSize: 20,
  })
  assert.deepEqual(normalizeRepositories([], "aspxc1"), { repos: [], totalSize: 0 })
  assert.throws(() => normalizeRepositories([{ ...entry, size: -1 }], "aspxc1"))
})

test("repos use one token-free request per hour and flag a paginated result", async () => {
  let calls = 0
  const fetcher = async (url, opts) => {
    calls++
    assert.equal(url, "https://api.github.com/users/repos-cache/repos?sort=pushed&direction=desc&per_page=100")
    assert.equal(opts.credentials, "omit")
    assert.equal(opts.headers, undefined)
    return { ok: true, json: async () => [entry], headers: new Headers({ link: '<https://api.github.com/?page=2>; rel="next"' }) }
  }
  const a = loadRepositories("repos-cache", { fetcher, now })
  assert.equal(loadRepositories("repos-cache", { fetcher, now }), a)
  const result = await a
  assert.equal(result.hasMore, true)
  assert.equal(result.updatedAt, now.toISOString())
  assert.equal(calls, 1)
  await loadRepositories("repos-cache", { fetcher, now: +now + 3600000 })
  assert.equal(calls, 2)
})

test("GitHub rate limits are identified and failed loads can be retried", async () => {
  await assert.rejects(loadRepositories("repos-retry", {
    now, fetcher: async () => ({ ok: false, status: 403, headers: new Headers({ "x-ratelimit-remaining": "0" }) }),
  }), { status: 429 })
  const result = await loadRepositories("repos-retry", { now, fetcher: async () => ({ ok: true, json: async () => [] }) })
  assert.deepEqual(result.repos, [])
})
