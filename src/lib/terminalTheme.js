const accents = (names) => Object.entries(names).map(([id, label]) => ({ id, label }))

export const THEMES = [
  {
    id: "mocha",
    label: "Catppuccin Mocha",
    background: "starfield",
    preview: ["#1b1c2a", "#cba6f7", "#94e2d5", "#89b4fa"],
    accents: accents({ mauve: "mauve", green: "phosphor", teal: "teal", blue: "sapphire", peach: "amber" }),
  },
  {
    id: "kanagawa",
    label: "Kanagawa Wave",
    background: "minimal",
    preview: ["#1f1f28", "#e6c384", "#7aa89f", "#7e9cd8"],
    accents: accents({ carp: "carp", wave: "wave", crystal: "crystal", autumn: "autumn", spring: "spring" }),
  },
  {
    id: "gruvbox",
    label: "Gruvbox Dark",
    background: "grid",
    preview: ["#262524", "#fabd2f", "#8ec07c", "#fb806d"],
    accents: accents({ gold: "gold", olive: "olive", aqua: "aqua", coral: "coral", lilac: "lilac" }),
  },
  {
    id: "amber",
    label: "Amber VT220",
    background: "crt",
    preview: ["#150f08", "#ffb000", "#e89b3c", "#f6cf7f"],
    accents: accents({ p3: "p3 amber", ochre: "ochre", warm: "warm gold" }),
  },
  {
    id: "dracula",
    label: "Dracula",
    background: "starfield",
    preview: ["#252735", "#bd93f9", "#50fa7b", "#8be9fd"],
    accents: accents({ violet: "violet", pink: "pink", mint: "mint", cyan: "cyan", apricot: "apricot" }),
  },
  {
    id: "phosphor",
    label: "Green Phosphor CRT",
    background: "minimal",
    preview: ["#0a190f", "#8cf596", "#5fd182", "#d0f4ad"],
    accents: accents({ phosphor: "phosphor", emerald: "emerald", soft: "soft green" }),
  },
  {
    id: "paper",
    label: "Paper Teletype",
    background: "minimal",
    preview: ["#f5ecda", "#67402b", "#24573d", "#344478"],
    accents: accents({ ink: "ink", forest: "forest", indigo: "indigo", rust: "rust" }),
  },
]

export const DEFAULT_THEME = THEMES[0]
export const APPEARANCE_KEY = "portfolio-appearance"

export const BACKGROUNDS = [
  { id: "starfield", label: "starfield" },
  { id: "grid", label: "grid" },
  { id: "crt", label: "crt" },
  { id: "circuit", label: "blueprint" },
  { id: "minimal", label: "minimal" },
]

export const getTheme = (id) => THEMES.find((theme) => theme.id === id) || DEFAULT_THEME

export function normalizeAppearance(value) {
  const theme = getTheme(value?.theme)
  return {
    theme: theme.id,
    accent: theme.accents.find((item) => item.id === value?.accent)?.id || theme.accents[0].id,
    background: BACKGROUNDS.find((item) => item.id === value?.background)?.id || "auto",
  }
}

export function readAppearance() {
  if (typeof window === "undefined") return normalizeAppearance()
  try {
    return normalizeAppearance(JSON.parse(window.localStorage.getItem(APPEARANCE_KEY)))
  } catch {
    return normalizeAppearance()
  }
}

const sectionTasks = {
  about: { index: 1, name: "whoami", path: "~/about" },
  projects: { index: 2, name: "ls", path: "~/projects" },
  activities: { index: 3, name: "git-log", path: "~/experience" },
  experience: { index: 3, name: "git-log", path: "~/experience" },
  extracurriculars: { index: 3, name: "git-log", path: "~/experience" },
  contact: { index: 4, name: "ping", path: "~/contact" },
}

export function getSessionTask(location) {
  const pathname = location?.pathname || "/"
  const hash = (location?.hash || "").slice(1)

  if (pathname.startsWith("/projects/")) {
    const slug = pathname.slice("/projects/".length)
    return { index: 2, name: "cat", path: slug ? `~/projects/${slug}` : "~/projects" }
  }

  if (pathname === "/") {
    if (Object.hasOwn(sectionTasks, hash)) return sectionTasks[hash]
    return { index: 0, name: "neofetch", path: "~" }
  }

  return { index: 0, name: "cd", path: pathname }
}
