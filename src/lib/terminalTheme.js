export const DEFAULT_BACKGROUND = "crt"

export const ACCENTS = [
  { id: "mauve", label: "mauve", hex: "#cba6f7" },
  { id: "green", label: "phosphor", hex: "#a6e3a1" },
  { id: "teal", label: "teal", hex: "#94e2d5" },
  { id: "blue", label: "sapphire", hex: "#89b4fa" },
  { id: "peach", label: "amber", hex: "#fab387" },
]

export const BACKGROUNDS = [
  { id: "grid", label: "grid" },
  { id: "crt", label: "crt" },
  { id: "circuit", label: "blueprint" },
  { id: "minimal", label: "minimal" },
]

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
