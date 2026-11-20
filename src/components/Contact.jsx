import { useEffect, useRef, useState } from "react"
import { contact, profile, sections } from "../content/site.js"
import { formatCairoClock } from "../lib/terminalShell.js"
import TerminalSection from "./TerminalSection.jsx"
import ContactIcon from "./ContactIcon.jsx"
import "./Contact.css"

const section = sections.contact

function displayHost(href, icon) {
  if (icon === "email") return profile.email
  if (href.startsWith("/")) return `~${href}`
  return href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")
}

/** Every endpoint comes from the shared profile links. */
const replies = [
  { icon: "email", label: "Email", host: displayHost(`mailto:${profile.email}`, "email"), status: "DIRECT", href: `mailto:${profile.email}`, external: false },
  ...profile.links.map((link) => ({
    icon: link.icon,
    label: link.label,
    host: displayHost(link.href, link.icon),
    status: link.kind === "file" ? "LOCAL" : "READY",
    href: link.href,
    external: true,
  })),
]

export default function Contact({ onReady, onNavigate }) {
  const [copyStatus, setCopyStatus] = useState("")
  const [cairoClock, setCairoClock] = useState("")
  const [probing, setProbing] = useState(false)
  const [probedCount, setProbedCount] = useState(replies.length)
  const copyTimer = useRef(null)
  const probeTimers = useRef([])

  useEffect(() => {
    setCairoClock(formatCairoClock())
    const clock = window.setInterval(() => setCairoClock(formatCairoClock()), 30000)
    return () => {
      window.clearInterval(clock)
      window.clearTimeout(copyTimer.current)
      probeTimers.current.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  async function copyEmail() {
    window.clearTimeout(copyTimer.current)
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopyStatus(`✓ copied ${profile.email}`)
    } catch {
      setCopyStatus("Copy unavailable — use the email link directly.")
    }
    copyTimer.current = window.setTimeout(() => setCopyStatus(""), 3200)
  }

  function runPing() {
    probeTimers.current.forEach((id) => window.clearTimeout(id))
    probeTimers.current = []
    setProbing(true)
    setProbedCount(0)
    replies.forEach((_, idx) => {
      const id = window.setTimeout(() => {
        setProbedCount(idx + 1)
        if (idx === replies.length - 1) setProbing(false)
      }, 120 * (idx + 1))
      probeTimers.current.push(id)
    })
  }

  return (
    <TerminalSection section={section} onReady={onReady} onNavigate={onNavigate}>
      <div className="contact__columns">
        <div className="contact__intro">
          <p className="contact__availability">
            <span aria-hidden="true" className="contact__dot">●</span>
            <span>{`${profile.location}${cairoClock ? ` · ${cairoClock} EET` : ""}`}</span>
          </p>
          <p className="contact__blurb">{contact.blurb}</p>

          <div className="contact__actions">
            <button type="button" className="contact__copy" onClick={copyEmail}>
              <span aria-hidden="true" className="contact__prompt-sign">$ </span>
              pbcopy &lt; email
            </button>
            <span className="contact__email-display">{profile.email}</span>
          </div>
          <p role="status" className="contact__copy-status">{copyStatus}</p>
        </div>

        <div className="contact__terminal">
          <div className="contact__terminal-head">
            <p>{`PING ${profile.handle} (${replies.length} endpoints)`}</p>
            <button type="button" className="contact__reping" onClick={runPing} disabled={probing}>
              {probing ? "probing…" : "re-ping"}
            </button>
          </div>
          <ul className="contact__replies">
            {replies.map((reply, index) => {
              const reached = index < probedCount
              return (
                <li key={reply.href}>
                  <a
                    href={reply.href}
                    className="contact__reply"
                    target={reply.external ? "_blank" : undefined}
                    rel={reply.external ? "noreferrer" : undefined}
                  >
                    <ContactIcon name={reply.icon} />
                    <span className="contact__reply-main">
                      <span className="contact__reply-label">{reply.label}</span>
                      <span className="contact__reply-host">{reply.host}</span>
                    </span>
                    <span className={reached ? "contact__status contact__status--ok" : "contact__status"}>
                      {reached ? reply.status : "···"}
                    </span>
                    <span aria-hidden="true" className="contact__arrow">↗</span>
                    {reply.external ? <span className="sr-only"> (opens in new tab)</span> : null}
                  </a>
                </li>
              )
            })}
          </ul>
          <p className="contact__summary">
            {`${probedCount}/${replies.length} endpoints reachable · `}
            <span className="contact__accent">{probing ? "probing" : "0% packet loss"}</span>
          </p>
        </div>
      </div>
    </TerminalSection>
  )
}
