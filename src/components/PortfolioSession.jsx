import { createContext, useRef } from "react"

export const PlaybackHistory = createContext(null)

/** Lives across route changes, but resets on refresh and never leaks between SSR requests. */
export default function PortfolioSession({ children }) {
  const completedRuns = useRef(new Set())
  return <PlaybackHistory value={completedRuns.current}>{children}</PlaybackHistory>
}
