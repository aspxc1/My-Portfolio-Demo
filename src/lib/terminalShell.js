import { contact, hero, profile, sections, stack } from "../content/site.js"
import { SURFACES, THEMES } from "./terminalTheme.js"

const destinationMap = {
  "~": "/",
  home: "/",
  about: "/#about",
  "~/about": "/#about",
  projects: "/#projects",
  "~/projects": "/#projects",
  experience: "/#activities",
  "~/experience": "/#activities",
  activities: "/#activities",
  clubs: "/#activities",
  contact: "/#contact",
  "~/contact": "/#contact",
}

const routeToCwd = {
  "/": "~",
  "/#about": "~/about",
  "/#projects": "~/projects",
  "/#activities": "~/experience",
  "/#contact": "~/contact",
}

const BASE_COMMANDS = [
  "help",
  "ls",
  "tree",
  "cd",
  "pwd",
  "cat",
  "head",
  "tail",
  "grep",
  "wc",
  "find",
  "man",
  "whoami",
  "uname",
  "fastfetch",
  "neofetch",
  "git",
  "theme",
  "accent",
  "surface",
  "split",
  "zoom",
  "audio",
  "open",
  "copy",
  "wl-copy",
  "xclip",
  "pbcopy",
  "ping",
  "curl",
  "date",
  "uptime",
  "dmesg",
  "reboot",
  "echo",
  "history",
  "clear",
  "sudo",
  "exit",
]

