import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useLocation } from "react-router"
import { DEFAULT_THEME } from "../lib/terminalTheme.js"
import useReducedMotion from "../lib/useReducedMotion.js"
import { TerminalTheme } from "./PortfolioSession.jsx"
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
  const background = theme?.resolvedBackground || DEFAULT_THEME.background
  const [displayed, setDisplayed] = useState(requested)
  const [phase, setPhase] = useState("idle")
  const displayedRef = useRef(displayed)
  const screenRef = useRef(null)
  const firstRender = useRef(true)
  displayedRef.current = displayed

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
    </div>
  )
}
