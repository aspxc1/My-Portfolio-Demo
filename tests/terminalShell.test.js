import assert from "node:assert/strict"
import { test } from "node:test"
import { executeShellCommand, getShellSuggestion } from "../src/lib/terminalShell.js"

test("shell navigation and theme commands return structured side-effect intents", () => {
  assert.equal(executeShellCommand("cd ~/projects").navigate, "/#projects")
  assert.equal(executeShellCommand("cd experience").navigate, "/#activities")
  assert.equal(executeShellCommand("cd ..").navigate, "/")
  assert.equal(executeShellCommand("theme kanagawa").setTheme, "kanagawa")
  assert.equal(executeShellCommand("bg crt").setBackground, "crt")
  assert.equal(executeShellCommand("copy email").copyText, "aaserzanaty@gmail.com")
  assert.equal(executeShellCommand("clear").clear, true)
})

test("shell reads virtual files, renders man page, and refuses sudo cleanly", () => {
  const bio = executeShellCommand("cat bio.txt")
  assert.ok(bio.lines.some((line) => line.text.includes("Ain Shams University")))
  const man = executeShellCommand("man aaser")
  assert.ok(man.lines.some((line) => line.text.includes("AASER(1)")))
  const denied = executeShellCommand("sudo rm -rf /")
  assert.equal(denied.lines[0].tone, "error")
  assert.match(denied.lines[0].text, /sudoers/)
  const missing = executeShellCommand("nonexistent-cmd")
  assert.equal(missing.lines[0].tone, "error")
})

test("zsh-style autosuggestion completes commands, themes, and active accents", () => {
  assert.equal(getShellSuggestion("man "), "aaser")
  assert.equal(getShellSuggestion("theme kan"), "agawa")
  assert.equal(getShellSuggestion("accent ca", [{ id: "carp", label: "carp" }]), "rp")
  assert.equal(getShellSuggestion(""), "")
})
