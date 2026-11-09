import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useLocation } from "react-router"
import useReducedMotion from "../lib/useReducedMotion.js"
import "./SessionTransition.css"

const address = (location) => location.pathname + location.search + location.hash

export default function SessionTransition({ children }) {
  const requested = useLocation()
  const reducedMotion = useReducedMotion()
  const [displayed, setDisplayed] = useState(requested)
  const [phase, setPhase] = useState("idle")
  const displayedRef = useRef(displayed)
  const screenRef = useRef(null)
  const firstRender = useRef(true)
  displayedRef.current = displayed

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
    if (heading) {
      heading.setAttribute("tabindex", "-1")
      heading.focus({ preventScroll: true })
    }
  }, [displayed])

  return (
    <div className="session">
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
    </div>
  )
}
