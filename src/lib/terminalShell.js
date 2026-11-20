import { contact, hero, profile, sections, stack } from "../content/site.js"
import { BACKGROUNDS, THEMES } from "./terminalTheme.js"

const destinationMap = {
  "~": "/",
  home: "/",
  "/": "/",
  about: "/#about",
  "~/about": "/#about",
  projects: "/#projects",
  "~/projects": "/#projects",
  experience: "/#activities",
  activities: "/#activities",
  clubs: "/#activities",
  "~/experience": "/#activities",
  contact: "/#contact",
  "~/contact": "/#contact",
}

const virtualFiles = {
  "readme.md": [
    `# ${profile.name} (${profile.handle}@portfolio)`,
    `${profile.role} at ${profile.school} (${profile.location}).`,
    "",
    "Navigate via ./menu.sh, click the tmux window tabs below,",
    "press Ctrl+K for the fzf palette, or explore right from this prompt.",
  ],
  "bio.txt": [
    ...hero.neofetch.map((row) => `${row.key.padEnd(10, " ")} ${row.value}`),
    "",
    contact.blurb,
  ],
  "stack.txt": stack
    .filter(({ hidden }) => !hidden)
    .map(({ group, items }) => `${group.padEnd(12, " ")} ${items.join(", ")}`),
  "contact.vcf": [
    `FN:${profile.name}`,
    `EMAIL:${profile.email}`,
    ...profile.links.map((link) => `URL;TYPE=${link.label.toUpperCase()}:${link.href}`),
  ],
}

export const SHELL_COMMANDS = [
  "help",
  "ls",
  "tree",
  "cd",
  "cat",
  "man",
  "whoami",
  "neofetch",
  "theme",
  "accent",
  "bg",
  "open",
  "copy",
  "pwd",
  "date",
  "uptime",
  "uname",
  "echo",
  "history",
  "clear",
]

const suggestionCatalog = [
  "help",
  "man aaser",
  "ls -la",
  "tree",
  "cat README.md",
  "cat bio.txt",
  "cat stack.txt",
  "cat contact.vcf",
  "cd ~/about",
  "cd ~/projects",
  "cd ~/experience",
  "cd ~/contact",
  "cd ~",
  "whoami",
  "neofetch",
  "copy email",
  "open github",
  "open linkedin",
  "open codeforces",
  "open resume",
  "date",
  "uptime",
  "uname -a",
  "history",
  "clear",
  ...THEMES.map((t) => `theme ${t.id}`),
  ...BACKGROUNDS.map((b) => `bg ${b.id}`),
]

export function getShellSuggestion(input, extraAccents = []) {
  const raw = input.trimStart()
  if (!raw) return ""
  const lower = raw.toLowerCase()
  const pool = [...suggestionCatalog, ...extraAccents.map((a) => `accent ${a.id}`)]
  const match = pool.find((candidate) => candidate.toLowerCase().startsWith(lower) && candidate.length > raw.length)
  return match ? match.slice(raw.length) : ""
}

export function formatCairoClock(now = new Date()) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Cairo",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now)
  } catch {
    return now.toISOString().slice(11, 16)
  }
}

export function formatCairoDateTime(now = new Date()) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Africa/Cairo",
      weekday: "short",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZoneName: "short",
    }).format(now)
  } catch {
    return now.toUTCString()
  }
}

/**
 * Pure shell command executor. Returns output lines and optional side-effect intents
 * (navigate, setTheme, setAccent, setBackground, openUrl, copyText, clear).
 */