function buildVirtualFs(context = {}) {
  const projects = context.projects || []
  const activities = context.activities || []
  const activeTheme = context.theme || THEMES[0].id
  const activeAccent = context.accent || THEMES[0].accents[0].id
  const activeSurface = context.surface || "auto"
  const activeAudio = Boolean(context.audio)

  const projectNodes = {}
  for (const p of projects) {
    const readme = [
      `# ${p.name} (${p.year}) [${p.status}]`,
      "",
      p.tagline,
      "",
      ...(p.problem ? ["## Problem", p.problem, ""] : []),
      ...(p.contribution ? ["## Contribution", p.contribution, ""] : []),
      ...(p.outcome ? ["## Outcome", p.outcome, ""] : []),
      ...(p.description?.length ? ["## Overview", ...p.description, ""] : []),
      ...(p.highlights?.length ? ["## Highlights", ...p.highlights.map((h) => `- ${h}`), ""] : []),
      ...(p.stack?.length ? [`Stack: ${p.stack.join(", ")}`] : []),
      ...(p.links?.length ? ["", ...p.links.map((l) => `${l.label}: ${l.href}`)] : []),
    ]
    projectNodes[p.slug] = {
      type: "dir",
      note: p.tagline,
      children: {
        "README.md": { type: "file", content: readme },
        "stack.txt": { type: "file", content: (p.stack || []).length ? p.stack : ["(none)"] },
      },
    }
  }

  const experienceLines = activities.length
    ? activities.flatMap((item) => [
      `* ${item.role} @ ${item.org} (${item.start} — ${item.end})`,
      `  ${item.summary}`,
      ...(item.highlights || []).map((h) => `  + ${h}`),
      "",
    ])
    : ["fatal: your current branch 'main' does not have any commits yet", "(no entries in src/content/activities.json)"]

  const stackToml = [
    "# ~/stack.toml",
    ...stack.filter((g) => !g.hidden).flatMap((g) => [
      `[${g.group.toLowerCase().replace(/\s+/g, "_")}]`,
      `items = [${g.items.map((item) => `"${item}"`).join(", ")}]`,
      "",
    ]),
  ]

  const readmeLines = [
    `# ${profile.name} (${profile.handle}@portfolio)`,
    `${profile.role} at ${profile.school} (${profile.location}).`,
    "",
    "Focus: Backend SWE, Applied AI/ML",
    "Status: Open to internships",
    "",
    "Quick commands:",
    "  ls -la             inspect virtual filesystem",
    "  cat stack.toml     view tech stack",
    "  man aaser          read full manual page",
    "  split v            toggle vertical tmux split",
    "  theme noir         switch terminal palette",
    "  cat README.md | grep -i backend",
  ]

  const bioLines = [
    `${profile.name} — ${profile.role} at ${profile.school}.`,
    "2nd year (graduating May 2029), based in Cairo, Egypt.",
    "Building backend systems, developer tools, and applied ML.",
  ]

  const contactVcf = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${profile.name}`,
    `EMAIL:${profile.email}`,
    ...profile.links.map((l) => `URL;TYPE=${l.label}:${l.href}`),
    `ADR:;;${profile.location};;;;`,
    "END:VCARD",
  ]

  return {
    type: "dir",
    children: {
      about: {
        type: "dir",
        note: "whoami, tree ~/stack, btop",
        children: {
          "whoami.txt": { type: "file", content: bioLines },
          "stack.toml": { type: "file", content: stackToml },
        },
      },
      projects: {
        type: "dir",
        note: projects.length ? `${projects.length} listed` : "empty",
        children: projectNodes,
      },
      experience: {
        type: "dir",
        note: activities.length ? `${activities.length} entries` : "empty",
        children: {
          "git.log": { type: "file", content: experienceLines },
        },
      },
      contact: {
        type: "dir",
        note: "mtr endpoints & mail",
        children: {
          "contact.vcf": { type: "file", content: contactVcf },
          "blurb.txt": { type: "file", content: [contact.blurb] },
        },
      },
      ".config": {
        type: "dir",
        hidden: true,
        note: "terminal config",
        children: {
          "theme.conf": {
            type: "file",
            content: [
              "# ~/.config/theme.conf",
              `theme = "${activeTheme}"`,
              `accent = "${activeAccent}"`,
              `surface = "${activeSurface}"`,
              `audio = ${activeAudio}`,
            ],
          },
        },
      },
      ".zshrc": {
        type: "file",
        hidden: true,
        note: "shell rc",
        content: [
          "# ~/.zshrc",
          `export USER="${profile.handle}"`,
          `export HOST="portfolio"`,
          `export THEME="${activeTheme}"`,
          "alias ll='ls -la'",
          "alias fetch='fastfetch'",
        ],
      },
      "README.md": { type: "file", note: "overview", content: readmeLines },
      "bio.txt": { type: "file", note: "short bio", content: bioLines },
      "stack.txt": {
        type: "file",
        note: "tech stack",
        content: stack.filter((g) => !g.hidden).map((g) => `${g.group.padEnd(11)} : ${g.items.join(", ")}`),
      },
      "stack.toml": { type: "file", note: "stack manifest", content: stackToml },
      "contact.vcf": { type: "file", note: "endpoints", content: contactVcf },
    },
  }
}

export function normalizeVfsPath(cwd = "~", target = "") {
  const base = (cwd || "~").replace(/^~\/?/, "").split("/").filter(Boolean)
  const raw = target.trim()
  let segments
  if (!raw || raw === "~") {
    segments = []
  } else if (raw.startsWith("~/")) {
    segments = raw.slice(2).split("/").filter(Boolean)
  } else if (raw.startsWith("/")) {
    segments = raw.slice(1).split("/").filter(Boolean)
  } else {
    segments = [...base, ...raw.split("/").filter(Boolean)]
  }

  const stackSegs = []
  for (const seg of segments) {
    if (seg === ".") continue
    if (seg === "..") stackSegs.pop()
    else stackSegs.push(seg)
  }
  return stackSegs.length ? `~/${stackSegs.join("/")}` : "~"
}

function getNode(fs, vfsPath) {
  const segs = vfsPath.replace(/^~\/?/, "").split("/").filter(Boolean)
  let node = fs
  for (const seg of segs) {
    if (!node || node.type !== "dir") return null
    const exact = Object.hasOwn(node.children, seg) ? node.children[seg] : null
    if (exact) {
      node = exact
      continue
    }
    const lower = seg.toLowerCase()
    const matchKey = Object.keys(node.children).find((k) => k.toLowerCase() === lower)
    if (!matchKey) return null
    node = node.children[matchKey]
  }
  return node
}

function splitPipeline(raw) {
  const stages = []
  let current = ""
  let quote = null
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    if ((ch === "'" || ch === '"') && !quote) {
      quote = ch
      current += ch
    } else if (ch === quote) {
      quote = null
      current += ch
    } else if (ch === "|" && !quote) {
      stages.push(current.trim())
      current = ""
    } else {
      current += ch
    }
  }
  if (current.trim()) stages.push(current.trim())
  return stages
}

function tokenize(stage) {
  const tokens = []
  let buf = ""
  let quote = null
  for (let i = 0; i < stage.length; i++) {
    const ch = stage[i]
    if ((ch === "'" || ch === '"') && !quote) {
      quote = ch
    } else if (ch === quote) {
      quote = null
    } else if (/\s/.test(ch) && !quote) {
      if (buf) {
        tokens.push(buf)
        buf = ""
      }
    } else {
      buf += ch
    }
  }
  if (buf) tokens.push(buf)
  return tokens
}

function formatUptime(startedAt) {
  const seconds = Math.max(1, Math.floor((Date.now() - (startedAt || Date.now())) / 1000))
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

function renderTree(node, prefix = "", showHidden = false) {
  const keys = Object.keys(node.children || {}).filter((k) => showHidden || !node.children[k].hidden)
  const out = []
  keys.forEach((key, idx) => {
    const child = node.children[key]
    const last = idx === keys.length - 1
    const branch = last ? "└── " : "├── "
    const label = child.type === "dir" ? `${key}/` : key
    const note = child.note ? `  # ${child.note}` : ""
    out.push({
      tone: child.type === "dir" ? "teal" : undefined,
      text: `${prefix}${branch}${label}${note}`,
    })
    if (child.type === "dir" && Object.keys(child.children || {}).length > 0) {
      const nextPrefix = prefix + (last ? "    " : "│   ")
      out.push(...renderTree(child, nextPrefix, showHidden))
    }
  })
  return out
}

