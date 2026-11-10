import useTerminalRun from "../lib/useTerminalRun.js"
import { useEffect } from "react"
import SectionHeading from "./SectionHeading.jsx"
import "./TerminalSection.css"

export default function TerminalSection({ section, roomy = false, onReady, onNavigate, children }) {
  const run = useTerminalRun(section.command)
  useEffect(() => {
    if (run.finished) onReady?.()
  }, [run.finished, onReady])

  return (
    <section
      ref={run.ref}
      aria-labelledby={`${section.id}-title`}
      id={section.id}
      className={`terminal-section terminal-run terminal-run--${run.stage}`}
      style={run.style}
    >
      <div className={`container section-inner${roomy ? " section-inner--roomy" : ""}`}>
        <SectionHeading path={section.path} command={section.command} id={`${section.id}-title`} onNavigate={onNavigate} />
        <div className="terminal-section__output" inert={!run.finished}>
          {children}
        </div>
      </div>
    </section>
  )
}
