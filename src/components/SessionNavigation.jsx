import { useContext } from "react"
import { sections } from "../content/site.js"
import { PaletteControl } from "./PortfolioSession.jsx"
import TerminalMenu from "./TerminalMenu.jsx"
import TerminalShell from "./TerminalShell.jsx"
import "./SessionNavigation.css"

export default function SessionNavigation({ current, enabled, request = 0 }) {
  const path = sections[current]?.path || "~"
  const palette = useContext(PaletteControl)

  return (
    <div className="container session-navigation">
      <div className="session-navigation__split">
        <TerminalMenu key={current} current={current} enabled={enabled} request={request} />
        <TerminalShell path={path} onOpenPalette={palette?.open} />
      </div>
    </div>
  )
}
