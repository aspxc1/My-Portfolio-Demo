import { useContext } from "react"
import useTerminalRun from "../lib/useTerminalRun.js"
import { DEFAULT_THEME } from "../lib/terminalTheme.js"
import { hero, profile } from "../content/site.js"
import { TerminalTheme } from "./PortfolioSession.jsx"
import TerminalArt from "./TerminalArt.jsx"
import TerminalCommand from "./TerminalCommand.jsx"
import ContactIcon from "./ContactIcon.jsx"
import "./Hero.css"

const contacts = [{ label: "Email", icon: "email", href: `mailto:${profile.email}` }, ...profile.links]

export default function Hero() {
  const run = useTerminalRun("neofetch")
  const theme = useContext(TerminalTheme)
  const accents = theme?.accents || DEFAULT_THEME.accents
  const activeAccent = theme?.accent || accents[0].id

  return (
    <section aria-labelledby="hero-title" className="container hero">
      <div ref={run.ref} className={`hero__run terminal-run terminal-run--${run.stage}`} style={run.style}>
        <p className="hero__command">
          <TerminalCommand command="neofetch" />
        </p>

        <div className="hero__neofetch">
          <div className="hero__title-group">
            <p className="hero__host">
              <span className="hero__accent">{profile.handle}</span>
              <span className="hero__muted">@</span>
              <span className="hero__teal">portfolio</span>
            </p>
            <h1 id="hero-title" className="hero__name">{profile.name}</h1>
            <span aria-hidden="true" className="hero__divider" />
          </div>

          <div className="hero__art">
            <TerminalArt active={run.inView && run.finished} />
          </div>

          <dl className="hero__facts">
            {hero.neofetch.map((row) => (
              <div key={row.key} className="hero__fact">
                <dt>{row.key}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>

          <nav aria-label="Quick contact links" className="hero__contacts">
            <ul>
              {contacts.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target={link.icon === "email" ? undefined : "_blank"}
                    rel={link.icon === "email" ? undefined : "noreferrer"}
                    className="hero__contact-link"
                  >
                    <ContactIcon name={link.icon} />
                    <span>{link.label}</span>
                    {link.icon !== "email" ? <span className="sr-only"> (opens in new tab)</span> : null}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div role="group" aria-label="Terminal accent colors" className="hero__swatches">
            <div className="hero__palette-blocks">
              {accents.map((swatch) => (
                <button
                  key={swatch.id}
                  type="button"
                  className="hero__swatch"
                  style={{ "--swatch-color": `var(--accent-${swatch.id})` }}
                  aria-label={`Set terminal accent to ${swatch.label}`}
                  aria-pressed={activeAccent === swatch.id}
                  onClick={() => theme?.setAccent(swatch.id)}
                />
              ))}
            </div>
            <span aria-hidden="true" className="hero__swatch-hint">
              {`accent:${accents.find((item) => item.id === activeAccent)?.label}`}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
