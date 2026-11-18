import { useContext, useId, useLayoutEffect, useRef, useState } from "react"
import { profile } from "../content/site.js"
import { BACKGROUNDS, THEMES, getSessionTask } from "../lib/terminalTheme.js"
import { TerminalTheme } from "./PortfolioSession.jsx"
import "./TerminalStatusBar.css"

export default function TerminalStatusBar({ location }) {
  const appearance = useContext(TerminalTheme)
  const [open, setOpen] = useState(false)
  const footer = useRef(null)
  const panelId = useId()
  const task = getSessionTask(location)
  const defaultBackground = BACKGROUNDS.find((item) => item.id === appearance?.defaultBackground)?.label

  useLayoutEffect(() => {
    if (open) footer.current?.scrollIntoView({ block: "nearest", behavior: "instant" })
  }, [open])

  return (
    <footer ref={footer} aria-label="Terminal status bar" className="tmux-bar">
      <div className="tmux-bar__left" aria-hidden="true">
        <span className="tmux-bar__session">[0] {profile.handle}</span>
        <span className="tmux-bar__window">{`${task.index}:${task.name}*`}</span>
        <span className="tmux-bar__cwd">{task.path}</span>
      </div>

      <div className="tmux-bar__right">
        {appearance ? (
          <button
            type="button"
            className="tmux-bar__control"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true" className="tmux-bar__dot" />
            Appearance
          </button>
        ) : null}

        <span aria-hidden="true" className="tmux-bar__meta">utf-8</span>
      </div>
      {appearance ? (
        <div className="tmux-bar__settings" id={panelId} hidden={!open}>
          <label>
            Theme
            <select className="tmux-bar__control" value={appearance.theme} onChange={(event) => appearance.setTheme(event.target.value)}>
              {THEMES.map((theme) => <option key={theme.id} value={theme.id}>{theme.label}</option>)}
            </select>
          </label>
          <label>
            Accent
            <select className="tmux-bar__control" value={appearance.accent} onChange={(event) => appearance.setAccent(event.target.value)}>
              {appearance.accents.map((accent) => <option key={accent.id} value={accent.id}>{accent.label}</option>)}
            </select>
          </label>
          <label>
            Background
            <select className="tmux-bar__control" value={appearance.background} onChange={(event) => appearance.setBackground(event.target.value)}>
              <option value="auto">Theme default ({defaultBackground})</option>
              {BACKGROUNDS.map((background) => <option key={background.id} value={background.id}>{background.label}</option>)}
            </select>
          </label>
        </div>
      ) : null}
    </footer>
  )
}
