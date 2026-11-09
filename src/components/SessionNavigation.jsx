import { Link } from "react-router"
import { profile, sections } from "../content/site.js"
import "./SessionNavigation.css"

export default function SessionNavigation({ current }) {
  const path = sections[current]?.path || "~"
  return (
    <div className="container session-navigation">
      <p className="session-navigation__prompt" aria-hidden="true">
        <span>{profile.handle}@portfolio</span>
        <span className="session-navigation__path">:{path}$ </span>
        <span className="terminal-cursor session-navigation__caret" />
      </p>
      {current !== "home" ? (
        <nav aria-label="Run a command">
          <p className="session-navigation__hint">Choose a command to continue.</p>
          <ul className="session-navigation__commands">
            <li><Link to="/">cd ~</Link></li>
            {Object.entries(sections).map(([key, section]) => (
              <li key={key}>
                <Link
                  to={`/#${section.id}`}
                  aria-label={`${section.nav}: ${section.command}`}
                  aria-current={key === current ? "page" : undefined}
                >
                  {section.command}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  )
}
