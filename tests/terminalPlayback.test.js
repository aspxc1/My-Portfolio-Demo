import assert from "node:assert/strict"
import { test } from "node:test"
import { getRunTiming } from "../src/lib/terminalPlayback.js"

test("first-play commands keep their original timing, including the long-command cap", () => {
  assert.deepEqual(getRunTiming("neofetch"), { start: 100, type: 336, submit: 120 })
  assert.deepEqual(getRunTiming("./menu.sh"), { start: 100, type: 378, submit: 120 })
  assert.equal(getRunTiming("x".repeat(100)).type, 700)
})

test("repeat navigation still types each command but finishes substantially sooner", () => {
  for (const command of ["neofetch", "whoami", "ls ~/projects", "git log --oneline", "./menu.sh"]) {
    const first = getRunTiming(command)
    const repeat = getRunTiming(command, true)
    assert.ok(repeat.type > 0)
    assert.ok(repeat.start + repeat.type + repeat.submit < 0.5 * (first.start + first.type + first.submit))
  }
})
