import assert from "node:assert/strict"
import { test } from "node:test"
import { fuzzyMatch, rankFuzzyItems } from "../src/lib/fuzzyMatch.js"

test("fuzzyMatch matches subsequences, prefers consecutive and boundary hits, and rejects misses", () => {
  const exact = fuzzyMatch("kanagawa", "Kanagawa Wave")
  const sparse = fuzzyMatch("kanagawa", "k-a-n-a-g-a-w-a-x-y-z")
  assert.equal(exact.matched, true)
  assert.equal(sparse.matched, true)
  assert.ok(exact.score > sparse.score)
  assert.deepEqual(exact.indices, [0, 1, 2, 3, 4, 5, 6, 7])
  assert.equal(fuzzyMatch("zzz", "Kanagawa Wave").matched, false)
})

test("rankFuzzyItems orders primary label matches above keyword-only matches", () => {
  const items = [
    { id: "a", label: "Appearance", keywords: "projects theme" },
    { id: "b", label: "Projects", keywords: "ls" },
  ]
  const ranked = rankFuzzyItems(items, "proj", (item) => item.label)
  assert.deepEqual(ranked.map((r) => r.item.id), ["b", "a"])
})