export function executeShellCommand(rawInput, context = {}) {
  const trimmed = rawInput.trim()
  if (!trimmed) return { lines: [] }

  const [cmdRaw, ...args] = trimmed.split(/\s+/)
  const cmd = cmdRaw.toLowerCase()
  const arg = args.join(" ")
  const argLower = arg.toLowerCase()
  const currentPath = context.currentPath || "~"
  const projects = context.projects || []

  if (cmd === "clear" || cmd === "cls") {
    return { clear: true, lines: [] }
  }

  if (cmd === "help" || cmd === "?") {
    return {
      lines: [
        { tone: "accent", text: "Available commands:" },
        { text: "  cd <dir>        jump to ~, about, projects, experience, contact" },
        { text: "  ls / tree       list portfolio directories & virtual files" },
        { text: "  cat <file>      read README.md, bio.txt, stack.txt, contact.vcf" },
        { text: "  man aaser       open manual page summary" },
        { text: "  theme <id>      switch theme (" + THEMES.map((t) => t.id).join(", ") + ")" },
        { text: "  accent <id>     switch active theme accent color" },
        { text: "  bg <mode>       switch backdrop (" + BACKGROUNDS.map((b) => b.id).join(", ") + ", auto)" },
        { text: "  open <link>     open github, linkedin, codeforces, resume, email" },
        { text: "  copy email      copy email address to clipboard" },
        { text: "  date | uptime   show Cairo local time or session uptime" },
        { text: "  clear | Ctrl+K  clear transcript or open fzf command palette" },
      ],
    }
  }

  if (cmd === "pwd") {
    return { lines: [{ tone: "teal", text: currentPath.replace("~", `/home/${profile.handle}`) }] }
  }

  if (cmd === "whoami") {
    return {
      lines: [
        { tone: "accent", text: `${profile.handle} — ${profile.name}` },
        { text: `${profile.role} @ ${profile.school} · ${profile.location}` },
      ],
    }
  }

  if (cmd === "uname") {
    return {
      lines: [
        { text: `PortfolioOS 6.12.0-${profile.handle} x86_64 AinShams/Cairo GNU/Linux (React 19 + Vite)` },
      ],
    }
  }

  if (cmd === "date") {
    return { lines: [{ tone: "teal", text: `${formatCairoDateTime(context.now)} (Africa/Cairo)` }] }
  }

  if (cmd === "uptime") {
    const seconds = Math.max(0, Math.floor(((context.now?.getTime?.() ?? Date.now()) - (context.startedAt ?? Date.now())) / 1000))
    const mins = Math.floor(seconds / 60)
    const rem = seconds % 60
    return {
      lines: [
        { text: `session up ${mins}m ${String(rem).padStart(2, "0")}s · degree uptime: 2nd year, graduating May 2029` },
      ],
    }
  }

  if (cmd === "neofetch") {
    return {
      navigate: "/",
      lines: [{ tone: "teal", text: "→ returning to ~/ (neofetch)" }],
    }
  }

  if (cmd === "man") {
    if (!argLower || argLower === profile.handle || argLower === "aaser" || argLower === "portfolio") {
      return {
        lines: [
          { tone: "accent", text: `AASER(1)                   Portfolio Manual                   AASER(1)` },
          { text: "" },
          { tone: "teal", text: "NAME" },
          { text: `    ${profile.handle} - ${profile.name}, ${profile.role}` },
          { tone: "teal", text: "SYNOPSIS" },
          { text: `    ${profile.handle} [--backend] [--applied-ai] [--internships]` },
          { tone: "teal", text: "DESCRIPTION" },
          { text: `    Studying Computer & AI Engineering at ${profile.school} (${profile.location}).` },
          { text: `    ${contact.blurb}` },
          { tone: "teal", text: "SEE ALSO" },
          { text: `    about(1), projects(1), experience(1), contact(1)` },
        ],
      }
    }
    return { lines: [{ tone: "error", text: `No manual entry for ${arg}` }] }
  }

  if (cmd === "ls" || cmd === "ll") {
    const detailed = cmd === "ll" || args.some((a) => a.includes("l"))
    const entries = [
      { perm: "drwxr-xr-x", name: "about/", note: sections.about.nav },
      { perm: "drwxr-xr-x", name: "projects/", note: `${projects.length} entries` },
      { perm: "drwxr-xr-x", name: "experience/", note: sections.activities.nav },
      { perm: "drwxr-xr-x", name: "contact/", note: sections.contact.nav },
      { perm: "-rw-r--r--", name: "README.md", note: "portfolio guide" },
      { perm: "-rw-r--r--", name: "bio.txt", note: "profile summary" },
      { perm: "-rw-r--r--", name: "stack.txt", note: "tech stack" },
      { perm: "-rw-r--r--", name: "contact.vcf", note: "endpoints" },
    ]
    if (detailed) {
      return {
        lines: [
          { tone: "muted", text: `total ${entries.length}` },
          ...entries.map((entry) => ({
            tone: entry.name.endsWith("/") ? "teal" : undefined,
            text: `${entry.perm}  ${profile.handle}  ${entry.name.padEnd(14, " ")}  # ${entry.note}`,
          })),
        ],
      }
    }
    return {
      lines: [
        { tone: "teal", text: "about/  projects/  experience/  contact/" },
        { text: "README.md  bio.txt  stack.txt  contact.vcf" },
      ],
    }
  }

  if (cmd === "tree") {
    return {
      lines: [
        { tone: "accent", text: "~" },
        { text: "├── about/        (whoami, tree ~/stack, htop)" },
        { text: "├── projects/     (curated projects)" },
        { text: "├── experience/   (git log timeline)" },
        { text: "├── contact/      (ping endpoints)" },
        { text: "├── README.md" },
        { text: "├── bio.txt" },
        { text: "├── stack.txt" },
        { text: "└── contact.vcf" },
      ],
    }
  }

  if (cmd === "cd") {
    const target = !argLower || argLower === "~" || argLower === ".." ? "~" : argLower.replace(/\/+$/, "")
    if (Object.hasOwn(destinationMap, target)) {
      const route = destinationMap[target]
      return {
        navigate: route,
        lines: [{ tone: "teal", text: `→ cd ${target === "~" ? "~" : `~/${target.replace(/^~\//, "")}`}` }],
      }
    }
    const matchingProject = projects.find((p) => p.slug === target || `projects/${p.slug}` === target)
    if (matchingProject) {
      return {
        navigate: `/projects/${matchingProject.slug}`,
        lines: [{ tone: "teal", text: `→ opening ~/projects/${matchingProject.slug}` }],
      }
    }
    return { lines: [{ tone: "error", text: `cd: no such directory: ${arg}` }] }
  }

  if (cmd === "cat") {
    if (!argLower) {
      return { lines: [{ tone: "muted", text: "usage: cat <README.md | bio.txt | stack.txt | contact.vcf>" }] }
    }
    const cleanName = argLower.replace(/^~\/|^\.\//, "")
    if (Object.hasOwn(virtualFiles, cleanName)) {
      return { lines: virtualFiles[cleanName].map((text) => ({ text })) }
    }
    const project = projects.find((p) => p.slug === cleanName)
    if (project) {
      return {
        lines: [
          { tone: "accent", text: `${project.name} (${project.year}) [${project.status}]` },
          { text: project.tagline },
          { tone: "muted", text: `stack: ${project.stack.join(", ")}` },
        ],
      }
    }
    return { lines: [{ tone: "error", text: `cat: ${arg}: No such file` }] }
  }

  if (cmd === "theme") {
    if (!argLower) {
      return {
        lines: [
          { tone: "accent", text: `Current theme: ${context.theme || "mocha"}` },
          { text: `Available: ${THEMES.map((t) => t.id).join(" · ")}` },
        ],
      }
    }
    const found = THEMES.find((t) => t.id === argLower || t.label.toLowerCase().includes(argLower))
    if (!found) {
      return { lines: [{ tone: "error", text: `Unknown theme "${arg}". Try: ${THEMES.map((t) => t.id).join(", ")}` }] }
    }
    return {
      setTheme: found.id,
      lines: [{ tone: "success", text: `✓ theme switched to ${found.label} (${found.id})` }],
    }
  }

  if (cmd === "accent") {
    const accents = context.accents || []
    if (!argLower) {
      return {
        lines: [
          { tone: "accent", text: `Current accent: ${context.accent || accents[0]?.id || "default"}` },
          { text: `Available for this theme: ${accents.map((a) => a.id).join(" · ")}` },
        ],
      }
    }
    const found = accents.find((a) => a.id === argLower || a.label.toLowerCase() === argLower)
    if (!found) {
      return { lines: [{ tone: "error", text: `Unknown accent "${arg}". Try: ${accents.map((a) => a.id).join(", ")}` }] }
    }
    return {
      setAccent: found.id,
      lines: [{ tone: "success", text: `✓ accent set to ${found.label}` }],
    }
  }

  if (cmd === "bg" || cmd === "background") {
    if (!argLower) {
      return {
        lines: [
          { tone: "accent", text: `Current background: ${context.background || "auto"}` },
          { text: `Available: auto · ${BACKGROUNDS.map((b) => b.id).join(" · ")}` },
        ],
      }
    }
    if (argLower === "auto" || BACKGROUNDS.some((b) => b.id === argLower)) {
      return {
        setBackground: argLower,
        lines: [{ tone: "success", text: `✓ background set to ${argLower}` }],
      }
    }
    return { lines: [{ tone: "error", text: `Unknown background "${arg}". Try: auto, ${BACKGROUNDS.map((b) => b.id).join(", ")}` }] }
  }

  if (cmd === "open") {
    if (!argLower) {
      return { lines: [{ tone: "muted", text: "usage: open <github | linkedin | codeforces | resume | email | section>" }] }
    }
    if (argLower === "email" || argLower === "mail") {
      return { openUrl: `mailto:${profile.email}`, external: false, lines: [{ tone: "teal", text: `→ opening mailto:${profile.email}` }] }
    }
    const link = profile.links.find((item) => item.icon === argLower || item.label.toLowerCase() === argLower)
    if (link) {
      return { openUrl: link.href, external: true, lines: [{ tone: "teal", text: `→ opening ${link.label} (${link.href})` }] }
    }
    if (Object.hasOwn(destinationMap, argLower)) {
      return { navigate: destinationMap[argLower], lines: [{ tone: "teal", text: `→ opening ${argLower}` }] }
    }
    return { lines: [{ tone: "error", text: `open: unknown target "${arg}"` }] }
  }

  if (cmd === "copy" || cmd === "pbcopy") {
    if (!argLower || argLower === "email" || argLower === "mail") {
      return {
        copyText: profile.email,
        lines: [{ tone: "success", text: `✓ copied ${profile.email} to clipboard` }],
      }
    }
    return { lines: [{ tone: "error", text: `copy: try "copy email"` }] }
  }

  if (cmd === "echo") {
    return { lines: [{ text: arg }] }
  }

  if (cmd === "history") {
    const entries = context.history || []
    if (!entries.length) return { lines: [{ tone: "muted", text: "(history empty)" }] }
    return {
      lines: entries.slice(-12).map((entry, idx) => ({
        text: `${String(idx + 1).padStart(3, " ")}  ${entry}`,
      })),
    }
  }

  if (cmd === "sudo") {
    return {
      lines: [{ tone: "error", text: `${profile.handle} is not in the sudoers file. This incident will be reported.` }],
    }
  }

  if (cmd === "exit" || cmd === "logout") {
    return {
      lines: [{ tone: "muted", text: "logout: cannot exit portfolio session — try `cd ~` or `open github` instead." }],
    }
  }

  return {
    lines: [{ tone: "error", text: `zsh: command not found: ${cmdRaw} — type "help" for available commands` }],
  }
}