function collectFind(node, currentPath, query) {
  const hits = []
  for (const [name, child] of Object.entries(node.children || {})) {
    const full = currentPath === "~" ? `~/${name}` : `${currentPath}/${name}`
    if (!query || full.toLowerCase().includes(query.toLowerCase())) {
      hits.push({ tone: child.type === "dir" ? "teal" : undefined, text: child.type === "dir" ? `${full}/` : full })
    }
    if (child.type === "dir") {
      hits.push(...collectFind(child, full, query))
    }
  }
  return hits
}

/**
 * Returns zsh-style ghost autosuggestion suffix for the current input.
 */
export function getShellSuggestion(input, context = {}) {
  const raw = input || ""
  if (!raw || raw.includes("|")) return ""
  const lower = raw.toLowerCase()

  if (!raw.includes(" ")) {
    const match = BASE_COMMANDS.find((cmd) => cmd.startsWith(lower) && cmd !== lower)
    return match ? match.slice(raw.length) : ""
  }

  const spaceIdx = raw.indexOf(" ")
  const cmd = raw.slice(0, spaceIdx).toLowerCase()
  const rest = raw.slice(spaceIdx + 1)
  const restLower = rest.toLowerCase()

  if (cmd === "theme") {
    const match = THEMES.map((t) => t.id).find((id) => id.startsWith(restLower) && id !== restLower)
    return match ? match.slice(rest.length) : ""
  }

  if (cmd === "accent") {
    const ids = (context.accents || []).map((a) => a.id)
    const match = ids.find((id) => id.startsWith(restLower) && id !== restLower)
    return match ? match.slice(rest.length) : ""
  }

  if (cmd === "surface") {
    const match = SURFACES.map((s) => s.id).find((id) => id.startsWith(restLower) && id !== restLower)
    return match ? match.slice(rest.length) : ""
  }

  if (cmd === "split") {
    const match = ["vertical", "horizontal", "off"].find((m) => m.startsWith(restLower) && m !== restLower)
    return match ? match.slice(rest.length) : ""
  }

  if (cmd === "audio") {
    const match = ["on", "off"].find((m) => m.startsWith(restLower) && m !== restLower)
    return match ? match.slice(rest.length) : ""
  }

  if (cmd === "cd" || cmd === "ls" || cmd === "cat" || cmd === "head" || cmd === "tail") {
    const fs = buildVirtualFs(context)
    const cwd = context.currentPath || "~"
    const clean = rest.replace(/^-[a-z]+\s+/i, "")
    const prefixUsed = rest.slice(0, rest.length - clean.length)
    const slashIdx = clean.lastIndexOf("/")
    const dirPart = slashIdx >= 0 ? clean.slice(0, slashIdx + 1) : ""
    const leaf = slashIdx >= 0 ? clean.slice(slashIdx + 1) : clean
    const targetDir = normalizeVfsPath(cwd, dirPart || ".")
    const node = getNode(fs, targetDir)
    if (node?.type === "dir") {
      const candidates = Object.entries(node.children)
        .filter(([, child]) => (cmd === "cd" ? child.type === "dir" : true))
        .map(([name, child]) => (child.type === "dir" ? `${name}/` : name))
      const match = candidates.find((item) => item.toLowerCase().startsWith(leaf.toLowerCase()) && item.toLowerCase() !== leaf.toLowerCase())
      if (match) return (prefixUsed + dirPart + match).slice(rest.length)
    }
    return ""
  }

  if (cmd === "open") {
    const targets = ["github", "linkedin", "codeforces", "resume", "email", "home", "about", "projects", "experience", "contact"]
    const match = targets.find((t) => t.startsWith(restLower) && t !== restLower)
    return match ? match.slice(rest.length) : ""
  }

  if (cmd === "man") {
    const targets = [profile.handle, ...(context.projects || []).map((p) => p.slug)]
    const match = targets.find((t) => t.toLowerCase().startsWith(restLower) && t.toLowerCase() !== restLower)
    return match ? match.slice(rest.length) : ""
  }

  return ""
}

