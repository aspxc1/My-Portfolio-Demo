import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useLocation } from "react-router"
import { profile } from "../content/site.js"
import { DEFAULT_BACKGROUND, getSessionTask } from "../lib/terminalTheme.js"
import useReducedMotion from "../lib/useReducedMotion.js"
import { TerminalTheme } from "./PortfolioSession.jsx"
import TerminalStatusBar from "./TerminalStatusBar.jsx"
import "./SessionTransition.css"

const address = (location) => location.pathname + location.search + location.hash

export default function SessionTransition({ children }) {
  const requested = useLocation()
  const reducedMotion = useReducedMotion()
  const theme = useContext(TerminalTheme)
  const [displayed, setDisplayed] = useState(requested)
  const [phase, setPhase] = useState("idle")
  const displayedRef = useRef(displayed)
  const screenRef = useRef(null)
  const firstRender = useRef(true)
  displayedRef.current = displayed
  const task = getSessionTask(displayed)

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
      data-accent={theme?.accent || "mauve"}
      data-bg={theme?.background || DEFAULT_BACKGROUND}
    >
      <div className="session__window">
        <div aria-hidden="true" className="session__chrome">
          <div className="session__dots">
            <span className="session__dot session__dot--close" />
            <span className="session__dot session__dot--minimize" />
            <span className="session__dot session__dot--expand" />
          </div>
          <span className="session__title">{`${profile.handle}@portfolio — zsh`}</span>
          <span className="session__cwd">{task.path}</span>
        </div>

        <div
          ref={screenRef}
          className={`session__screen session__screen--${phase}`}
          inert={phase === "leaving"}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget && phase === "entering") setPhase("idle")
          }}
        >
          {children(displayed)}
        </div>

        <TerminalStatusBar location={displayed} />
      </div>
    </div>
  )
}
