import { hero, profile } from "../content/site.js"
import HomeListing from "./HomeListing.jsx"
import "./Hero.css"


const swatchColors = ["var(--foreground)", "var(--primary)", "var(--muted-foreground)", "var(--card)"]

export default function Hero() {
  const title = `${profile.handle}@portfolio`

  return (
    <section aria-labelledby="hero-title" className="container hero">
      <div className="hero__top">
        <p className="hero__command boot">
          <span className="hero__accent">{"$ "}</span>neofetch
        </p>

        <div className="hero__neofetch boot" style={{ animationDelay: "150ms" }}>
          <pre aria-hidden="true" className="hero__ascii">
            {hero.asciiArt}
          </pre>

          <div className="hero__info">
            <div className="hero__title-group">
              <p className="hero__muted">
                <span className="hero__accent">{profile.handle}</span>@portfolio
              </p>
              <h1 id="hero-title" className="hero__name">
                {profile.name}
                <span aria-hidden="true" className="hero__accent cursor">
                  _
                </span>
              </h1>
              <p aria-hidden="true" className="hero__dashes">
                {"-".repeat(title.length + 8)}
              </p>
            </div>

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

        <div className="hero__intro boot" style={{ animationDelay: "300ms" }}>
          <p className="hero__summary">
            <span className="hero__summary-lead">
              {profile.role} at {profile.school}.
            </span>{" "}
            {profile.summary}
          </p>
          <p className="hero__status">
            <span aria-hidden="true" className="hero__status-dot" />
            {profile.status}
          </p>
        </div>
      </div>

      <div className="boot" style={{ animationDelay: "450ms" }}>
        <HomeListing />
      </div>
    </section>
  )
}
