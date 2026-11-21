import { useEffect, useRef, useState } from "react"
import { contact, profile, sections } from "../content/site.js"
import TerminalSection from "./TerminalSection.jsx"
import ContactIcon from "./ContactIcon.jsx"
import "./Contact.css"

const section = sections.contact

const baseReplies = [
  {
    label: "Email",
    icon: "email",
    host: profile.email,
    href: `mailto:${profile.email}`,
    status: "DIRECT",
    external: false,
    localFile: false,
  },
  ...profile.links.map((link) => ({
    label: link.label,
    icon: link.icon,
    host: link.kind === "file" ? `~${link.href}` : link.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
    href: link.href,
    status: link.kind === "file" ? "LOCAL" : "READY",
    external: link.kind !== "file",
    localFile: link.kind === "file",
  })),
]

function getCairoClock() {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Cairo",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short",
    }).formatToParts(new Date())
    const hh = parts.find((p) => p.type === "hour")?.value || ""
    const mm = parts.find((p) => p.type === "minute")?.value || ""
    const tz = parts.find((p) => p.type === "timeZoneName")?.value || ""
    return hh && mm ? `${hh}:${mm}${tz ? ` ${tz}` : ""}` : ""
  } catch {
    return ""
  }
}

export default function Contact({ onReady, onNavigate }) {
  const [copyStatus, setCopyStatus] = useState("")
  const [cairoClock, setCairoClock] = useState("")
  const [localAvailability, setLocalAvailability] = useState({})
  const [probing, setProbing] = useState(false)
  const [probedCount, setProbedCount] = useState(baseReplies.length)
  const [composeOpen, setComposeOpen] = useState(false)
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [composeNote, setComposeNote] = useState("")
  const probeTimers = useRef([])

  useEffect(() => {
    setCairoClock(getCairoClock())
    const timer = window.setInterval(() => setCairoClock(getCairoClock()), 30000)
    return () => {
      window.clearInterval(timer)
      probeTimers.current.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  // Honestly verify local static file endpoints (e.g. /resume.pdf) so we never report false green on a 404/SPA fallback.
  useEffect(() => {
    let active = true
    const localLinks = baseReplies.filter((r) => r.localFile && r.href.startsWith("/"))
    for (const item of localLinks) {
      fetch(item.href, { method: "HEAD" })
        .then((res) => {
          const contentType = res.headers.get("content-type") || ""
          const isRealFile = res.ok && !contentType.includes("text/html")
          if (active) setLocalAvailability((prev) => ({ ...prev, [item.href]: isRealFile ? "ok" : "missing" }))
        })
        .catch(() => {
          if (active) setLocalAvailability((prev) => ({ ...prev, [item.href]: "missing" }))
        })
    }
    return () => { active = false }
  }, [])

  function runPing() {
    probeTimers.current.forEach((id) => window.clearTimeout(id))
    probeTimers.current = []
    setProbing(true)
    setProbedCount(0)
    baseReplies.forEach((_, idx) => {
      const id = window.setTimeout(() => {
        setProbedCount(idx + 1)
        if (idx === baseReplies.length - 1) setProbing(false)
      }, 120 * (idx + 1))
      probeTimers.current.push(id)
    })
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopyStatus(`Copied ${profile.email}`)
    } catch {
      setCopyStatus(`Email: ${profile.email}`)
    }
    window.setTimeout(() => setCopyStatus(""), 2500)
  }

  function handleComposeSend(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (subject.trim()) params.set("subject", subject.trim())
    if (body.trim()) params.set("body", body.trim())
    const qs = params.toString()
    window.location.href = `mailto:${profile.email}${qs ? `?${qs}` : ""}`
    setComposeNote("Opened default mail client with your draft.")
  }

  async function copyDraft() {
    const draft = `To: ${profile.email}\nSubject: ${subject.trim() || "(no subject)"}\n\n${body.trim()}`
    try {
      await navigator.clipboard.writeText(draft)
      setComposeNote("Draft copied to clipboard.")
    } catch {
      setComposeNote("Could not access clipboard.")
    }
    window.setTimeout(() => setComposeNote(""), 2500)
  }

  const reachableCount = baseReplies.filter((r, idx) => idx < probedCount && (!r.localFile || localAvailability[r.href] !== "missing")).length

  return (
    <TerminalSection section={section} roomy onReady={onReady} onNavigate={onNavigate}>
      <div className="contact__columns">
        <div className="contact__intro">
          <p className="contact__availability">
            {`${profile.location}${cairoClock ? ` · ${cairoClock}` : ""}`}
          </p>
          <p className="contact__blurb">{contact.blurb}</p>

          <div className="contact__actions">
            <button type="button" className="contact__btn" onClick={copyEmail}>
              <span aria-hidden="true" className="contact__prompt-sign">% </span>
              wl-copy &lt; email
            </button>
            <button
              type="button"
              className="contact__btn contact__btn--ghost"
              aria-expanded={composeOpen}
              onClick={() => setComposeOpen((v) => !v)}
            >
              <span aria-hidden="true" className="contact__prompt-sign">% </span>
              {composeOpen ? "close mail" : `mail ${profile.handle}`}
            </button>
          </div>
          <p className="contact__email-display">{profile.email}</p>
          <p role="status" className="contact__copy-status">{copyStatus}</p>

          {composeOpen ? (
            <form className="contact__compose tui-frame" onSubmit={handleComposeSend}>
              <span className="tui-frame__legend" aria-hidden="true">{`mail · ${profile.email}`}</span>
              <label className="contact__field">
                <span>Subject:</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Internship / collaboration / hello"
                />
              </label>
              <label className="contact__field">
                <span>Body:</span>
                <textarea
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write a quick note..."
                />
              </label>
              <div className="contact__compose-actions">
                <button type="submit" className="contact__btn contact__btn--primary">open in mail client →</button>
                <button type="button" className="contact__btn contact__btn--ghost" onClick={copyDraft}>copy draft</button>
              </div>
              {composeNote ? <p role="status" className="contact__copy-status">{composeNote}</p> : null}
            </form>
          ) : null}
        </div>

        <div className="contact__terminal tui-frame">
          <span className="tui-frame__legend" aria-hidden="true">
            {`mtr · ${profile.handle}`}
          </span>
          <button
            type="button"
            className="tui-frame__legend-right contact__reping"
            onClick={runPing}
            disabled={probing}
          >
            {probing ? "probing…" : "re-ping"}
          </button>

          <div className="contact__table-head" aria-hidden="true">
            <span>endpoint</span>
            <span>target</span>
            <span>status</span>
          </div>

          <ul className="contact__replies">
            {baseReplies.map((reply, index) => {
              const reached = index < probedCount
              const isMissing = reply.localFile && localAvailability[reply.href] === "missing"
              const statusText = !reached ? "···" : isMissing ? "404 · PENDING" : reply.status

              return (
                <li key={reply.href}>
                  {isMissing ? (
                    <div className="contact__reply contact__reply--muted" title="File not uploaded yet — request via email">
                      <span className="contact__reply-id">
                        <ContactIcon name={reply.icon} />
                        <span className="contact__reply-label">{reply.label}</span>
                      </span>
                      <span className="contact__reply-host">{`${reply.host} (request via email)`}</span>
                      <span className={reached ? "contact__status contact__status--warn" : "contact__status"}>{statusText}</span>
                    </div>
                  ) : (
                    <a
                      href={reply.href}
                      className="contact__reply"
                      target={reply.external ? "_blank" : undefined}
                      rel={reply.external ? "noreferrer" : undefined}
                    >
                      <span className="contact__reply-id">
                        <ContactIcon name={reply.icon} />
                        <span className="contact__reply-label">{reply.label}</span>
                      </span>
                      <span className="contact__reply-host">{reply.host}</span>
                      <span className={reached ? "contact__status contact__status--ok" : "contact__status"}>
                        {reached ? `${statusText} ↗` : statusText}
                      </span>
                      {reply.external ? <span className="sr-only"> (opens in new tab)</span> : null}
                    </a>
                  )}
                </li>
              )
            })}
          </ul>

          <p className="contact__summary">
            {`${reachableCount}/${baseReplies.length} endpoints verified${probing ? " · probing" : ""}`}
          </p>
        </div>
      </div>
    </TerminalSection>
  )
}
