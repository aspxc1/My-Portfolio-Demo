import { Link, useLocation } from "react-router"
import { profile } from "../content/site.js"
import { fuzzyMatch } from "../lib/fuzzyMatch.js"
import { projects } from "../lib/projects.js"
import "./NotFoundPage.css"

const destinations = [
  { label: "~", desc: "Home", to: "/" },
  { label: "~/about", desc: "About", to: "/#about" },
  { label: "~/projects", desc: "Projects", to: "/#projects" },
  { label: "~/experience", desc: "Experience & clubs", to: "/#activities" },
  { label: "~/contact", desc: "Contact", to: "/#contact" },
]

export default function NotFoundPage() {
  const { pathname } = useLocation()
  const query = pathname.replace(/^\/+/, "")

  const allTargets = [
    ...destinations,
    ...projects.map((p) => ({ label: `~/projects/${p.slug}`, desc: p.name, to: `/projects/${p.slug}` })),
  ]

  let suggestion = null
  if (query) {
    let bestScore = -Infinity
    for (const target of allTargets) {
      const m = fuzzyMatch(query, target.label)
      if (m.matched && m.score > bestScore) {
        bestScore = m.score
        suggestion = target
      }
    }
  }

  return (
    <main className="container not-found">
      <title>{`Not found | ${profile.name}`}</title>

      <div className="not-found__box tui-frame">
        <span className="tui-frame__legend" aria-hidden="true">ENOENT · 404</span>

        <p className="not-found__command">
          <span className="not-found__accent">{"% "}</span>
          {`cd ${pathname || "/"}`}
        </p>

        <h1 className="not-found__title">
          {`zsh: no such file or directory: ${pathname || "/"}`}
        </h1>

        {suggestion ? (
          <p className="not-found__suggest">
            Did you mean{" "}
            <Link to={suggestion.to} className="text-link">
              {suggestion.label}
            </Link>
            ?
          </p>
        ) : null}

        <div className="not-found__links">
          {destinations.map((dest) => (
            <Link key={dest.to} to={dest.to} className="not-found__link">
              <span>{dest.label}</span>
              <span className="not-found__desc">{dest.desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
