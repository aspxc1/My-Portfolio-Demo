import { useContext, useId, useLayoutEffect, useRef, useState } from "react"
import { Link } from "react-router"
import { profile } from "../content/site.js"
import { BACKGROUNDS, THEMES, getSessionTask } from "../lib/terminalTheme.js"
import { TerminalTheme } from "./PortfolioSession.jsx"
import "./TerminalStatusBar.css"

const tmuxWindows = [
  { index: 0, label: "home", to: "/" },
  { index: 1, label: "about", to: "/#about" },
  { index: 2, label: "projects", to: "/#projects" },
  { index: 3, label: "experience", to: "/#activities" },
  { index: 4, label: "contact", to: "/#contact" },
]

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
      <div className="tmux-bar__left">
        <span className="tmux-bar__session" aria-hidden="true">[0] {profile.handle}</span>
        <nav aria-label="Tmux windows" className="tmux-bar__windows">
          {tmuxWindows.map((win) => {
            const isActive = win.index === task.index
            return (
              <Link
                key={win.index}
                to={win.to}
                className={isActive ? "tmux-bar__win tmux-bar__win--active" : "tmux-bar__win"}
                aria-current={isActive ? "page" : undefined}
              >
                {`${win.index}:${win.label}${isActive ? "*" : ""}`}
              </Link>
            )
          })}
        </nav>
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
            <span aria-hidden="true" className="tmux-bar__swatch-pair">
              <span className="tmux-bar__swatch-a" />
              <span className="tmux-bar__swatch-b" />
            </span>
            Appearance
          </button>
        ) : null}

        <span aria-hidden="true" className="tmux-bar__meta">utf-8</span>
      </div>

      {appearance ? (
        <div className="tmux-bar__settings" id={panelId} hidden={!open}>
          <div className="tmux-bar__theme-strip" role="group" aria-label="Quick theme presets">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                className="tmux-bar__theme-card"
                aria-pressed={appearance.theme === theme.id}
                onClick={() => appearance.setTheme(theme.id)}
              >
                <span className="tmux-bar__theme-preview" aria-hidden="true" style={{ background: theme.preview[0] }}>
                  {theme.preview.slice(1).map((color) => (
                    <span key={color} style={{ background: color }} />
                  ))}
                </span>
                <span className="tmux-bar__theme-name">{theme.label}</span>
              </button>
            ))}
          </div>

          <div className="tmux-bar__selects">
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
        </div>
      ) : null}
    </footer>
  )
}
