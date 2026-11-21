/**
 * Truecolor ANSI renderer for `curl <domain>` CLI visitors & plaintext crawlers.
 * Pure JS, zero Node/DOM dependencies so it runs in Cloudflare Workers and unit tests.
 */

const ESC = "\x1b["
const RESET = `${ESC}0m`
const BOLD = `${ESC}1m`
const DIM = `${ESC}2m`
const FG_CARP = `${ESC}38;2;230;195;132m`
const FG_WAVE = `${ESC}38;2;122;168;159m`
const FG_BLUE = `${ESC}38;2;126;156;216m`
const FG_FG = `${ESC}38;2;220;215;186m`
const FG_MUTED = `${ESC}38;2;154;150;133m`
const FG_GREEN = `${ESC}38;2;152;187;108m`
const FG_BORDER = `${ESC}38;2;84;84;109m`

const ART = [
  "          /\\          ",
  "         /  \\         ",
  "        / /\\ \\        ",
  "       / /  \\ \\       ",
  "      / /    \\ \\      ",
  "     / /______\\ \\     ",
  "    / /________\\ \\    ",
  "   /_/          \\_\\   ",
]

function paint(text, code, ansi) {
  return ansi ? `${code}${text}${RESET}` : text
}

function rule(width, ansi) {
  return paint("─".repeat(width), FG_BORDER, ansi)
}

export function isCliUserAgent(userAgent = "") {
  return /^(curl|wget|httpie|xh|fetch|lwp-request|lynx|w3m)\b/i.test(userAgent.trim())
}

export function renderAnsiPortfolio({ profile, hero, stack, projects, activities, origin = "", route = "/", ansi = true }) {
  const cleanRoute = route.replace(/\/+$/, "") || "/"
  const host = origin.replace(/^https?:\/\//, "") || `${profile.handle}.dev`

  if (cleanRoute === "/projects") {
    const lines = [
      "",
      `${paint("┌─", FG_BORDER, ansi)} ${paint("~/projects", BOLD + FG_CARP, ansi)} ${rule(48, ansi)}`,
      "",
    ]
    if (!projects.length) {
      lines.push(`  ${paint("total 0", FG_MUTED, ansi)}`)
      lines.push(`  ${paint("No projects listed yet.", FG_FG, ansi)}`)
    } else {
      for (const project of projects) {
        const badge = project.status === "shipped" ? "[+]" : project.status === "in-progress" ? "[~]" : "[-]"
        lines.push(
          `  ${paint(badge, FG_GREEN, ansi)} ${paint(project.name.padEnd(20), BOLD + FG_FG, ansi)} ${paint(project.year, FG_MUTED, ansi)}  ${paint(project.tagline, FG_MUTED, ansi)}`,
        )
        if (project.stack?.length) {
          lines.push(`      ${paint("stack:", FG_BLUE, ansi)} ${paint(project.stack.join(", "), FG_WAVE, ansi)}`)
        }
      }
    }
    lines.push("", `  ${paint(`curl -sL ${host}`, FG_MUTED, ansi)}  ${paint("|", FG_BORDER, ansi)}  ${paint(`curl -sL ${host}/contact`, FG_MUTED, ansi)}  ${paint("|", FG_BORDER, ansi)}  ${paint(`curl -sL ${host}/json`, FG_MUTED, ansi)}`, "")
    return lines.join("\n")
  }

  if (cleanRoute === "/contact") {
    const lines = [
      "",
      `${paint("┌─", FG_BORDER, ansi)} ${paint(`mtr -c 1 ${profile.handle}`, BOLD + FG_CARP, ansi)} ${rule(44, ansi)}`,
      "",
      `  ${paint("Email".padEnd(14), FG_BLUE, ansi)} ${paint(profile.email, FG_FG, ansi)}`,
      ...profile.links.map((l) => `  ${paint(l.label.padEnd(14), FG_BLUE, ansi)} ${paint(l.href, FG_WAVE, ansi)}`),
      "",
      `  ${paint(`Location: ${profile.location}`, FG_MUTED, ansi)}`,
      "",
    ]
    return lines.join("\n")
  }

  // Default: fastfetch home card
  const rightCol = [
    `${paint(profile.handle, BOLD + FG_CARP, ansi)}${paint("@", FG_MUTED, ansi)}${paint("portfolio", FG_WAVE, ansi)}`,
    paint("─".repeat(profile.handle.length + 10), FG_BORDER, ansi),
    `${paint("Name".padEnd(10), FG_BLUE, ansi)} ${paint(profile.name, BOLD + FG_FG, ansi)}`,
    ...hero.neofetch.map((row) => `${paint(row.key.padEnd(10), FG_BLUE, ansi)} ${paint(row.value, FG_FG, ansi)}`),
  ]

  const lines = [""]
  const rowCount = Math.max(ART.length, rightCol.length)
  for (let i = 0; i < rowCount; i++) {
    const left = paint((ART[i] || " ".repeat(22)), i < 3 ? FG_CARP : FG_WAVE, ansi)
    const right = rightCol[i] || ""
    lines.push(`  ${left}  ${right}`)
  }

  lines.push("")
  lines.push(`  ${paint("STACK", BOLD + FG_CARP, ansi)} ${rule(54, ansi)}`)
  for (const group of stack.filter((g) => !g.hidden)) {
    lines.push(`  ${paint(`${group.group}/`.padEnd(13), FG_WAVE, ansi)} ${paint(group.items.join(" · "), FG_FG, ansi)}`)
  }

  lines.push("")
  lines.push(`  ${paint("LINKS", BOLD + FG_CARP, ansi)} ${rule(54, ansi)}`)
  lines.push(`  ${paint("Email".padEnd(13), FG_BLUE, ansi)} ${paint(profile.email, FG_FG, ansi)}`)
  for (const link of profile.links) {
    lines.push(`  ${paint(link.label.padEnd(13), FG_BLUE, ansi)} ${paint(link.href, FG_FG, ansi)}`)
  }

  if (projects.length > 0) {
    lines.push("")
    lines.push(`  ${paint("PROJECTS", BOLD + FG_CARP, ansi)} ${rule(51, ansi)}`)
    for (const p of projects.slice(0, 5)) {
      lines.push(`  ${paint(p.name.padEnd(18), BOLD + FG_FG, ansi)} ${paint(p.tagline, FG_MUTED, ansi)}`)
    }
  }

  if (activities.length > 0) {
    lines.push("")
    lines.push(`  ${paint("EXPERIENCE", BOLD + FG_CARP, ansi)} ${rule(49, ansi)}`)
    for (const a of activities.slice(0, 4)) {
      lines.push(`  ${paint(`${a.role} @ ${a.org}`, FG_FG, ansi)} ${paint(`(${a.start} — ${a.end})`, FG_MUTED, ansi)}`)
    }
  }

  lines.push("")
  lines.push(
    `  ${paint("TIP:", DIM + FG_MUTED, ansi)} ${paint(`curl -sL ${host}/projects`, FG_WAVE, ansi)}  ${paint("·", FG_BORDER, ansi)}  ${paint(`curl -sL ${host}/contact`, FG_WAVE, ansi)}  ${paint("·", FG_BORDER, ansi)}  ${paint(`curl -sL ${host}/json`, FG_WAVE, ansi)}`,
  )
  lines.push("")
  return lines.join("\n")
}
