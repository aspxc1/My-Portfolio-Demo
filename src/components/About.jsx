import { useCallback, useEffect, useRef, useState } from "react"
import { profile, sections, stack } from "../content/site.js"
import useTerminalRun from "../lib/useTerminalRun.js"
import GitHubMonitor from "./GitHubMonitor.jsx"
import SectionHeading from "./SectionHeading.jsx"
import TerminalCommand from "./TerminalCommand.jsx"
import "./About.css"

const section = sections.about
const stackCommand = "tree ~/stack"
const monitorCommand = "htop"

function AboutCommand({ command, run, children }) {
  return (
    <div ref={run.ref} className={`about__run terminal-run terminal-run--${run.stage}`} style={run.style}>
      <p className="about__command"><TerminalCommand command={command} /></p>
      <div className="about__output" inert={!run.finished}>{children}</div>
    </div>
  )
}

export default function About() {
  const [skipped, setSkipped] = useState(false)
  const skipButton = useRef(null)
  const heading = useTerminalRun(section.command, { immediate: skipped })
  const listing = useTerminalRun(stackCommand, { enabled: heading.finished, immediate: skipped })
  const monitor = useTerminalRun(monitorCommand, { enabled: listing.finished, immediate: skipped })

  const skipPlayback = useCallback(() => {
    if (document.activeElement === skipButton.current) {
      const title = heading.ref.current.querySelector("h1")
      title.tabIndex = -1
      title.focus({ preventScroll: true })
    }
    setSkipped(true)
  }, [heading.ref])

  useEffect(() => {
    if (monitor.finished) return
    function onKeyDown(event) {
      if (event.key === "Escape" && !event.defaultPrevented && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey
        && !heading.ref.current?.closest("[inert]")) {
        event.preventDefault()
        skipPlayback()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [heading.ref, monitor.finished, skipPlayback])

  return (
    <section id={section.id} className="terminal-section" aria-labelledby={`${section.id}-title`}>
      <div className="container section-inner section-inner--roomy">
        <div ref={heading.ref} className={`terminal-run terminal-run--${heading.stage}`} style={heading.style}>
          <SectionHeading path={section.path} command={section.command} id={`${section.id}-title`} />
          <p className="about__whoami">
            <span className="about__whoami-handle">{profile.handle}</span>
            <span aria-hidden="true" className="about__whoami-sep"> — </span>
            {`${profile.role} at ${profile.school} (${profile.location}). Focused on Backend SWE and Applied AI/ML.`}
          </p>
        </div>

        <AboutCommand command={stackCommand} run={listing}>
          <section className="about__stack tui-frame" aria-label="Tech stack">
            <span className="tui-frame__legend" aria-hidden="true">~/stack</span>
            <div className="about__stack-grid">
              {stack.filter(({ hidden }) => !hidden).map(({ group, items }) => (
                <div className="about__stack-group" data-group={group} key={group}>
                  <h2>{group}</h2>
                  <ul role="list">
                    {items.map((item) => (
                      <li key={item}>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </AboutCommand>

        <AboutCommand command={monitorCommand} run={monitor}>
          <GitHubMonitor enabled={monitor.finished} />
        </AboutCommand>

        {!monitor.finished ? (
          <button ref={skipButton} type="button" className="about__skip text-link" onClick={skipPlayback}>
            Skip animation
          </button>
        ) : null}
      </div>
    </section>
  )
}
