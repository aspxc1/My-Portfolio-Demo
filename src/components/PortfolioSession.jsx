import { createContext, useRef, useState } from "react"

export const PlaybackHistory = createContext(null)
export const ProjectBrowsing = createContext(null)

/** Lives across route changes, but resets on refresh and never leaks between SSR requests. */
export default function PortfolioSession({ children }) {
  const completedRuns = useRef(new Set())
  const browsing = useState({ view: "list", category: "all" })
  return (
    <PlaybackHistory value={completedRuns.current}>
      <ProjectBrowsing value={browsing}>{children}</ProjectBrowsing>
    </PlaybackHistory>
  )
}