function executeSingleStage(tokens, stdinLines, context, fs) {
  if (!tokens.length) return { lines: [] }
  const cmdRaw = tokens[0]
  const cmd = cmdRaw === "ll" ? "ls" : cmdRaw.toLowerCase()
  const args = cmdRaw === "ll" ? ["-la", ...tokens.slice(1)] : tokens.slice(1)
  const argStr = args.join(" ")
  const argLower = argStr.toLowerCase()
  const cwd = context.currentPath || "~"
  const projects = context.projects || []
  const activities = context.activities || []

  if (cmd === "clear") return { clear: true, lines: [] }

  if (cmd === "help" || cmd === "?") {
    return {
      lines: [
        { tone: "accent", text: "Available commands (supports pipes: e.g. cat README.md | grep -i ml)" },
        { text: "  cd <dir>          navigate (~, about, projects, experience, contact, ..)" },
        { text: "  ls [-la] [path]   list virtual filesystem entries" },
        { text: "  tree [path]       display directory tree" },
        { text: "  cat / head / tail inspect files (README.md, stack.toml, .config/theme.conf)" },
        { text: "  grep [-i] <pat>   search text (works in pipes or on files)" },
        { text: "  find [query]      locate virtual files" },
        { text: "  wc [-l|-w]        count lines/words from file or stdin" },
        { text: "  man [aaser|slug]  display manual page" },
        { text: "  git log | status  inspect experience history" },
        { text: "  theme [name]      switch theme (kanagawa, noir, gruvbox, mocha, amber, phosphor, dracula, paper)" },
        { text: "  accent [name]     switch active theme accent" },
        { text: "  surface [mode]    set surface physics (auto | flat | crt)" },
        { text: "  split [v|h|off]   toggle real tmux split pane (or Ctrl+B % / \")" },
        { text: "  zoom              toggle active pane zoom (or Ctrl+B z)" },
        { text: "  audio [on|off]    toggle subtle mechanical keyclick / BEL" },
        { text: "  open <target>     open github, linkedin, codeforces, resume, email" },
        { text: "  copy email        copy email address to clipboard" },
        { text: "  dmesg / reboot    print boot sequence log" },
        { text: "  curl              show CLI curl endpoint command" },
        { text: "  clear             clear scrollback (Ctrl+L · Ctrl+R history search)" },
      ],
    }
  }

  if (cmd === "whoami") {
    return {
      lines: [
        { tone: "accent", text: `${profile.handle} (${profile.name})` },
        { text: `${profile.role} @ ${profile.school} — ${profile.location}` },
      ],
    }
  }

  if (cmd === "pwd") {
    return { lines: [{ tone: "teal", text: cwd }] }
  }

  if (cmd === "uname") {
    return {
      lines: [{ text: "PortfolioOS 6.12-arch1-1 x86_64 GNU/Linux (React 19 + Cloudflare Worker)" }],
    }
  }

  if (cmd === "date") {
    const cairo = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Cairo",
      dateStyle: "medium",
      timeStyle: "medium",
      timeZoneName: "short",
    }).format(new Date())
    return { lines: [{ text: `${cairo} (Cairo, Egypt)` }] }
  }

  if (cmd === "uptime") {
    return {
      lines: [{ text: `session up ${formatUptime(context.startedAt)} · graduating May 2029 · load avg: 0.14, 0.22, 0.18` }],
    }
  }

  if (cmd === "neofetch" || cmd === "fastfetch") {
    return {
      lines: [
        { tone: "accent", text: `${profile.handle}@portfolio` },
        { tone: "muted", text: "─".repeat(profile.handle.length + 10) },
        ...hero.neofetch.map((row) => ({ text: `${row.key.padEnd(10)} ${row.value}` })),
      ],
    }
  }

  if (cmd === "dmesg" || cmd === "reboot") {
    return {
      lines: [
        { tone: "muted", text: "[    0.000000] Linux version 6.12-portfolio (aaser@ainshams)" },
        { tone: "success", text: "[    0.042100] [ OK ] Mounted virtual filesystem at ~/" },
        { tone: "success", text: "[    0.089400] [ OK ] Loaded JetBrains Mono grid + Kanagawa Wave palette" },
        { tone: "success", text: "[    0.131000] [ OK ] Started tmux multiplexer + fzf index" },
        { tone: "teal", text: "[    0.164200] Ready. Zero blocking boot delay on arrival." },
      ],
    }
  }

  if (cmd === "curl") {
    const host = typeof window !== "undefined" ? window.location.origin : "https://aasermo.pages.dev"
    return {
      lines: [
        { tone: "accent", text: "CLI-native portfolio endpoints (served via Cloudflare Worker):" },
        { tone: "teal", text: `  curl -sL ${host}` },
        { tone: "teal", text: `  curl -sL ${host}/projects` },
        { tone: "teal", text: `  curl -sL ${host}/contact` },
        { tone: "teal", text: `  curl -sL ${host}/json` },
      ],
    }
  }

  if (cmd === "man") {
    const target = argLower || profile.handle
    if (target === profile.handle || target === "portfolio") {
      return {
        lines: [
          { tone: "accent", text: `${profile.handle.toUpperCase()}(1)                 Portfolio Manual                 ${profile.handle.toUpperCase()}(1)` },
          { text: "" },
          { tone: "teal", text: "NAME" },
          { text: `    ${profile.handle} — ${profile.name}, ${profile.role}` },
          { text: "" },
          { tone: "teal", text: "SYNOPSIS" },
          { text: `    Computer & AI Engineering @ ${profile.school} (May 2029)` },
          { text: "" },
          { tone: "teal", text: "STACK" },
          ...stack.filter((g) => !g.hidden).map((g) => ({ text: `    ${g.group.padEnd(11)} ${g.items.join(", ")}` })),
          { text: "" },
          { tone: "teal", text: "CONTACT" },
          { text: `    ${profile.email}  ·  ${profile.location}` },
        ],
      }
    }
    const project = projects.find((p) => p.slug.toLowerCase() === target)
    if (project) {
      return {
        navigate: `/projects/${project.slug}`,
        lines: [{ tone: "teal", text: `→ opening man page for ${project.slug}` }],
      }
    }
    return { lines: [{ tone: "error", text: `No manual entry for ${argStr}` }] }
  }

  if (cmd === "ls") {
    const flags = args.filter((a) => a.startsWith("-")).join("")
    const pathArg = args.find((a) => !a.startsWith("-")) || ""
    const detailed = flags.includes("l")
    const showAll = flags.includes("a")
    const targetPath = normalizeVfsPath(cwd, pathArg)
    const node = getNode(fs, targetPath)
    if (!node) return { lines: [{ tone: "error", text: `ls: cannot access '${pathArg}': No such file or directory` }] }
    if (node.type === "file") {
      return { lines: [{ text: detailed ? `-rw-r--r--  ${profile.handle}  ${pathArg}` : pathArg }] }
    }
    const entries = Object.entries(node.children).filter(([, child]) => showAll || !child.hidden)
    if (!entries.length) {
      return { lines: [{ tone: "muted", text: "total 0" }] }
    }
    if (detailed) {
      return {
        lines: [
          { tone: "muted", text: `total ${entries.length}` },
          ...entries.map(([name, child]) => {
            const isDir = child.type === "dir"
            const perm = isDir ? "drwxr-xr-x" : "-rw-r--r--"
            const display = isDir ? `${name}/` : name
            const note = child.note ? `  # ${child.note}` : ""
            return {
              tone: isDir ? "teal" : undefined,
              text: `${perm}  ${profile.handle}  ${display.padEnd(16, " ")}${note}`,
            }
          }),
        ],
      }
    }
    const dirs = entries.filter(([, c]) => c.type === "dir").map(([n]) => `${n}/`)
    const files = entries.filter(([, c]) => c.type !== "dir").map(([n]) => n)
    const out = []
    if (dirs.length) out.push({ tone: "teal", text: dirs.join("  ") })
    if (files.length) out.push({ text: files.join("  ") })
    return { lines: out }
  }

  if (cmd === "tree") {
    const showAll = args.includes("-a")
    const pathArg = args.find((a) => !a.startsWith("-")) || ""
    const targetPath = normalizeVfsPath(cwd, pathArg)
    const node = getNode(fs, targetPath)
    if (!node || node.type !== "dir") {
      return { lines: [{ tone: "error", text: `tree: '${pathArg}': Not a directory` }] }
    }
    return {
      lines: [
        { tone: "accent", text: targetPath },
        ...renderTree(node, "", showAll),
      ],
    }
  }

  if (cmd === "find") {
    const query = args.filter((a) => !a.startsWith("-")).join(" ")
    const hits = collectFind(fs, "~", query)
    return { lines: hits.length ? hits : [{ tone: "muted", text: "(no matching paths)" }] }
  }

  if (cmd === "cd") {
    const rawTarget = args[0] || "~"
    const cleaned = rawTarget.replace(/\/+$/, "")
    if (Object.hasOwn(destinationMap, cleaned.toLowerCase())) {
      const route = destinationMap[cleaned.toLowerCase()]
      const nextCwd = routeToCwd[route] || "~"
      return {
        navigate: route,
        setCwd: nextCwd,
        lines: [{ tone: "teal", text: `→ ${nextCwd}` }],
      }
    }
    const resolved = normalizeVfsPath(cwd, rawTarget)
    const node = getNode(fs, resolved)
    if (!node) {
      return { lines: [{ tone: "error", text: `cd: no such file or directory: ${rawTarget}` }] }
    }
    if (node.type !== "dir") {
      return { lines: [{ tone: "error", text: `cd: not a directory: ${rawTarget}` }] }
    }
    // Check if resolved matches a top-level section or project
    const matchingProject = projects.find((p) => resolved === `~/projects/${p.slug}`)
    if (matchingProject) {
      return {
        navigate: `/projects/${matchingProject.slug}`,
        setCwd: resolved,
        lines: [{ tone: "teal", text: `→ opening ${resolved}` }],
      }
    }
    const mappedRoute = Object.entries(routeToCwd).find(([, p]) => p === resolved)?.[0]
    return {
      navigate: mappedRoute,
      setCwd: resolved,
      lines: [{ tone: "teal", text: `→ ${resolved}` }],
    }
  }

  if (cmd === "cat") {
    if (!args.length && stdinLines) return { lines: stdinLines }
    if (!args.length) {
      return { lines: [{ tone: "muted", text: "usage: cat <README.md | bio.txt | stack.toml | contact.vcf | .config/theme.conf>" }] }
    }
    const targetPath = normalizeVfsPath(cwd, args[0])
    const node = getNode(fs, targetPath)
    if (node?.type === "file") {
      return { lines: node.content.map((text) => ({ text })) }
    }
    if (node?.type === "dir") {
      return { lines: [{ tone: "error", text: `cat: ${args[0]}: Is a directory` }] }
    }
    const slug = args[0].replace(/^~\/|^\.\//, "").toLowerCase()
    const project = projects.find((p) => p.slug.toLowerCase() === slug)
    if (project) {
      return {
        lines: [
          { tone: "accent", text: `${project.name} (${project.year}) [${project.status}]` },
          { text: project.tagline },
          { tone: "muted", text: `stack: ${project.stack.join(", ")}` },
        ],
      }
    }
    return { lines: [{ tone: "error", text: `cat: ${args[0]}: No such file or directory` }] }
  }

  if (cmd === "head" || cmd === "tail") {
    let count = 10
    let fileArg = null
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-n" && args[i + 1]) {
        count = Math.max(1, Number.parseInt(args[i + 1], 10) || 10)
        i++
      } else if (/^-\d+$/.test(args[i])) {
        count = Math.max(1, Number.parseInt(args[i].slice(1), 10) || 10)
      } else if (!args[i].startsWith("-")) {
        fileArg = args[i]
      }
    }
    let source = stdinLines
    if (fileArg) {
      const node = getNode(fs, normalizeVfsPath(cwd, fileArg))
      if (!node || node.type !== "file") {
        return { lines: [{ tone: "error", text: `${cmd}: ${fileArg}: No such file` }] }
      }
      source = node.content.map((text) => ({ text }))
    }
    if (!source) return { lines: [{ tone: "muted", text: `usage: ${cmd} [-n N] <file>` }] }
    return { lines: cmd === "head" ? source.slice(0, count) : source.slice(-count) }
  }

  if (cmd === "grep") {
    const insensitive = args.includes("-i")
    const positional = args.filter((a) => !a.startsWith("-"))
    const pattern = positional[0]
    const fileArg = positional[1]
    if (!pattern) return { lines: [{ tone: "muted", text: "usage: grep [-i] <pattern> [file]" }] }
    let source = stdinLines
    if (fileArg) {
      const node = getNode(fs, normalizeVfsPath(cwd, fileArg))
      if (!node || node.type !== "file") {
        return { lines: [{ tone: "error", text: `grep: ${fileArg}: No such file` }] }
      }
      source = node.content.map((text) => ({ text }))
    }
    if (!source) return { lines: [{ tone: "muted", text: "usage: <cmd> | grep [-i] <pattern>  or  grep <pattern> <file>" }] }
    const needle = insensitive ? pattern.toLowerCase() : pattern
    const matched = source.filter((line) => (insensitive ? line.text.toLowerCase() : line.text).includes(needle))
    return { lines: matched.length ? matched : [{ tone: "muted", text: "(no matches)" }] }
  }

  if (cmd === "wc") {
    const flags = args.filter((a) => a.startsWith("-")).join("")
    const fileArg = args.find((a) => !a.startsWith("-"))
    let source = stdinLines
    if (fileArg) {
      const node = getNode(fs, normalizeVfsPath(cwd, fileArg))
      if (!node || node.type !== "file") {
        return { lines: [{ tone: "error", text: `wc: ${fileArg}: No such file` }] }
      }
      source = node.content.map((text) => ({ text }))
    }
    if (!source) return { lines: [{ tone: "muted", text: "usage: <cmd> | wc [-l|-w]  or  wc <file>" }] }
    const lineCount = source.length
    const wordCount = source.reduce((acc, item) => acc + (item.text.trim() ? item.text.trim().split(/\s+/).length : 0), 0)
    const charCount = source.reduce((acc, item) => acc + item.text.length + 1, 0)
    if (flags.includes("l")) return { lines: [{ text: String(lineCount) }] }
    if (flags.includes("w")) return { lines: [{ text: String(wordCount) }] }
    return { lines: [{ text: `${String(lineCount).padStart(4)} ${String(wordCount).padStart(5)} ${String(charCount).padStart(6)}${fileArg ? ` ${fileArg}` : ""}` }] }
  }

  if (cmd === "git") {
    const sub = (args[0] || "log").toLowerCase()
    if (sub === "status") {
      return {
        lines: [
          { tone: "teal", text: "On branch main" },
          { text: `Projects: ${projects.length} tracked · Experience: ${activities.length} commits` },
          { tone: "muted", text: "nothing to commit, working tree clean" },
        ],
      }
    }
    if (sub === "log") {
      if (!activities.length) {
        return { lines: [{ tone: "muted", text: "fatal: your current branch 'main' does not have any commits yet" }] }
      }
      return {
        lines: activities.map((item, idx) => ({
          tone: idx === 0 ? "accent" : undefined,
          text: `* ${item.role} @ ${item.org} (${item.start} — ${item.end})`,
        })),
      }
    }
    return { lines: [{ tone: "error", text: `git: '${sub}' is not supported here. Try 'git log' or 'git status'.` }] }
  }

  if (cmd === "theme") {
    if (!argLower) {
      return {
        lines: [
          { tone: "accent", text: `Current theme: ${context.theme || THEMES[0].id}` },
          { text: `Available: ${THEMES.map((t) => t.id).join(" · ")}` },
        ],
      }
    }
    const found = THEMES.find((t) => t.id === argLower || t.label.toLowerCase().includes(argLower))
    if (!found) {
      return { lines: [{ tone: "error", text: `Unknown theme "${argStr}". Try: ${THEMES.map((t) => t.id).join(", ")}` }] }
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
      return { lines: [{ tone: "error", text: `Unknown accent "${argStr}". Try: ${accents.map((a) => a.id).join(", ")}` }] }
    }
    return {
      setAccent: found.id,
      lines: [{ tone: "success", text: `✓ accent set to ${found.label}` }],
    }
  }

  if (cmd === "surface" || cmd === "scanlines" || cmd === "bg" || cmd === "background") {
    if (!argLower) {
      return {
        lines: [
          { tone: "accent", text: `Current surface: ${context.surface || "auto"}` },
          { text: `Available: ${SURFACES.map((s) => s.id).join(" · ")}` },
        ],
      }
    }
    const mapped = argLower === "minimal" || argLower === "off" ? "flat" : argLower === "on" ? "crt" : argLower
    if (SURFACES.some((s) => s.id === mapped)) {
      return {
        setSurface: mapped,
        lines: [{ tone: "success", text: `✓ surface set to ${mapped}` }],
      }
    }
    return { lines: [{ tone: "error", text: `Unknown surface "${argStr}". Try: auto, flat, crt` }] }
  }

  if (cmd === "split") {
    const target = !argLower ? "toggle" : argLower
    if (target === "v" || target === "vertical" || target === "%") {
      return { setSplit: "vertical", lines: [{ tone: "success", text: "✓ tmux vertical split active (Ctrl+B z to zoom)" }] }
    }
    if (target === "h" || target === "horizontal" || target === '"') {
      return { setSplit: "horizontal", lines: [{ tone: "success", text: "✓ tmux horizontal split active (Ctrl+B z to zoom)" }] }
    }
    if (target === "off" || target === "dock" || target === "close") {
      return { setSplit: "dock", lines: [{ tone: "teal", text: "→ collapsed to compact bottom prompt" }] }
    }
    if (target === "toggle") {
      return { setSplit: "toggle", lines: [{ tone: "success", text: "✓ toggled tmux split pane" }] }
    }
    return { lines: [{ tone: "error", text: "usage: split <v | h | off>" }] }
  }

  if (cmd === "zoom") {
    return { toggleZoom: true, lines: [{ tone: "teal", text: "✓ toggled active pane zoom" }] }
  }

  if (cmd === "audio" || cmd === "bell") {
    if (!argLower) {
      return { lines: [{ tone: "accent", text: `Terminal audio: ${context.audio ? "on" : "off"} (try 'audio on' or 'audio off')` }] }
    }
    if (argLower === "on" || argLower === "1" || argLower === "true") {
      return { setAudio: true, lines: [{ tone: "success", text: "✓ terminal audio enabled" }] }
    }
    if (argLower === "off" || argLower === "0" || argLower === "false") {
      return { setAudio: false, lines: [{ tone: "teal", text: "✓ terminal audio muted" }] }
    }
    return { lines: [{ tone: "error", text: "usage: audio <on | off>" }] }
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
    return { lines: [{ tone: "error", text: `open: unknown target "${argStr}"` }] }
  }

  if (cmd === "copy" || cmd === "wl-copy" || cmd === "xclip" || cmd === "pbcopy") {
    if (!argLower || argLower === "email" || argLower === "mail") {
      return {
        copyText: profile.email,
        lines: [{ tone: "success", text: `✓ copied ${profile.email} to clipboard` }],
      }
    }
    return { lines: [{ tone: "error", text: `${cmd}: try "copy email"` }] }
  }

  if (cmd === "ping") {
    return {
      navigate: "/#contact",
      lines: [{ tone: "teal", text: `→ opening ~/contact (mtr ${profile.handle})` }],
    }
  }

  if (cmd === "echo") {
    return { lines: [{ text: argStr }] }
  }

  if (cmd === "history") {
    const entries = context.history || []
    if (!entries.length) return { lines: [{ tone: "muted", text: "(history empty)" }] }
    return {
      lines: entries.slice(-16).map((entry, idx) => ({
        text: `${String(idx + 1).padStart(3, " ")}  ${entry}`,
      })),
    }
  }

  if (cmd === "sudo") {
    return {
      isError: true,
      lines: [{ tone: "error", text: `${profile.handle} is not in the sudoers file. This incident will be reported.` }],
    }
  }

  if (cmd === "exit" || cmd === "logout") {
    return {
      setSplit: "dock",
      lines: [{ tone: "muted", text: "logout: session stays active — collapsed split pane. Try `cd ~` or `open github`." }],
    }
  }

  return {
    isError: true,
    lines: [{ tone: "error", text: `zsh: command not found: ${cmdRaw} — type "help" for available commands` }],
  }
}

/**
 * Execute a shell command or pipeline (`cmd1 | grep foo | wc -l`) and return output lines + side-effect intents.
 */
export function executeShellCommand(rawInput, context = {}) {
  const input = (rawInput || "").trim()
  if (!input) return { lines: [] }

  const fs = buildVirtualFs(context)
  const stages = splitPipeline(input)
  let stdinLines = null
  let merged = { lines: [] }

  for (let i = 0; i < stages.length; i++) {
    const tokens = tokenize(stages[i])
    const result = executeSingleStage(tokens, stdinLines, context, fs)
    merged = { ...merged, ...result }
    stdinLines = result.lines || []
    if (result.clear || result.isError) break
  }

  return merged
}

export { sections }
