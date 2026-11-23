const accents = (names) => Object.entries(names).map(([id, label]) => ({ id, label }))

export const THEMES = [
  {
    id: "kanagawa",
    label: "Kanagawa Wave",
    surface: "hybrid",
    preview: ["#1f1f28", "#e6c384", "#7aa89f", "#7e9cd8"],
    accents: accents({ carp: "carp", wave: "wave", crystal: "crystal", autumn: "autumn", spring: "spring" }),
  },
  {
    id: "noir",
    label: "Ghostty Noir",
    surface: "hybrid",
    preview: ["#111215", "#79c7b6", "#e6e4de", "#e2c078"],
    accents: accents({ jade: "jade", bone: "bone", "ochre-noir": "ochre", ice: "ice" }),
  },
  {
    id: "gruvbox",
    label: "Gruvbox Dark",
    surface: "hybrid",
    preview: ["#282828", "#fabd2f", "#8ec07c", "#fe8019"],
    accents: accents({ gold: "gold", olive: "olive", aqua: "aqua", coral: "coral", lilac: "lilac" }),
  },
  {
    id: "mocha",
    label: "Catppuccin Mocha",
    surface: "hybrid",
    preview: ["#1e1e2e", "#cba6f7", "#94e2d5", "#89b4fa"],
    accents: accents({ mauve: "mauve", green: "green", teal: "teal", blue: "sapphire", peach: "peach" }),
  },
  {
    id: "amber",
    label: "Amber VT220",
    surface: "crt",
    preview: ["#150f08", "#ffb000", "#e89b3c", "#f6cf7f"],
    accents: accents({ p3: "p3 amber", ochre: "ochre", warm: "warm gold" }),
  },
  {
    id: "phosphor",
    label: "Green Phosphor",
    surface: "crt",
    preview: ["#0a190f", "#8cf596", "#5fd182", "#d0f4ad"],
    accents: accents({ phosphor: "phosphor", emerald: "emerald", soft: "soft green" }),
  },
  {
    id: "dracula",
    label: "Dracula",
    surface: "hybrid",
    preview: ["#282a36", "#8be9fd", "#50fa7b", "#bd93f9"],
    accents: accents({ cyan: "cyan", violet: "violet", pink: "pink", mint: "mint", apricot: "apricot" }),
  },
  {
    id: "paper",
    label: "Paper Teletype",
    surface: "paper",
    preview: ["#f5ecda", "#67402b", "#24573d", "#344478"],
    accents: accents({ ink: "ink", forest: "forest", indigo: "indigo", rust: "rust" }),
  },
]

export const DEFAULT_THEME = THEMES[0]
export const APPEARANCE_KEY = "portfolio-appearance"

export const SURFACES = [
  { id: "auto", label: "auto" },
  { id: "hybrid", label: "hybrid" },
  { id: "flat", label: "flat" },
  { id: "crt", label: "crt" },
]

export const getTheme = (id) => THEMES.find((theme) => theme.id === id) || DEFAULT_THEME

export function normalizeAppearance(value) {
  const theme = getTheme(value?.theme)
  const rawSurface = value?.surface ?? (value?.background === "crt" ? "crt" : value?.background === "minimal" ? "flat" : "auto")
  return {
    theme: theme.id,
    accent: theme.accents.find((item) => item.id === value?.accent)?.id || theme.accents[0].id,
    surface: SURFACES.some((item) => item.id === rawSurface) ? rawSurface : "auto",
    audio: Boolean(value?.audio),
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
  projects: { index: 2, name: "yazi", path: "~/projects" },
  activities: { index: 3, name: "git-log", path: "~/experience" },
  experience: { index: 3, name: "git-log", path: "~/experience" },
  extracurriculars: { index: 3, name: "git-log", path: "~/experience" },
  contact: { index: 4, name: "mtr", path: "~/contact" },
}

export function getSessionTask(location) {
  const pathname = location?.pathname || "/"
  const hash = (location?.hash || "").slice(1)

  if (pathname.startsWith("/projects/")) {
    const slug = pathname.slice("/projects/".length)
    return { index: 2, name: "man", path: slug ? `~/projects/${slug}` : "~/projects" }
  }

  if (pathname === "/") {
    if (Object.hasOwn(sectionTasks, hash)) return sectionTasks[hash]
    return { index: 0, name: "fastfetch", path: "~" }
  }

  return { index: 0, name: "zsh", path: pathname }
}
