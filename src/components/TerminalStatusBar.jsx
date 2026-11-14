import { useContext } from "react"
import { profile } from "../content/site.js"
import { ACCENTS, BACKGROUNDS, DEFAULT_BACKGROUND, getSessionTask } from "../lib/terminalTheme.js"
import { TerminalTheme } from "./PortfolioSession.jsx"
import "./TerminalStatusBar.css"

export default function TerminalStatusBar({ location }) {
  const themeContext = useContext(TerminalTheme)
  const accent = themeContext?.accent || "mauve"
  const background = themeContext?.background || DEFAULT_BACKGROUND
  const task = getSessionTask(location)
  const currentAccent = ACCENTS.find((item) => item.id === accent) || ACCENTS[0]
  const currentBg = BACKGROUNDS.find((item) => item.id === background) || BACKGROUNDS[0]

  return (
    <footer aria-label="Terminal status bar" className="tmux-bar">
      <div className="tmux-bar__left" aria-hidden="true">
        <span className="tmux-bar__session">[0] {profile.handle}</span>
        <span className="tmux-bar__window">{`${task.index}:${task.name}*`}</span>
        <span className="tmux-bar__cwd">{task.path}</span>
      </div>

      <div className="tmux-bar__right">
        {themeContext ? (
          <>
            <button
              type="button"
              className="tmux-bar__control"
              onClick={themeContext.cycleBackground}
              aria-label={`Background style: ${currentBg.label}. Activate to switch background`}
              title="Switch background texture"
            >
              <span className="tmux-bar__key">bg:</span>
              <span className="tmux-bar__val">{currentBg.label}</span>
            </button>

            <button
              type="button"
              className="tmux-bar__control"
              onClick={themeContext.cycleAccent}
              aria-label={`Terminal accent: ${currentAccent.label}. Activate to switch accent color`}
              title="Switch terminal accent color"
            >
              <span aria-hidden="true" className="tmux-bar__dot" />
              <span className="tmux-bar__key">accent:</span>
              <span className="tmux-bar__val">{currentAccent.label}</span>
            </button>
          </>
        ) : null}

        <span aria-hidden="true" className="tmux-bar__meta">utf-8</span>
      </div>
    </footer>
  )
}
