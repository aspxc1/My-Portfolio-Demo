import { useContext } from "react"
import { sections } from "../content/site.js"
import { WorkspaceControl } from "./PortfolioSession.jsx"
import TerminalMenu from "./TerminalMenu.jsx"
import TerminalShell from "./TerminalShell.jsx"
import "./SessionNavigation.css"

/**
 * Restores the two-pane ./menu.sh + interactive shell navigation directly below each section.
 * When a tmux vertical/horizontal split pane is open, TerminalShell promotes cleanly
 * into the resizable tmux split pane while keeping full persistent history & scrollback.
 */
export default function SessionNavigation({ current, enabled, request = 0 }) {
  const path = sections[current]?.path || "~"
  const workspace = useContext(WorkspaceControl)
  const splitOpen = workspace?.splitMode && workspace.splitMode !== "dock"

  return (
    <div className="container session-navigation">
      <div className={splitOpen ? "session-navigation__split session-navigation__split--single" : "session-navigation__split"}>
        <TerminalMenu key={current} current={current} enabled={enabled} request={request} />
        {!splitOpen ? (
          <TerminalShell
            path={workspace?.shellCwd || path}
            mode="dock"
            onActivate={() => workspace?.setActivePane("shell")}
          />
        ) : null}
      </div>
    </div>
  )
}
