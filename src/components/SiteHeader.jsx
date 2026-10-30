import { Link } from "react-router"
import { profile, sections } from "../content/site.js"
import "./SiteHeader.css"

const navItems = Object.values(sections).map((section) => ({
  href: `/#${section.id}`,
  label: section.nav,
}))

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__brand">
          <span>
            <span className="site-header__handle">{profile.handle}</span>
            <span className="site-header__host">@portfolio</span>
            <span className="site-header__prompt">:~$</span>
          </span>
          <span aria-hidden="true" className="site-header__cursor cursor" />
          {/* On phones the handle is hidden, so screen readers get this label instead. */}
          <span className="sr-only site-header__home-label">{profile.name}, home</span>
        </Link>

        <nav aria-label="Main">
          <ul className="site-header__nav">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link to={item.href} className="site-header__link">
                  <span aria-hidden="true" className="site-header__dot-slash">
                    ./
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
