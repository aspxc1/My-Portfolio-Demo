import { useEffect, useRef, useState } from "react"
import useReducedMotion from "./useReducedMotion.js"

const TYPE_CHAR_MS = 42
const START_DELAY_MS = 100
const SUBMIT_DELAY_MS = 120

/** Only the selected view mounts. A new visit replays its command once. */
export default function useTerminalRun(command, { enabled = true } = {}) {
  const ref = useRef(null)
  const reducedMotion = useReducedMotion()
  const [stage, setStage] = useState("waiting")
  const [inView, setInView] = useState(false)
  const [pageVisible, setPageVisible] = useState(true)
  const duration = Math.min(command.length * TYPE_CHAR_MS, 700)

  useEffect(() => {
    setStage("waiting")
    if (!enabled) return
    if (reducedMotion) {
      setStage("output")
      return
    }
    const startTimer = window.setTimeout(() => setStage("typing"), START_DELAY_MS)
    const outputTimer = window.setTimeout(
      () => setStage("output"),
      START_DELAY_MS + duration + SUBMIT_DELAY_MS,
    )
    return () => {
      window.clearTimeout(startTimer)
      window.clearTimeout(outputTimer)
    }
  }, [command, enabled, reducedMotion, duration])

  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState !== "hidden")
    updateVisibility()
    document.addEventListener("visibilitychange", updateVisibility)
    if (typeof IntersectionObserver === "undefined") {
      setInView(true)
      return () => document.removeEventListener("visibilitychange", updateVisibility)
    }
    const observer = new IntersectionObserver((entries) => {
      setInView(entries[entries.length - 1].isIntersecting)
    })
    observer.observe(ref.current)
    return () => {
      observer.disconnect()
      document.removeEventListener("visibilitychange", updateVisibility)
    }
  }, [])

  const finished = enabled && (reducedMotion || stage === "output")
  return {
    ref,
    inView: inView && pageVisible && !reducedMotion,
    finished,
    stage: finished ? "output" : stage,
    style: {
      "--command-width": `${command.length}ch`,
      "--command-steps": command.length,
      "--type-duration": `${duration}ms`,
    },
  }
}
