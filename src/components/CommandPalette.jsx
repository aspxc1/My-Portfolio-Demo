import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { profile, sections } from "../content/site.js"
import { rankFuzzyItems } from "../lib/fuzzyMatch.js"
import { projects } from "../lib/projects.js"
import { BACKGROUNDS, THEMES } from "../lib/terminalTheme.js"
import { TerminalTheme } from "./PortfolioSession.jsx"
import "./CommandPalette.css"

function HighlightedLabel({ text, indices }) {
  if (!indices?.length) return text
  const set = new Set(indices)
  return (
    <>
      {Array.from(text).map((ch, idx) =>
        set.has(idx) ? <mark key={idx} className="palette__mark">{ch}</mark> : <span key={idx}>{ch}</span>,
      )}
    </>
  )
}

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate()
  const appearance = useContext(TerminalTheme)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [feedback, setFeedback] = useState("")
  const inputRef = useRef(null)

  const items = useMemo(() => {
    const navItems = [
      {
        id: "nav:home",
        group: "nav",
        label: "Home",
        meta: "~",
        keywords: "neofetch landing start index",
        previewTitle: "cd ~ && neofetch",
        previewBody: `${profile.name} — ${profile.role} at ${profile.school}.`,
        run: () => navigate("/"),
      },
      ...Object.values(sections).map((section) => ({
        id: `nav:${section.id}`,
        group: "nav",
        label: section.nav,
        meta: section.path,
        keywords: `${section.command} ${section.path} ${section.id}`,
        previewTitle: `cd ${section.path} && ${section.command}`,
        previewBody: `Switch active tmux window to ${section.nav} (${section.path}).`,
        run: () => navigate(`/#${section.id}`),
      })),
    ]

    const projectItems = projects.map((project) => ({
      id: `project:${project.slug}`,
      group: "proj",
      label: project.name,
      meta: `~/projects/${project.slug}`,
      keywords: `${project.category} ${project.stack.join(" ")} ${project.tagline}`,
      previewTitle: `${project.name} (${project.year})`,
      previewBody: `${project.tagline} · ${project.stack.join(", ")}`,
      run: () => navigate(`/projects/${project.slug}`),
    }))

    const themeItems = THEMES.map((theme) => ({
      id: `theme:${theme.id}`,
      group: "theme",
      label: theme.label,
      meta: theme.id,
      keywords: `color theme palette rice ${theme.id} ${theme.background}`,
      previewTitle: `theme ${theme.id}`,
      previewBody: `Default backdrop: ${theme.background}. Accents: ${theme.accents.map((a) => a.label).join(", ")}.`,
      swatches: theme.preview,
      run: () => appearance?.setTheme(theme.id),
    }))

    const bgItems = BACKGROUNDS.map((bg) => ({
      id: `bg:${bg.id}`,
      group: "bg",
      label: `Background: ${bg.label}`,
      meta: bg.id,
      keywords: `backdrop canvas effect ${bg.id} ${bg.label}`,
      previewTitle: `bg ${bg.id}`,
      previewBody: `Switch ambient terminal backdrop to ${bg.label}.`,
      run: () => appearance?.setBackground(bg.id),
    }))

    const actionItems = [
      {
        id: "action:copy-email",
        group: "cmd",
        label: "Copy email address",
        meta: profile.email,
        keywords: "mail clipboard pbcopy contact",
        previewTitle: "pbcopy < email",
        previewBody: `Copies ${profile.email} directly to your clipboard.`,
        run: () => {
          navigator.clipboard?.writeText(profile.email).catch(() => {})
          setFeedback(`Copied ${profile.email}`)
        },
        keepOpenBrief: true,
      },
      ...profile.links.map((link) => ({
        id: `link:${link.icon}`,
        group: "link",
        label: `Open ${link.label}`,
        meta: link.href.replace(/^https?:\/\//, ""),
        keywords: `external social profile ${link.label} ${link.icon}`,
        previewTitle: `open ${link.icon}`,
        previewBody: link.href,
        run: () => window.open(link.href, "_blank", "noopener,noreferrer"),
      })),
    ]

    return [...navItems, ...projectItems, ...themeItems, ...bgItems, ...actionItems]
  }, [appearance, navigate])

  const results = useMemo(() => rankFuzzyItems(items, query, (item) => item.label), [items, query])
  const clampedIndex = results.length ? Math.min(selectedIndex, results.length - 1) : 0
  const active = results[clampedIndex]?.item || null

  useEffect(() => {
    if (!open) return
    setQuery("")
    setSelectedIndex(0)
    setFeedback("")
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(timer)
  }, [open])

  if (!open) return null

  function activate(entry) {
    if (!entry) return
    entry.run()
    if (entry.keepOpenBrief) {
      window.setTimeout(() => onClose(), 550)
    } else {
      onClose()
    }
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault()
      onClose()
      return
    }
    if (event.key === "ArrowDown" || (event.key === "n" && event.ctrlKey)) {
      event.preventDefault()
      if (results.length) setSelectedIndex((prev) => (prev + 1) % results.length)
      return
    }
    if (event.key === "ArrowUp" || (event.key === "p" && event.ctrlKey)) {
      event.preventDefault()
      if (results.length) setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
      return
    }
    if (event.key === "Enter" && active) {
      event.preventDefault()
      activate(active)
    }
  }

  return (
    <div
      className="palette-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Fuzzy command palette"
        className="palette"
        onKeyDown={onKeyDown}
      >
        <div className="palette__top">
          <span className="palette__badge">fzf :: telescope</span>
          <span className="palette__count">{`${results.length}/${items.length}`}</span>
          <button type="button" className="palette__close" onClick={onClose} aria-label="Close command palette">
            <kbd className="tui-kbd">Esc</kbd>
          </button>
        </div>

        <div className="palette__input-row">
          <span aria-hidden="true" className="palette__prompt">❯</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Jump to view, switch theme, run action..."
            aria-label="Filter commands and destinations"
            autoComplete="off"
            spellCheck={false}
            className="palette__input"
          />
          {feedback ? <span className="palette__feedback" role="status">{feedback}</span> : null}
        </div>

        <div className="palette__body">
          <ul className="palette__list" role="listbox" aria-label="Matching items">
            {results.length === 0 ? (
              <li className="palette__empty">No matches for &ldquo;{query}&rdquo;</li>
            ) : (
              results.map(({ item, indices }, idx) => (
                <li key={item.id} role="option" aria-selected={idx === clampedIndex}>
                  <button
                    type="button"
                    className="palette__item"
                    data-selected={idx === clampedIndex || undefined}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => activate(item)}
                  >
                    <span className={`palette__tag palette__tag--${item.group}`}>{item.group}</span>
                    <span className="palette__label">
                      <HighlightedLabel text={item.label} indices={indices} />
                    </span>
                    <span className="palette__meta">{item.meta}</span>
                  </button>
                </li>
              ))
            )}
          </ul>

          <aside className="palette__preview" aria-label="Selected item preview">
            {active ? (
              <>
                <p className="palette__preview-head">{active.previewTitle}</p>
                <p className="palette__preview-body">{active.previewBody}</p>
                {active.swatches ? (
                  <div className="palette__preview-card" style={{ background: active.swatches[0] }}>
                    <span style={{ color: active.swatches[1] }}>$ neofetch</span>
                    <div className="palette__preview-swatches">
                      {active.swatches.map((hex) => (
                        <span key={hex} className="palette__preview-swatch" style={{ background: hex }} />
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="palette__preview-body">Type to fuzzy-search routes, themes, backdrops, and actions.</p>
            )}
          </aside>
        </div>

        <div className="palette__footer" aria-hidden="true">
          <span><kbd className="tui-kbd">↑↓</kbd> move</span>
          <span><kbd className="tui-kbd">Enter</kbd> select</span>
          <span><kbd className="tui-kbd">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
