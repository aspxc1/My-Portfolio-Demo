import { createContext, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react"
import { APPEARANCE_KEY, getTheme, normalizeAppearance, readAppearance } from "../lib/terminalTheme.js"

export const PlaybackHistory = createContext(null)
export const ProjectBrowsing = createContext(null)
export const TerminalTheme = createContext(null)
export const PaletteControl = createContext(null)
export const WorkspaceControl = createContext(null)

/** Lives across route changes, resets on refresh, and never leaks between SSR requests. */
export default function PortfolioSession({ children }) {
  const completedRuns = useRef(new Set())
  const browsing = useState({ view: "list", category: "all" })
  const [appearance, setAppearance] = useState(readAppearance)
  const [paletteOpen, setPaletteOpen] = useState(false)

  // Persistent tmux workspace & shell state (survives route changes!)
  const [splitMode, setSplitMode] = useState("dock") // "dock" | "vertical" | "horizontal"
  const [splitRatio, setSplitRatio] = useState(0.62)
  const [zoomed, setZoomed] = useState(false)
  const [activePane, setActivePane] = useState("main") // "main" | "shell"
  const [shellEntries, setShellEntries] = useState([])
  const [shellHistory, setShellHistory] = useState([])
  const [shellCwd, setShellCwd] = useState("~")
  const [shellFocusTick, setShellFocusTick] = useState(0)
  const startedAt = useRef(Date.now())

  const theme = getTheme(appearance.theme)
  const resolvedSurface = appearance.surface === "auto" ? theme.surface : appearance.surface

  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.theme = appearance.theme
    root.dataset.accent = appearance.accent
    const styles = getComputedStyle(root)
    const bg = styles.getPropertyValue("--background").trim()
    const border = styles.getPropertyValue("--border").trim()
    const fg = styles.getPropertyValue("--foreground").trim()
    const primary = styles.getPropertyValue("--primary").trim()
    if (bg) document.querySelector('meta[name="theme-color"]')?.setAttribute("content", bg)
    if (bg && border && fg && primary) {
      const iconLink = document.querySelector('link[rel="icon"][type="image/svg+xml"]')
      if (iconLink) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="1" y="1" width="30" height="30" rx="5" fill="${bg}" stroke="${border}" stroke-width="1.5"/><path fill="${fg}" fill-rule="evenodd" d="M10.4 7h3.2L19.8 25h-3.4l-1.2-3.8H8.8L7.6 25H4.2L10.4 7Zm-.6 11.4h4.4L12 11.2l-2.2 7.2Z"/><rect x="21.5" y="20.5" width="6" height="4.5" rx="0.75" fill="${primary}"/></svg>`
        iconLink.setAttribute("href", `data:image/svg+xml,${encodeURIComponent(svg)}`)
      }
    }
    try {
      window.localStorage.setItem(APPEARANCE_KEY, JSON.stringify(appearance))
    } catch {
      // Appearance still works for this visit if storage is unavailable.
    }
  }, [appearance])

  const appearanceContext = useMemo(() => ({
    ...appearance,
    accents: theme.accents,
    defaultSurface: theme.surface,
    resolvedSurface,
    setTheme: (nextTheme) => setAppearance((previous) => normalizeAppearance({ ...previous, theme: nextTheme })),
    setAccent: (accent) => setAppearance((previous) => normalizeAppearance({ ...previous, accent })),
    setSurface: (surface) => setAppearance((previous) => normalizeAppearance({ ...previous, surface })),
    setAudio: (audio) => setAppearance((previous) => normalizeAppearance({ ...previous, audio })),
    toggleAudio: () => setAppearance((previous) => normalizeAppearance({ ...previous, audio: !previous.audio })),
  }), [appearance, theme, resolvedSurface])

  const openPalette = useCallback(() => setPaletteOpen(true), [])
  const closePalette = useCallback(() => setPaletteOpen(false), [])
  const togglePalette = useCallback(() => setPaletteOpen((value) => !value), [])

  const paletteContext = useMemo(() => ({
    isOpen: paletteOpen,
    open: openPalette,
    close: closePalette,
    toggle: togglePalette,
  }), [paletteOpen, openPalette, closePalette, togglePalette])

  const toggleSplit = useCallback((preferred) => {
    setZoomed(false)
    setSplitMode((current) => {
      if (preferred && preferred !== "toggle") return preferred
      return current === "dock" ? "vertical" : "dock"
    })
  }, [])

  const toggleZoom = useCallback(() => {
    setZoomed((z) => !z)
  }, [])

  const focusShell = useCallback(() => {
    setActivePane("shell")
    setShellFocusTick((t) => t + 1)
  }, [])

  const workspaceContext = useMemo(() => ({
    splitMode,
    setSplitMode,
    toggleSplit,
    splitRatio,
    setSplitRatio,
    zoomed,
    setZoomed,
    toggleZoom,
    activePane,
    setActivePane,
    shellEntries,
    setShellEntries,
    shellHistory,
    setShellHistory,
    shellCwd,
    setShellCwd,
    shellFocusTick,
    focusShell,
    startedAt: startedAt.current,
  }), [
    splitMode,
    toggleSplit,
    splitRatio,
    zoomed,
    toggleZoom,
    activePane,
    shellEntries,
    shellHistory,
    shellCwd,
    shellFocusTick,
    focusShell,
  ])

  return (
    <TerminalTheme value={appearanceContext}>
      <PaletteControl value={paletteContext}>
        <WorkspaceControl value={workspaceContext}>
          <PlaybackHistory value={completedRuns.current}>
            <ProjectBrowsing value={browsing}>{children}</ProjectBrowsing>
          </PlaybackHistory>
        </WorkspaceControl>
      </PaletteControl>
    </TerminalTheme>
  )
}
