import assert from "node:assert/strict"
import { test } from "node:test"
import { ACCENTS, BACKGROUNDS, getSessionTask } from "../src/lib/terminalTheme.js"

test("session task resolves active tmux window metadata for home, sections, and project pages", () => {
  assert.deepEqual(getSessionTask({ pathname: "/", hash: "" }), { index: 0, name: "neofetch", path: "~" })
  assert.deepEqual(getSessionTask({ pathname: "/", hash: "#about" }), { index: 1, name: "whoami", path: "~/about" })
  assert.deepEqual(getSessionTask({ pathname: "/", hash: "#projects" }), { index: 2, name: "ls", path: "~/projects" })
  assert.deepEqual(getSessionTask({ pathname: "/", hash: "#activities" }), { index: 3, name: "git-log", path: "~/experience" })
  assert.deepEqual(getSessionTask({ pathname: "/", hash: "#experience" }), { index: 3, name: "git-log", path: "~/experience" })
  assert.deepEqual(getSessionTask({ pathname: "/", hash: "#contact" }), { index: 4, name: "ping", path: "~/contact" })
  assert.deepEqual(getSessionTask({ pathname: "/projects/lecture-rag", hash: "" }), { index: 2, name: "cat", path: "~/projects/lecture-rag" })
})

test("unknown or inherited object keys fall back to the home session task", () => {
  for (const hash of ["#unknown", "#constructor", "#__proto__", "#toString"]) {
    assert.deepEqual(getSessionTask({ pathname: "/", hash }), { index: 0, name: "neofetch", path: "~" })
  }
})

test("accents and background presets expose unique identifiers", () => {
  assert.equal(new Set(ACCENTS.map((item) => item.id)).size, ACCENTS.length)
  assert.equal(new Set(BACKGROUNDS.map((item) => item.id)).size, BACKGROUNDS.length)
  for (const accent of ACCENTS) {
    assert.match(accent.hex, /^#[0-9a-f]{6}$/i)
  }
})
