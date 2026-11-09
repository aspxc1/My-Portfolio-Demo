import { useId } from "react"
import { Link } from "react-router"
import { sections } from "../content/site.js"
import "./TerminalMenu.css"

const destinations = [
  { id: "home", label: "Home", description: "Profile & navigation", href: "/" },
  ...Object.values(sections).map((section) => ({
    id: section.id,
    label: section.nav,
    description: section.description,
    href: `/#${section.id}`,
  })),
]

export default function TerminalMenu({ current }) {
  const menuId = useId()
  const items = destinations.filter((item) => current !== "home" || item.id !== "home")

  function moveFocus(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return
    const links = Array.from(event.currentTarget.querySelectorAll("a"))
    const index = links.indexOf(event.target.closest("a"))
    if (index === -1) return
    event.preventDefault()
    const next = event.key === "Home" ? 0
      : event.key === "End" ? links.length - 1
        : (index + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length
    links[next].focus()
  }

  return (
    <nav aria-label="Portfolio navigation" className="terminal-menu" onKeyDown={moveFocus}>
      <p className="terminal-menu__heading">Where to?</p>
      <ul className="terminal-menu__options">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              to={item.href}
              aria-label={item.label}
              aria-describedby={`${menuId}-${item.id}`}
              aria-current={current === item.id ? "page" : undefined}
              className="terminal-menu__option"
            >
              <span aria-hidden="true" className="terminal-menu__marker">{">"}</span>
              <span className="terminal-menu__label">{item.label}</span>
              <span id={`${menuId}-${item.id}`} className="terminal-menu__description">{item.description}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="terminal-menu__help">
        <span><kbd>↑</kbd> <kbd>↓</kbd> move</span>
        <span><kbd>Enter</kbd> open</span>
      </p>
    </nav>
  )
}
