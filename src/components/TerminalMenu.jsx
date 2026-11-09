import { useCallback, useEffect, useId, useRef, useState } from "react"
import { Link } from "react-router"
import { sections } from "../content/site.js"
import { getMenuKeyAction } from "../lib/menuKeyboard.js"
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
  const menuRef = useRef(null)
  const selectedRef = useRef(0)
  const [selected, setSelected] = useState(0)
  const items = destinations.filter((item) => current !== "home" || item.id !== "home")

  const select = useCallback((index) => {
    selectedRef.current = index
    setSelected(index)
  }, [])

  useEffect(() => {
    function onKeyDown(event) {
      const menu = menuRef.current
      if (!menu || menu.closest("[inert]") || getComputedStyle(menu).visibility === "hidden") return
      const target = event.target instanceof Element ? event.target : null
      const action = getMenuKeyAction(event, {
        selectedIndex: selectedRef.current,
        count: items.length,
        insideMenu: menu.contains(target),
        editing: !!target?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]'),
        interactive: !!target?.closest('a, button, summary, [role="button"], [role="link"], [role="tab"]'),
      })
      if (!action) return
      event.preventDefault()
      const links = menu.querySelectorAll("a")
      select(action.index)
      if (action.type === "open") links[action.index]?.click()
      else links[action.index]?.focus()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [items.length, select])

  return (
    <nav ref={menuRef} aria-label="Portfolio navigation" className="terminal-menu">
      <p className="terminal-menu__heading">Where to?</p>
      <ul className="terminal-menu__options">
        {items.map((item, index) => (
          <li key={item.id}>
            <Link
              to={item.href}
              aria-label={item.label}
              aria-describedby={`${menuId}-${item.id}`}
              aria-current={current === item.id ? "page" : undefined}
              className="terminal-menu__option"
              data-selected={selected === index ? "true" : undefined}
              onFocus={() => select(index)}
              onPointerEnter={() => select(index)}
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
