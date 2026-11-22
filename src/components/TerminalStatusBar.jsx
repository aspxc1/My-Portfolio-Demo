import { memo, useContext, useId, useLayoutEffect, useRef, useState } from "react"
import { Link } from "react-router"
import { profile } from "../content/site.js"
import { SURFACES, THEMES, getSessionTask } from "../lib/terminalTheme.js"
import { scrollElementInstant } from "../lib/scrollInstant.js"
import { TerminalTheme } from "./PortfolioSession.jsx"
import "./TerminalStatusBar.css"

const tmuxWindows = [
  { index: 0, label: "home", name: "Home", to: "/" },
  { index: 1, label: "about", name: "About", to: "/#about" },
  { index: 2, label: "projects", name: "Projects", to: "/#projects" },
  { index: 3, label: "experience", name: "Experience & clubs", to: "/#activities" },
  { index: 4, label: "contact", name: "Contact", to: "/#contact" },
]

function TerminalStatusBar({ location, prefixArmed = false }) {
  const appearance = useContext(TerminalTheme)
  const [open, setOpen] = useState(false)
  const footer = useRef(null)
  const panelId = useId()
  const task = getSessionTask(location)

  useLayoutEffect(() => {
    if (open) scrollElementInstant(footer.current, "nearest")
  }, [open])

  return (
    <footer ref={footer} aria-label="Terminal status bar" className="tmux-bar">
      <div className="tmux-bar__left">
        <span className={prefixArmed ? "tmux-bar__session tmux-bar__session--prefix" : "tmux-bar__session"} aria-hidden="true">
          {prefixArmed ? "PREFIX" : `[0] ${profile.handle}`}
        </span>
        <nav aria-label="Tmux windows" className="tmux-bar__windows">
          {tmuxWindows.map((win) => {
            const isActive = win.index === task.index
            return (
              <Link
                key={win.index}
                to={win.to}
                className={isActive ? "tmux-bar__win tmux-bar__win--active" : "tmux-bar__win"}
                aria-label={win.name}
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
            <span>{appearance.theme}</span>
          </button>
        ) : null}

        <span aria-hidden="true" className="tmux-bar__meta">^B % · utf-8</span>
      </div>

      {appearance ? (
        <div className="tmux-bar__settings" id={panelId} hidden={!open}>
          <div className="tmux-bar__theme-strip" role="group" aria-label="Theme presets">
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

          <div className="tmux-bar__toggles">
            <div className="tmux-bar__group" role="group" aria-label="Accent color">
              <span className="tmux-bar__group-label">accent</span>
              <div className="tmux-bar__chips">
                {appearance.accents.map((accent) => (
                  <button
                    key={accent.id}
                    type="button"
                    className="tmux-bar__chip"
                    aria-pressed={appearance.accent === accent.id}
                    onClick={() => appearance.setAccent(accent.id)}
                  >
                    <span
                      aria-hidden="true"
                      className="tmux-bar__chip-swatch"
                      style={{ background: `var(--accent-${accent.id})` }}
                    />
                    {accent.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="tmux-bar__group" role="group" aria-label="Display surface">
              <span className="tmux-bar__group-label">surface</span>
              <div className="tmux-bar__chips">
                {SURFACES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="tmux-bar__chip"
                    aria-pressed={appearance.surface === item.id}
                    onClick={() => appearance.setSurface(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="tmux-bar__group" role="group" aria-label="Terminal audio">
              <span className="tmux-bar__group-label">bell</span>
              <div className="tmux-bar__chips">
                <button
                  type="button"
                  className="tmux-bar__chip"
                  aria-pressed={!appearance.audio}
                  onClick={() => appearance.setAudio(false)}
                >
                  off
                </button>
                <button
                  type="button"
                  className="tmux-bar__chip"
                  aria-pressed={appearance.audio}
                  onClick={() => appearance.setAudio(true)}
                >
                  on
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </footer>
  )
}

export default memo(TerminalStatusBar)
