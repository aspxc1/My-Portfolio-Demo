import { useEffect, useRef, useState } from "react"
import { contact, profile, sections } from "../content/site.js"
import TerminalSection from "./TerminalSection.jsx"
import "./Contact.css"

const section = sections.contact

/** Every endpoint comes from the shared profile links. */
const replies = [
  { via: "email", label: profile.email, href: `mailto:${profile.email}`, external: false },
  ...profile.links.map((link) => ({
    via: link.label.replace(/\.[a-z]+$/, ""),
    label: link.kind === "file" ? link.label : link.href.replace(/^https?:\/\/(www\.)?/, ""),
    href: link.href,
    external: true,
  })),
]

export default function Contact({ onReady, onNavigate }) {
  const [copyStatus, setCopyStatus] = useState("")
  const copyTimer = useRef(null)

  useEffect(() => () => window.clearTimeout(copyTimer.current), [])

  async function copyEmail() {
    window.clearTimeout(copyTimer.current)
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopyStatus("Email copied.")
    } catch {
      setCopyStatus("Copy unavailable. Use the email link below.")
    }
    copyTimer.current = window.setTimeout(() => setCopyStatus(""), 3000)
  }

  return (
    <TerminalSection section={section} onReady={onReady} onNavigate={onNavigate}>
      <div className="contact__columns">
        <div className="contact__intro">
          <p className="contact__blurb">{contact.blurb}</p>
          <button type="button" className="contact__copy" onClick={copyEmail}>
            <span aria-hidden="true">{"[+] "}</span>copy email
          </button>
          <p role="status" className="contact__copy-status">{copyStatus}</p>
        </div>

        <div className="contact__terminal">
          <p>{`PING ${profile.handle}: ${replies.length} endpoints`}</p>
          <ul className="contact__replies">
            {replies.map((reply, i) => (
              <li key={reply.via}>
                <a
                  href={reply.href}
                  className="contact__reply"
                  target={reply.external ? "_blank" : undefined}
                  rel={reply.external ? "noreferrer" : undefined}
                >
                  <span className="contact__reply-meta">
                    <span><span aria-hidden="true">{`[${i}] `}</span>{reply.via}</span>
                    <span aria-hidden="true" className="contact__timing">{`${(0.4 + i * 0.3).toFixed(1)}ms`}</span>
                  </span>
                  <span className="text-link contact__address">{reply.label}</span>
                  {reply.external ? <span className="sr-only"> (opens in new tab)</span> : null}
                </a>
              </li>
            ))}
          </ul>
          <p className="contact__summary">
            {`${replies.length} transmitted / ${replies.length} received / `}
            <span className="contact__accent">0% packet loss</span>
          </p>
        </div>
      </div>
    </TerminalSection>
  )
}
