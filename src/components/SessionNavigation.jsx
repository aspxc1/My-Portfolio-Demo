import { profile, sections } from "../content/site.js"
import TerminalMenu from "./TerminalMenu.jsx"
import "./SessionNavigation.css"

export default function SessionNavigation({ current }) {
  const path = sections[current]?.path || "~"
  return (
    <div className="container session-navigation">
      <p className="session-navigation__prompt" aria-hidden="true">
        <span>{profile.handle}@portfolio</span>
        <span className="session-navigation__path">:{path}$ </span>
        <span className="terminal-cursor session-navigation__caret" />
      </p>
      {current !== "home" ? <TerminalMenu key={current} current={current} /> : null}
    </div>
  )
}
