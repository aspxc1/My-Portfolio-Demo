import { useEffect, useRef, useState } from "react"
import useReducedMotion from "./useReducedMotion.js"

const TYPE_CHAR_MS = 65
const START_DELAY_MS = 180
const SUBMIT_DELAY_MS = 220

/** Start only when visible; reset after the entire block leaves the viewport. */
export default function useTerminalRun(command) {
  const ref = useRef(null)
  const reducedMotion = useReducedMotion()
  const [stage, setStage] = useState("waiting")
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (reducedMotion || typeof IntersectionObserver === "undefined") {
      setStage("output")
      return
    }

    let startTimer
    let outputTimer
    let started = false
    const clear = () => {
      window.clearTimeout(startTimer)
      window.clearTimeout(outputTimer)
    }
    setStage("waiting")

    const observer = new IntersectionObserver((entries) => {
      const visible = entries[entries.length - 1].isIntersecting
      setInView(visible)
      if (!visible) {
        clear()
        started = false
        setStage("waiting")
      } else if (!started) {
        started = true
        startTimer = window.setTimeout(() => setStage("typing"), START_DELAY_MS)
        outputTimer = window.setTimeout(
          () => setStage("output"),
          START_DELAY_MS + command.length * TYPE_CHAR_MS + SUBMIT_DELAY_MS,
        )
      }
    }, { threshold: 0, rootMargin: "-56px 0px 0px 0px" })

    observer.observe(ref.current)
    return () => {
      clear()
      observer.disconnect()
    }
  }, [command, reducedMotion])

  const finished = reducedMotion || stage === "output"
  return {
    ref,
    inView,
    finished,
    stage: finished ? "output" : stage,
    style: {
      "--command-width": `${command.length}ch`,
      "--command-steps": command.length,
      "--type-duration": `${command.length * TYPE_CHAR_MS}ms`,
    },
  }
}
