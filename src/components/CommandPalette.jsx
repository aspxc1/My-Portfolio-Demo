import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { profile, sections } from "../content/site.js"
import { rankFuzzyItems } from "../lib/fuzzyMatch.js"
import { projects } from "../lib/projects.js"
import { SURFACES, THEMES } from "../lib/terminalTheme.js"
import { TerminalTheme, WorkspaceControl } from "./PortfolioSession.jsx"
import "./CommandPalette.css"

function HighlightedLabel({ text, indices }) {
  if (!indices || indices.length === 0) return text
  const set = new Set(indices)
  return text.split("").map((ch, i) =>
    set.has(i) ? <mark key={i} className="palette__match">{ch}</mark> : <span key={i}>{ch}</span>,
  )
}

export default function CommandPalette({ open, onClose, isMac = false }) {
  const navigate = useNavigate()
  const appearance = useContext(TerminalTheme)
  const workspace = useContext(WorkspaceControl)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [feedback, setFeedback] = useState("")
  const inputRef = useRef(null)
  const dialogRef = useRef(null)
  const listRef = useRef(null)

  const items = useMemo(() => {
    const navItems = [
      {
        id: "nav-home",
        group: "nav",
        label: "Home",
        meta: "0:home · ~",
        keywords: "home index fastfetch neofetch start 0",
        previewTitle: "cd ~ && fastfetch",
        previewBody: `${profile.name} — ${profile.role} at ${profile.school}.`,
        hint: "shortcut: 0",
        run: () => navigate("/"),
      },
      {
        id: "nav-about",
        group: "nav",
        label: sections.about.nav,
        meta: "1:about · ~/about",
        keywords: "about whoami stack github htop btop 1",
        previewTitle: "cd ~/about && whoami",
        previewBody: "Grouped tech stack (tree ~/stack) and live GitHub telemetry (btop).",
        hint: "shortcut: 1",
        run: () => navigate("/#about"),
      },
      {
        id: "nav-projects",
        group: "nav",
        label: sections.projects.nav,
        meta: "2:projects · ~/projects",
        keywords: "projects work yazi ranger ls 2",
        previewTitle: "cd ~/projects && yazi",
        previewBody: projects.length
          ? `${projects.length} project${projects.length === 1 ? "" : "s"} in TUI file browser.`
          : "Project directory (currently empty).",
        hint: "shortcut: 2",
        run: () => navigate("/#projects"),
      },
      {
        id: "nav-activities",
        group: "nav",
        label: sections.activities.nav,
        meta: "3:experience · ~/experience",
        keywords: "experience clubs activities git log timeline 3",
        previewTitle: "git log --graph --decorate",
        previewBody: "Work experience and student club roles rendered as a git graph.",
        hint: "shortcut: 3",
        run: () => navigate("/#activities"),
      },
      {
        id: "nav-contact",
        group: "nav",
        label: sections.contact.nav,
        meta: "4:contact · ~/contact",
        keywords: "contact ping mtr email linkedin github mail 4",
        previewTitle: `mtr -c 1 ${profile.handle}`,
        previewBody: `Reach out via ${profile.email} or inline mail composer.`,
        hint: "shortcut: 4",
        run: () => navigate("/#contact"),
      },
    ]

    const projectItems = projects.map((project) => ({
      id: `project-${project.slug}`,
      group: "project",
      label: project.name,
      meta: `${project.year} · ${project.category}`,
      keywords: `${project.slug} ${project.tagline} ${(project.stack || []).join(" ")}`,
      previewTitle: `man ${project.slug}`,
      previewBody: project.tagline,
      hint: project.stack?.join(" · "),
      run: () => navigate(`/projects/${project.slug}`),
    }))

    const workspaceItems = [
      {
        id: "tmux-split-v",
        group: "tmux",
        label: "Split terminal vertically",
        meta: "Ctrl+B %",
        keywords: "tmux split vertical pane shell side",
        previewTitle: "tmux split-window -h",
        previewBody: "Open a persistent side-by-side interactive zsh pane with a draggable divider.",
        hint: "or run: split v",
        run: () => {
          workspace?.toggleSplit("vertical")
          workspace?.focusShell()
        },
      },
      {
        id: "tmux-split-h",
        group: "tmux",
        label: "Split terminal horizontally",
        meta: 'Ctrl+B "',
        keywords: "tmux split horizontal pane shell bottom",
        previewTitle: "tmux split-window -v",
        previewBody: "Open a persistent stacked interactive zsh pane underneath the active view.",
        hint: "or run: split h",
        run: () => {
          workspace?.toggleSplit("horizontal")
          workspace?.focusShell()
        },
      },
      {
        id: "tmux-collapse",
        group: "tmux",
        label: "Collapse split to compact prompt",
        meta: "Ctrl+B x",
        keywords: "tmux close split dock prompt",
        previewTitle: "tmux kill-pane",
        previewBody: "Return to the single-line bottom prompt without clearing shell history.",
        hint: "or run: split off",
        run: () => workspace?.toggleSplit("dock"),
      },
    ]

    const themeItems = THEMES.map((theme) => ({
      id: `theme-${theme.id}`,
      group: "theme",
      label: theme.label,
      meta: theme.id === appearance?.theme ? `${theme.id} · active` : theme.id,
      keywords: `theme color palette ${theme.id} ${theme.label}`,
      previewTitle: `theme ${theme.id}`,
      previewBody: `Switch palette to ${theme.label} (${theme.surface} surface).`,
      swatches: theme.preview,
      run: () => appearance?.setTheme(theme.id),
    }))

    const surfaceItems = SURFACES.map((surface) => ({
      id: `surface-${surface.id}`,
      group: "surface",
      label: `Surface: ${surface.label}`,
      meta: surface.id === appearance?.surface ? "active" : "display",
      keywords: `surface scanlines crt flat display ${surface.label}`,
      previewTitle: `surface ${surface.id}`,
      previewBody: surface.id === "crt"
        ? "Enable CRT scanlines and subtle phosphor bloom."
        : surface.id === "flat"
          ? "Force crisp, razor-flat modern terminal surface."
          : "Follow the active theme's native display physics.",
      run: () => appearance?.setSurface(surface.id),
    }))

    const actionItems = [
      {
        id: "action-copy-email",
        group: "action",
        label: "Copy email address",
        meta: profile.email,
        keywords: "copy email clipboard mail",
        previewTitle: "wl-copy < email",
        previewBody: `Copy ${profile.email} to clipboard.`,
        keepOpenBrief: true,
        run: () => {
          navigator.clipboard?.writeText(profile.email).then(
            () => setFeedback(`Copied ${profile.email}`),
            () => setFeedback(profile.email),
          )
        },
      },
      {
        id: "action-copy-curl",
        group: "action",
        label: "Copy curl CLI command",
        meta: "curl -sL",
        keywords: "curl cli terminal ansi plaintext worker",
        previewTitle: "curl -sL <origin>",
        previewBody: "Fetch a truecolor ANSI version of this portfolio directly in your real terminal.",
        keepOpenBrief: true,
        run: () => {
          const cmd = `curl -sL ${window.location.origin}`
          navigator.clipboard?.writeText(cmd).then(
            () => setFeedback(`Copied: ${cmd}`),
            () => setFeedback(cmd),
          )
        },
      },
      {
        id: "action-toggle-audio",
        group: "action",
        label: appearance?.audio ? "Mute terminal bell audio" : "Enable terminal bell audio",
        meta: appearance?.audio ? "on" : "off",
        keywords: "audio sound bell click mute",
        previewTitle: `audio ${appearance?.audio ? "off" : "on"}`,
        previewBody: "Subtle Web Audio mechanical click on command submit & BEL tone on errors.",
        run: () => appearance?.toggleAudio(),
      },
      ...profile.links.map((link) => ({
        id: `link-${link.icon}`,
        group: "link",
        label: `Open ${link.label}`,
        meta: link.href.replace(/^https?:\/\/(www\.)?/, ""),
        keywords: `open external ${link.label} ${link.icon}`,
        previewTitle: `open ${link.label.toLowerCase()}`,
        previewBody: `Opens ${link.href} in a new tab.`,
        run: () => window.open(link.href, "_blank", "noopener,noreferrer"),
      })),
    ]

    return [...navItems, ...projectItems, ...workspaceItems, ...themeItems, ...surfaceItems, ...actionItems]
  }, [appearance, workspace, navigate])

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

  // Keep selected item scrolled smoothly into view
  useEffect(() => {
    if (!open || !listRef.current) return
    const selectedEl = listRef.current.querySelector('[data-selected="true"]')
    selectedEl?.scrollIntoView({ block: "nearest" })
  }, [clampedIndex, open])

  if (!open) return null

  function activate(entry) {
    if (!entry) return
    entry.run()
    if (entry.keepOpenBrief) {
      window.setTimeout(() => onClose(), 650)
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
    // Focus trap inside modal
    if (event.key === "Tab" && dialogRef.current) {
      const focusable = Array.from(dialogRef.current.querySelectorAll('input, button:not([disabled])'))
      if (focusable.length) {
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
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
        ref={dialogRef}
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
          <span aria-hidden="true" className="palette__prompt">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Jump to view, split tmux pane, switch theme, copy curl..."
            aria-label="Filter commands and destinations"
            autoComplete="off"
            spellCheck={false}
            className="palette__input"
          />
          {feedback ? <span className="palette__feedback" role="status">{feedback}</span> : null}
        </div>

        <div className="palette__body">
          <ul ref={listRef} className="palette__list" role="listbox" aria-label="Matching items">
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
                    <span style={{ color: active.swatches[1] }}>$ fastfetch</span>
                    <div className="palette__preview-swatches">
                      {active.swatches.map((hex) => (
                        <span key={hex} className="palette__preview-swatch" style={{ background: hex }} />
                      ))}
                    </div>
                  </div>
                ) : null}
                {active.hint ? <p className="palette__preview-hint">{active.hint}</p> : null}
              </>
            ) : (
              <p className="palette__preview-body">Type to fuzzy-search routes, tmux splits, themes, and actions.</p>
            )}
          </aside>
        </div>

        <div className="palette__footer" aria-hidden="true">
          <span><kbd className="tui-kbd">↑↓</kbd> / <kbd className="tui-kbd">^N ^P</kbd> move</span>
          <span><kbd className="tui-kbd">Enter</kbd> select</span>
          <span><kbd className="tui-kbd">{isMac ? "⌘K" : "Ctrl+K"}</kbd> toggle</span>
        </div>
      </div>
    </div>
  )
}
