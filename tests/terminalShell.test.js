import assert from "node:assert/strict"
import { test } from "node:test"
import { executeShellCommand, getShellSuggestion, normalizeVfsPath } from "../src/lib/terminalShell.js"

test("shell navigation, tmux split, and theme commands return structured side-effect intents", () => {
  const nav = executeShellCommand("cd projects")
  assert.equal(nav.navigate, "/#projects")
  assert.equal(nav.setCwd, "~/projects")

  const themed = executeShellCommand("theme noir")
  assert.equal(themed.setTheme, "noir")

  const splitV = executeShellCommand("split v")
  assert.equal(splitV.setSplit, "vertical")

  const audioOn = executeShellCommand("audio on")
  assert.equal(audioOn.setAudio, true)

  const copied = executeShellCommand("wl-copy email")
  assert.match(copied.copyText, /@/)

  const cleared = executeShellCommand("clear")
  assert.equal(cleared.clear, true)

  const direct = executeShellCommand("about")
  assert.equal(direct.navigate, "/#about")
  assert.equal(direct.setCwd, "~/about")

  const nextFromHome = executeShellCommand("next", { currentPath: "~" })
  assert.equal(nextFromHome.navigate, "/#about")
  assert.equal(nextFromHome.setCwd, "~/about")

  const nextFromAbout = executeShellCommand("next", { currentPath: "~/about" })
  assert.equal(nextFromAbout.navigate, "/#projects")

  const prevFromAbout = executeShellCommand("prev", { currentPath: "~/about" })
  assert.equal(prevFromAbout.navigate, "/")
  assert.equal(prevFromAbout.setCwd, "~")

  const byIndex = executeShellCommand("4")
  assert.equal(byIndex.navigate, "/#contact")
  assert.equal(byIndex.setCwd, "~/contact")

  assert.equal(executeShellCommand("surface hybrid").setSurface, "hybrid")
  assert.equal(executeShellCommand("bg hybrid").setSurface, "hybrid")
  assert.equal(executeShellCommand("bg flat").setSurface, "flat")
})

test("virtual filesystem resolves relative paths, reads files, renders man page, and refuses sudo", () => {
  assert.equal(normalizeVfsPath("~/projects", ".."), "~")
  assert.equal(normalizeVfsPath("~/projects", "../about/stack.toml"), "~/about/stack.toml")

  const cat = executeShellCommand("cat .config/theme.conf", { theme: "noir", accent: "jade" })
  assert.ok(cat.lines.some((line) => line.text.includes('theme = "noir"')))

  const man = executeShellCommand("man aaser")
  assert.ok(man.lines.some((line) => line.text.includes("SYNOPSIS")))

  const sudo = executeShellCommand("sudo rm -rf /")
  assert.equal(sudo.isError, true)
  assert.equal(sudo.lines[0].tone, "error")
  assert.match(sudo.lines[0].text, /sudoers/i)
})

test("shell pipelines chain cat | grep | wc cleanly", () => {
  const piped = executeShellCommand("cat README.md | grep -i backend | wc -l")
  assert.equal(Number(piped.lines[0].text) >= 1, true)

  const headed = executeShellCommand("ls -la | head -n 3")
  assert.equal(headed.lines.length, 3)
})

test("zsh-style autosuggestion completes commands, themes, accents, and VFS paths", () => {
  assert.equal(getShellSuggestion("them"), "e")
  assert.equal(getShellSuggestion("theme kan"), "agawa")
  assert.equal(getShellSuggestion("accent cr", { accents: [{ id: "carp" }, { id: "crystal" }] }), "ystal")
  assert.equal(getShellSuggestion("cat READ"), "ME.md")
  assert.equal(getShellSuggestion("split v"), "ertical")
  assert.equal(getShellSuggestion("bg h"), "ybrid")
  assert.equal(getShellSuggestion("surface f"), "lat")
})
