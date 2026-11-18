import assert from "node:assert/strict"
import { test } from "node:test"
import { getContributionOverview, getGitHubUsername, normalizeContributions, loadContributions } from "../src/lib/githubActivity.js"

const today = new Date("2026-11-16T12:00:00Z")
const days = [
  { date: "2026-11-14", count: 2, level: 1 },
  { date: "2026-11-15", count: 0, level: 0 },
  { date: "2026-11-16", count: 7, level: 4 },
]

test("GitHub identity comes from the profile URL, independently of the terminal handle", () => {
  assert.equal(getGitHubUsername("https://github.com/aspxc1"), "aspxc1")
  for (const url of ["https://example.com/aspxc1", "https://github.com/a/repo", "not a URL"]) {
    assert.equal(getGitHubUsername(url), null)
  }
})

test("calendar sorts dates, excludes future days, aligns Sunday weeks, and computes real totals", () => {
  const calendar = normalizeContributions({ contributions: [days[2], days[0], {date:"2026-11-17",count:99,level:4}, days[1]] }, today)
  assert.deepEqual(calendar.days, days)
  assert.equal(calendar.weeks[0][6].date, "2026-11-14")
  assert.equal(calendar.weeks[0][0], null)
  assert.equal(calendar.weeks[1][0].date, "2026-11-15")
  assert.equal(calendar.total, 9)
  assert.equal(calendar.activeDays, 2)
})

test("malformed, duplicate or missing dates never become fabricated zero-contribution days", () => {
  for (const contributions of [[], [{date:"2026-02-30",count:1,level:1}], [{...days[0],count:-1}], [{...days[0],level:5}], [days[0], days[0]], [days[0],days[2]]]) {
    assert.throws(() => normalizeContributions({contributions}, today))
  }
  assert.throws(() => normalizeContributions({error:"Unavailable"}, today))
})

test("requests are shared and cached across visits, while failures can be retried", async () => {
  let calls = 0
  const fetcher = async () => { calls++; return {ok:true,json:async()=>({contributions:days})} }
  const [a,b] = await Promise.all([loadContributions("cache-test", {fetcher,now:today}),loadContributions("cache-test", {fetcher,now:today})])
  assert.equal(a,b)
  assert.equal(a.updatedAt, today.toISOString())
  await loadContributions("cache-test", {fetcher,now:today})
  assert.equal(calls,1)
  await assert.rejects(loadContributions("retry-test", {fetcher:async()=>({ok:false,status:429}),now:today}))
  assert.equal((await loadContributions("retry-test", {fetcher,now:today})).total,9)
})

test("htop streak tolerates a quiet current day, but missing days do not become zero totals", () => {
  const history = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(+today - (29 - i) * 86400000).toISOString().slice(0, 10),
    count: i === 29 ? 0 : i >= 27 ? 2 : 0,
  }))
  assert.deepEqual(getContributionOverview(history, today), { streak: 2, load: [0, 4, 4] })
  assert.deepEqual(getContributionOverview(history.slice(0, -1), today), { streak: 2, load: [null, null, null] })
  assert.deepEqual(getContributionOverview(history.slice(0, -2), today), { streak: null, load: [null, null, null] })
  assert.deepEqual(getContributionOverview(days, today), { streak: 1, load: [7, null, null] })
})
