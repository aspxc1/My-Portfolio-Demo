import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useLocation } from "react-router"
import { profile } from "../content/site.js"
import { formatCairoClock } from "../lib/terminalShell.js"
import { DEFAULT_THEME, getSessionTask } from "../lib/terminalTheme.js"
import useReducedMotion from "../lib/useReducedMotion.js"
import { PaletteControl, TerminalTheme } from "./PortfolioSession.jsx"
import CommandPalette from "./CommandPalette.jsx"
import TerminalStatusBar from "./TerminalStatusBar.jsx"
import TerminalStartup from "./TerminalStartup.jsx"
import TerminalStarfield from "./TerminalStarfield.jsx"
import "./SessionTransition.css"

const address = (location) => location.pathname + location.search + location.hash

export default function SessionTransition({ children }) {
  const requested = useLocation()
  const reducedMotion = useReducedMotion()
  const [starting, setStarting] = useState(() => typeof window !== "undefined" && !reducedMotion
    && requested.pathname === "/" && (!requested.hash || requested.hash === "#home"))
  const focusAfterStartup = useRef(false)
  const finishStartup = useCallback((restoreFocus = false) => {
    focusAfterStartup.current = restoreFocus
    setStarting(false)
  }, [])
  const theme = useContext(TerminalTheme)
  const palette = useContext(PaletteControl)
  const background = theme?.resolvedBackground || DEFAULT_THEME.background
  const [displayed, setDisplayed] = useState(requested)
  const [phase, setPhase] = useState("idle")
  const [cairoTime, setCairoTime] = useState("")
  const displayedRef = useRef(displayed)
  const screenRef = useRef(null)
  const firstRender = useRef(true)
  displayedRef.current = displayed

  const task = getSessionTask(displayed)

  useEffect(() => {
    setCairoTime(formatCairoClock())
    const timer = window.setInterval(() => setCairoTime(formatCairoClock()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    function onKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        palette?.toggle()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [palette])

  useEffect(() => {
    if (reducedMotion || requested.pathname !== "/" || (requested.hash && requested.hash !== "#home")) {
      setStarting(false)
    }
  }, [reducedMotion, requested])

  useLayoutEffect(() => {
    if (starting || !focusAfterStartup.current) return
    focusAfterStartup.current = false
    const target = screenRef.current?.querySelector("main")
    target?.setAttribute("tabindex", "-1")
    target?.focus({ preventScroll: true })
  }, [starting])

  useEffect(() => {
    if (address(requested) === address(displayedRef.current) || reducedMotion) {
      setDisplayed(requested)
      setPhase("idle")
      return
    }

    setPhase("leaving")
    const timer = window.setTimeout(() => {
      setDisplayed(requested)
      setPhase("entering")
    }, 140)
    return () => window.clearTimeout(timer)
  }, [requested, reducedMotion])

  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
    const heading = screenRef.current?.querySelector("h1, h2")
    const target = heading && getComputedStyle(heading).visibility !== "hidden"
      ? heading
      : screenRef.current?.querySelector("main")
    if (target) {
      target.setAttribute("tabindex", "-1")
      target.focus({ preventScroll: true })
    }
  }, [displayed])

  return (
    <div
      className="session"
      data-theme={theme?.theme || DEFAULT_THEME.id}
      data-bg={background}
    >
      {background === "starfield" ? <TerminalStarfield /> : null}
      <div className="session__window">
        <div className="session__topbar" aria-label="Terminal session bar">
          <div className="session__topbar-left">
            <span className="session__topbar-host">{`${profile.handle}@portfolio`}</span>
            <span aria-hidden="true" className="session__topbar-sep">/</span>
            <span className="session__topbar-cwd">{task.path}</span>
          </div>
          <div className="session__topbar-right">
            {cairoTime ? <span className="session__topbar-clock" title="Cairo local time">{`CAI ${cairoTime}`}</span> : null}
            {palette ? (
              <button
                type="button"
                className="session__topbar-palette"
                onClick={palette.open}
                aria-label="Open fuzzy command palette"
              >
                <span>fzf</span>
                <kbd className="tui-kbd">⌘K</kbd>
              </button>
            ) : null}
          </div>
        </div>

        <div
          ref={screenRef}
          className={`session__screen session__screen--${phase}`}
          inert={phase === "leaving"}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget && phase === "entering") setPhase("idle")
          }}
        >
          {starting && !reducedMotion
            ? <TerminalStartup onComplete={finishStartup} />
            : children(displayed)}
        </div>

        <TerminalStatusBar location={displayed} />
      </div>

      {palette ? <CommandPalette open={palette.isOpen} onClose={palette.close} /> : null}
    </div>
  )
}
