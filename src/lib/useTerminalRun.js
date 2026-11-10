import { useContext, useEffect, useRef, useState } from "react"
import useReducedMotion from "./useReducedMotion.js"
import { PlaybackHistory } from "../components/PortfolioSession.jsx"
import { getRunTiming } from "./terminalPlayback.js"

/** Only the selected view mounts. A new visit replays its command once. */
export default function useTerminalRun(command, { enabled = true, immediate = false, visitKey = command } = {}) {
  const history = useContext(PlaybackHistory)
  const [replay] = useState(() => history?.has(visitKey) || false)
  const ref = useRef(null)
  const completedCommand = useRef(null)
  const reducedMotion = useReducedMotion()
  const [stage, setStage] = useState("waiting")
  const [inView, setInView] = useState(false)
  const [pageVisible, setPageVisible] = useState(true)
  const { start, type: duration, submit } = getRunTiming(command, replay)

  useEffect(() => {
    setStage("waiting")
    if (!enabled) {
      completedCommand.current = null
      return
    }
    if (reducedMotion || immediate || completedCommand.current === command) {
      completedCommand.current = command
      setStage("output")
      return
    }
    const startTimer = window.setTimeout(() => setStage("typing"), start)
    const outputTimer = window.setTimeout(
      () => {
        completedCommand.current = command
        if (ref.current?.isConnected && !ref.current.closest("[inert]")) history?.add(visitKey)
        setStage("output")
      },
      start + duration + submit,
    )
    return () => {
      window.clearTimeout(startTimer)
      window.clearTimeout(outputTimer)
    }
  }, [command, enabled, immediate, reducedMotion, start, duration, submit, history, visitKey])

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

  const finished = enabled && (immediate || reducedMotion || stage === "output")
  return {
    ref,
    inView: inView && pageVisible && !reducedMotion,
    finished,
    stage: !enabled ? "queued" : finished ? "output" : stage,
    style: {
      "--command-width": `${command.length}ch`,
      "--command-steps": command.length,
      "--type-duration": `${duration}ms`,
    },
  }
}
