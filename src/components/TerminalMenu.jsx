import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import { sections } from "../content/site.js"
import { getMenuKeyAction } from "../lib/menuKeyboard.js"
import useTerminalRun from "../lib/useTerminalRun.js"
import TerminalCommand from "./TerminalCommand.jsx"
import "./TerminalMenu.css"

const destinations = [
  { id: "home", label: "Home", href: "/" },
  ...Object.values(sections).map((section) => ({
    id: section.id,
    label: section.nav,
    href: `/#${section.id}`,
  })),
]

export default function TerminalMenu({ current, enabled = true, request = 0 }) {
  const run = useTerminalRun("./menu.sh", { enabled, immediate: request > 0, visitKey: `menu:${current}` })
  const menuRef = useRef(null)
  const initialChoice = current === "home" ? 1 : 0
  const selectedRef = useRef(initialChoice)
  const [selected, setSelected] = useState(initialChoice)
  const items = destinations

  const select = useCallback((index) => {
    selectedRef.current = index
    setSelected(index)
  }, [])

  useEffect(() => {
    if (!request || !run.finished) return
    const link = menuRef.current?.querySelectorAll("a")[selectedRef.current]
    link?.focus({ preventScroll: true })
    menuRef.current?.scrollIntoView({ block: "center", behavior: "instant" })
  }, [request, run.finished])

  useEffect(() => {
    if (!run.finished) return
    function onKeyDown(event) {
      const menu = menuRef.current
      if (!menu || menu.closest("[inert]") || getComputedStyle(menu).visibility === "hidden") return
      const target = event.target instanceof Element ? event.target : null
      const links = Array.from(menu.querySelectorAll("a"))
      const action = getMenuKeyAction(event, {
        selectedIndex: selectedRef.current,
        focusedIndex: links.indexOf(target?.closest("a")),
        count: items.length,
        insideMenu: menu.contains(target),
        menuVisible: links.some((link) => {
          const bounds = link.getBoundingClientRect()
          return bounds.top >= 0 && bounds.bottom <= window.innerHeight
            && bounds.left < window.innerWidth && bounds.right > 0
        }),
        editing: !!target?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]'),
        interactive: !!target?.closest('a, button, summary, [role="button"], [role="link"], [role="tab"]'),
      })
      if (!action) return
      event.preventDefault()
      select(action.index)
      if (action.type === "open") links[action.index]?.click()
      else links[action.index]?.focus()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [items.length, run.finished, select])

  return (
    <div ref={run.ref} className={`terminal-menu terminal-run terminal-run--${run.stage}`} style={run.style}>
      <p className="terminal-menu__command"><TerminalCommand command="./menu.sh" /></p>
      <nav ref={menuRef} aria-label="Portfolio navigation" className="terminal-menu__output" inert={!run.finished}>
        <h2 className="terminal-menu__heading">Navigate</h2>
        <ol className="terminal-menu__options">
          {items.map((item, index) => (
            <li key={item.id}>
              <Link
                to={item.href}
                aria-label={item.label}
                aria-current={current === item.id ? "page" : undefined}
                className="terminal-menu__option"
                data-selected={selected === index ? "true" : undefined}
                onFocus={() => select(index)}
                onPointerEnter={() => {
                  if (!menuRef.current?.contains(document.activeElement)) select(index)
                }}
              >
                <span aria-hidden="true" className="terminal-menu__number">{index + 1}.</span>
                <span aria-hidden="true" className="terminal-menu__marker">{">"}</span>
                <span className="terminal-menu__label">{item.label}</span>
                {current === item.id ? <span className="terminal-menu__current">current</span> : null}
              </Link>
            </li>
          ))}
        </ol>
        <p className="terminal-menu__help">
          <span><kbd>↑↓</kbd> select</span>
          <span><kbd>Enter</kbd> / <kbd>1–{items.length}</kbd> open</span>
        </p>
      </nav>
    </div>
  )
}
