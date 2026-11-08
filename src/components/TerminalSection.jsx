import useTerminalRun from "../lib/useTerminalRun.js"
import SectionHeading from "./SectionHeading.jsx"
import "./TerminalSection.css"

export default function TerminalSection({ section, roomy = false, children }) {
  const run = useTerminalRun(section.command)

  return (
    <section
      ref={run.ref}
      aria-labelledby={`${section.id}-title`}
      id={section.id}
      className={`section terminal-section terminal-run terminal-run--${run.stage}`}
      style={run.style}
    >
      <div className={`container section-inner${roomy ? " section-inner--roomy" : ""}`}>
        <SectionHeading path={section.path} command={section.command} id={`${section.id}-title`} />
        <div className="terminal-section__output" inert={!run.finished}>
          {children}
        </div>
      </div>
    </section>
  )
}
