const accents = (names) => Object.entries(names).map(([id, label]) => ({ id, label }))

export const THEMES = [
  { id: "mocha", label: "Catppuccin Mocha", background: "starfield", accents: accents({ mauve: "mauve", green: "phosphor", teal: "teal", blue: "sapphire", peach: "amber" }) },
  { id: "gruvbox", label: "Gruvbox Dark", background: "grid", accents: accents({ gold: "gold", olive: "olive", aqua: "aqua", coral: "coral", lilac: "lilac" }) },
  { id: "dracula", label: "Dracula", background: "starfield", accents: accents({ violet: "violet", pink: "pink", mint: "mint", cyan: "cyan", apricot: "apricot" }) },
  { id: "phosphor", label: "Green Phosphor CRT", background: "minimal", accents: accents({ phosphor: "phosphor", emerald: "emerald", soft: "soft green" }) },
  { id: "paper", label: "Paper Teletype", background: "minimal", accents: accents({ ink: "ink", forest: "forest", indigo: "indigo", rust: "rust" }) },
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
