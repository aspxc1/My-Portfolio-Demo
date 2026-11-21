import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import { runInNewContext } from "node:vm"
import { APPEARANCE_KEY, SURFACES, THEMES, getSessionTask, normalizeAppearance, readAppearance } from "../src/lib/terminalTheme.js"

test("session task resolves active tmux window metadata for home, sections, and project pages", () => {
  assert.deepEqual(getSessionTask({ pathname: "/", hash: "" }), { index: 0, name: "fastfetch", path: "~" })
  assert.deepEqual(getSessionTask({ pathname: "/", hash: "#about" }), { index: 1, name: "whoami", path: "~/about" })
  assert.deepEqual(getSessionTask({ pathname: "/", hash: "#projects" }), { index: 2, name: "yazi", path: "~/projects" })
  assert.deepEqual(getSessionTask({ pathname: "/", hash: "#activities" }), { index: 3, name: "git-log", path: "~/experience" })
  assert.deepEqual(getSessionTask({ pathname: "/", hash: "#experience" }), { index: 3, name: "git-log", path: "~/experience" })
  assert.deepEqual(getSessionTask({ pathname: "/", hash: "#contact" }), { index: 4, name: "mtr", path: "~/contact" })
  assert.deepEqual(getSessionTask({ pathname: "/projects/lecture-rag", hash: "" }), { index: 2, name: "man", path: "~/projects/lecture-rag" })
})

test("unknown or inherited object keys fall back to the home session task", () => {
  for (const hash of ["#unknown", "#constructor", "#__proto__", "#toString"]) {
    assert.deepEqual(getSessionTask({ pathname: "/", hash }), { index: 0, name: "fastfetch", path: "~" })
  }
})

test("themes, their accents, and surface modes expose unique valid identifiers", () => {
  assert.equal(new Set(THEMES.map((item) => item.id)).size, THEMES.length)
  assert.equal(new Set(SURFACES.map((item) => item.id)).size, SURFACES.length)
  const css = readFileSync(new URL("../src/styles/terminalThemes.css", import.meta.url), "utf8")
  for (const theme of THEMES) {
    assert.equal(new Set(theme.accents.map((item) => item.id)).size, theme.accents.length)
    for (const accent of theme.accents) {
      assert.match(css, new RegExp(`--accent-${accent.id}: #[0-9a-f]{6};`, "i"))
    }
  }
})

test("appearance validates stored choices, defaults to Kanagawa Wave, and migrates legacy backgrounds", () => {
  const defaults = { theme: "kanagawa", accent: "carp", surface: "auto", audio: false }
  assert.deepEqual(readAppearance(), defaults)
  assert.deepEqual(normalizeAppearance({ theme: "unknown", accent: "unknown", surface: "unknown" }), defaults)
  assert.deepEqual(normalizeAppearance({ theme: "dracula", accent: "carp", background: "crt", audio: true }), {
    theme: "dracula", accent: "cyan", surface: "crt", audio: true,
  })
  assert.deepEqual(normalizeAppearance({ theme: "paper", accent: "rust", surface: "flat" }), {
    theme: "paper", accent: "rust", surface: "flat", audio: false,
  })
})

test("saved color settings apply before the app loads and unavailable storage leaves defaults alone", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8")
  const initializer = html.match(/<script>([\s\S]*?)<\/script>/)[1]
  const dataset = {}
  const document = { documentElement: { dataset } }
  const localStorage = { getItem: (key) => key === APPEARANCE_KEY && '{"theme":"paper","accent":"rust","surface":"flat"}' }
  runInNewContext(initializer, { document, localStorage })
  assert.deepEqual(dataset, { theme: "paper", accent: "rust" })
  const blocked = { documentElement: { dataset: {} } }
  runInNewContext(initializer, { document: blocked })
  assert.deepEqual(blocked.documentElement.dataset, {})
})
