import assert from "node:assert/strict"
import { test } from "node:test"
import { hero, profile, stack } from "../src/content/site.js"
import { isCliUserAgent, renderAnsiPortfolio } from "../src/lib/ansiCard.js"
import { toBrailleSparkline } from "../src/lib/brailleSparkline.js"

test("detects CLI user agents cleanly without matching browsers", () => {
  assert.equal(isCliUserAgent("curl/8.7.1"), true)
  assert.equal(isCliUserAgent("Wget/1.21.4"), true)
  assert.equal(isCliUserAgent("HTTPie/3.2.2"), true)
  assert.equal(isCliUserAgent("Mozilla/5.0 (X11; Linux x86_64) Chrome/130.0"), false)
})

test("renders truecolor ANSI and plaintext cards for home, projects, and contact", () => {
  const homeAnsi = renderAnsiPortfolio({ profile, hero, stack, projects: [], activities: [], origin: "https://aasermo.dev", route: "/", ansi: true })
  assert.match(homeAnsi, /\x1b\[/)
  assert.ok(homeAnsi.includes(profile.name))
  assert.ok(homeAnsi.includes(profile.email))

  const homePlain = renderAnsiPortfolio({ profile, hero, stack, projects: [], activities: [], origin: "https://aasermo.dev", route: "/", ansi: false })
  assert.doesNotMatch(homePlain, /\x1b\[/)
  assert.ok(homePlain.includes("STACK"))

  const projEmpty = renderAnsiPortfolio({ profile, hero, stack, projects: [], activities: [], origin: "https://aasermo.dev", route: "/projects", ansi: false })
  assert.ok(projEmpty.includes("No projects listed yet."))
})

test("braille sparkline packs pairs of data points into Unicode braille glyphs", () => {
  const spark = toBrailleSparkline([0, 1, 2, 4, 8, 12], { min: 0 })
  assert.equal(spark.length, 3)
  for (const ch of spark) {
    const code = ch.charCodeAt(0)
    assert.ok(code >= 0x2800 && code <= 0x28ff)
  }
})
