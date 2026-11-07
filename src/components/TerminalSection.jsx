import { useEffect, useRef, useState } from "react"
import useReducedMotion from "../lib/useReducedMotion.js"
import SectionHeading from "./SectionHeading.jsx"
import "./TerminalSection.css"

const TYPE_CHAR_MS = 65
const START_DELAY_MS = 180
const SUBMIT_DELAY_MS = 220

/** Replay on each viewport entry; keep the output visible while reading. */
export default function TerminalSection({ section, roomy = false, children }) {
  const sectionRef = useRef(null)
  const reducedMotion = useReducedMotion()
  const [stage, setStage] = useState("waiting")
  const finished = reducedMotion || stage === "output"

  useEffect(() => {
    if (reducedMotion) {
      setStage("output")
      return
    }

    let startTimer
    let outputTimer
    let started = false
    const reset = () => {
      window.clearTimeout(startTimer)
      window.clearTimeout(outputTimer)
      started = false
      setStage("waiting")
    }
    const start = () => {
      if (started) return
      started = true
      startTimer = window.setTimeout(() => setStage("typing"), START_DELAY_MS)
      outputTimer = window.setTimeout(
        () => setStage("output"),
        START_DELAY_MS + section.command.length * TYPE_CHAR_MS + SUBMIT_DELAY_MS,
      )
    }

    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1]
        if (entry.isIntersecting) start()
        else reset()
      },
      // Observe the whole section so passing its heading doesn't hide its content.
      { threshold: 0, rootMargin: "-56px 0px 0px 0px" },
    )

    if (observer) observer.observe(sectionRef.current)
    else start()

    return () => {
      observer?.disconnect()
      window.clearTimeout(startTimer)
      window.clearTimeout(outputTimer)
    }
  }, [section.command, reducedMotion])

  return (
    <section
      ref={sectionRef}
      aria-labelledby={`${section.id}-title`}
      id={section.id}
      className={`section terminal-section terminal-section--${finished ? "output" : stage}`}
      style={{
        "--command-width": `${section.command.length}ch`,
        "--command-steps": section.command.length,
        "--type-duration": `${section.command.length * TYPE_CHAR_MS}ms`,
      }}
    >
      <div className={`container section-inner${roomy ? " section-inner--roomy" : ""}`}>
        <div>
          <SectionHeading path={section.path} command={section.command} id={`${section.id}-title`} />
        </div>
        <div className="terminal-section__output" inert={!finished}>
          {children}
        </div>
      </div>
    </section>
  )
}
