import { Ascii } from "ascii.rest/react"
import * as synthwave from "ascii.rest/pieces/synthwave"
import useTerminalRun from "../lib/useTerminalRun.js"
import { hero, profile } from "../content/site.js"
import { useEffect } from "react"
import TerminalCommand from "./TerminalCommand.jsx"
import NavigationJump from "./NavigationJump.jsx"
import "./Hero.css"

const swatchColors = ["var(--foreground)", "var(--primary)", "var(--muted-foreground)", "var(--card)"]

export default function Hero({ onReady, onNavigate }) {
  const title = `${profile.handle}@portfolio`
  const run = useTerminalRun("neofetch")
  useEffect(() => {
    if (run.finished) onReady?.()
  }, [run.finished, onReady])

  return (
    <section aria-labelledby="hero-title" className="container hero">
      <div ref={run.ref} className={`hero__run terminal-run terminal-run--${run.stage}`} style={run.style}>
        <p className="hero__command">
          <TerminalCommand command="neofetch" />
          <NavigationJump onClick={onNavigate} />
        </p>

        <div className="hero__neofetch">
          <div aria-hidden="true" className="hero__art">
            <Ascii
              piece={synthwave}
              className="hero__ascii"
              options={{ fps: run.inView && run.finished ? synthwave.meta.fps : 0 }}
            />
          </div>

          <div className="hero__info">
            <div className="hero__title-group">
              <p className="hero__muted">
                <span className="hero__accent">{profile.handle}</span>@portfolio
              </p>
              <h1 id="hero-title" className="hero__name">
                {profile.name}
              </h1>
              <p aria-hidden="true" className="hero__dashes">
                {"-".repeat(title.length + 8)}
              </p>
            </div>

            <nav aria-label="Quick contact links" className="hero__contacts">
              <a href={`mailto:${profile.email}`} className="text-link">{profile.email}</a>
              <ul>
                {profile.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} target="_blank" rel="noreferrer" className="text-link">
                      {{ github: "GitHub", linkedin: "LinkedIn", codeforces: "Codeforces" }[link.label] || link.label}
                      <span className="sr-only"> (opens in new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <dl className="hero__facts">
              {hero.neofetch.map((row) => (
                <div key={row.key} className="hero__fact">
                  <dt>{row.key}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>

            <div aria-hidden="true" className="hero__swatches">
              {swatchColors.map((color) => (
                <span key={color} className="hero__swatch" style={{ background: color }} />
              ))}
            </div>
          </div>
        </div>

      </div>

    </section>
  )
}
