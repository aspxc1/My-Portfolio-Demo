import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ACCENTS, BACKGROUNDS } from "../lib/terminalTheme.js"

export const PlaybackHistory = createContext(null)
export const ProjectBrowsing = createContext(null)
export const TerminalTheme = createContext(null)

/** Lives across route changes, but resets on refresh and never leaks between SSR requests. */
export default function PortfolioSession({ children }) {
  const completedRuns = useRef(new Set())
  const browsing = useState({ view: "list", category: "all" })
  const [accent, setAccent] = useState("mauve")
  const [background, setBackground] = useState("grid")

  const cycleAccent = useCallback(() => {
    setAccent((current) => {
      const index = ACCENTS.findIndex((item) => item.id === current)
      return ACCENTS[(index + 1) % ACCENTS.length].id
    })
  }, [])

  const cycleBackground = useCallback(() => {
    setBackground((current) => {
      const index = BACKGROUNDS.findIndex((item) => item.id === current)
      return BACKGROUNDS[(index + 1) % BACKGROUNDS.length].id
    })
  }, [])

  useEffect(() => {
    document.documentElement.dataset.accent = accent
    document.documentElement.dataset.bg = background
  }, [accent, background])

  const theme = useMemo(
    () => ({ accent, setAccent, cycleAccent, background, setBackground, cycleBackground }),
    [accent, background, cycleAccent, cycleBackground],
  )

  return (
    <TerminalTheme value={theme}>
      <PlaybackHistory value={completedRuns.current}>
        <ProjectBrowsing value={browsing}>{children}</ProjectBrowsing>
      </PlaybackHistory>
    </TerminalTheme>
  )
}
