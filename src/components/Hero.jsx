import { Ascii } from "ascii.rest/react"
import * as synthwave from "ascii.rest/pieces/synthwave"
import { useEffect } from "react"
import useTerminalRun from "../lib/useTerminalRun.js"
import { hero, profile } from "../content/site.js"
import TerminalCommand from "./TerminalCommand.jsx"
import NavigationJump from "./NavigationJump.jsx"
import ContactIcon from "./ContactIcon.jsx"
import "./Hero.css"

const swatchColors = ["var(--foreground)", "var(--primary)", "var(--muted-foreground)", "var(--card)"]
const contacts = [{ label: "Email", icon: "email", href: `mailto:${profile.email}` }, ...profile.links]

export default function Hero({ onReady, onNavigate }) {
  const run = useTerminalRun("neofetch")
  useEffect(() => {
    if (run.finished) onReady?.()
  }, [run.finished, onReady])

  return (
    <section aria-labelledby="hero-title" className="container hero">
      <div ref={run.ref} className={`hero__run terminal-run terminal-run--${run.stage}`} style={run.style}>
        <p className="hero__command">
          <TerminalCommand command="neofetch" />
        </p>

        <div className="hero__neofetch">
          <div className="hero__title-group">
            <p className="hero__muted"><span className="hero__accent">{profile.handle}</span>@portfolio</p>
            <h1 id="hero-title" className="hero__name">{profile.name}</h1>
          </div>
          <NavigationJump onClick={onNavigate} />

          <div aria-hidden="true" className="hero__art">
            <Ascii piece={synthwave} className="hero__ascii" options={{ fps: run.inView && run.finished ? synthwave.meta.fps : 0 }} />
          </div>

          <dl className="hero__facts">
            {hero.neofetch.filter((row) => row.key === "Status" || row.key === "Focus").map((row) => (
              <div key={row.key} className="hero__fact"><dt>{row.key}</dt><dd>{row.value}</dd></div>
            ))}
          </dl>

          <nav aria-label="Quick contact links" className="hero__contacts">
            <ul>
              {contacts.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target={link.icon === "email" ? undefined : "_blank"} rel={link.icon === "email" ? undefined : "noreferrer"} className="text-link">
                    <ContactIcon name={link.icon} />{link.label}
                    {link.icon !== "email" ? <span className="sr-only"> (opens in new tab)</span> : null}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <details className="hero__details">
            <summary>System details</summary>
            <dl className="hero__facts">
              {hero.neofetch.filter((row) => row.key !== "Status" && row.key !== "Focus").map((row) => (
                <div key={row.key} className="hero__fact"><dt>{row.key}</dt><dd>{row.value}</dd></div>
              ))}
            </dl>
          </details>

          <div aria-hidden="true" className="hero__swatches">
            {swatchColors.map((color) => <span key={color} className="hero__swatch" style={{ background: color }} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
