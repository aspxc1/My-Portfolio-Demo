import { createContext, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react"
import { APPEARANCE_KEY, getTheme, normalizeAppearance, readAppearance } from "../lib/terminalTheme.js"

export const PlaybackHistory = createContext(null)
export const ProjectBrowsing = createContext(null)
export const TerminalTheme = createContext(null)
export const PaletteControl = createContext(null)

/** Lives across route changes, but resets on refresh and never leaks between SSR requests. */
export default function PortfolioSession({ children }) {
  const completedRuns = useRef(new Set())
  const browsing = useState({ view: "list", category: "all" })
  const [appearance, setAppearance] = useState(readAppearance)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const theme = getTheme(appearance.theme)
  const background = appearance.background === "auto" ? theme.background : appearance.background

  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.theme = appearance.theme
    root.dataset.accent = appearance.accent
    const themeColor = getComputedStyle(root).getPropertyValue("--background").trim()
    if (themeColor) document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor)
    try {
      window.localStorage.setItem(APPEARANCE_KEY, JSON.stringify(appearance))
    } catch {
      // Appearance still works for this visit if storage is unavailable.
    }
  }, [appearance])

  const appearanceContext = useMemo(() => ({
    ...appearance,
    accents: theme.accents,
    defaultBackground: theme.background,
    resolvedBackground: background,
    setTheme: (theme) => setAppearance((previous) => normalizeAppearance({ ...previous, theme })),
    setAccent: (accent) => setAppearance((previous) => normalizeAppearance({ ...previous, accent })),
    setBackground: (background) => setAppearance((previous) => normalizeAppearance({ ...previous, background })),
  }), [appearance, theme, background])

  const openPalette = useCallback(() => setPaletteOpen(true), [])
  const closePalette = useCallback(() => setPaletteOpen(false), [])
  const togglePalette = useCallback(() => setPaletteOpen((value) => !value), [])

  const paletteContext = useMemo(() => ({
    isOpen: paletteOpen,
    open: openPalette,
    close: closePalette,
    toggle: togglePalette,
  }), [paletteOpen, openPalette, closePalette, togglePalette])

  return (
    <TerminalTheme value={appearanceContext}>
      <PaletteControl value={paletteContext}>
        <PlaybackHistory value={completedRuns.current}>
          <ProjectBrowsing value={browsing}>{children}</ProjectBrowsing>
        </PlaybackHistory>
      </PaletteControl>
    </TerminalTheme>
  )
}
