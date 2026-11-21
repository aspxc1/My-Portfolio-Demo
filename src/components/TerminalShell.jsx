import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import activities from "../content/activities.json"
import { profile } from "../content/site.js"
import { projects } from "../lib/projects.js"
import { playKeyTick, playTerminalBell } from "../lib/terminalAudio.js"
import { executeShellCommand, getShellSuggestion } from "../lib/terminalShell.js"
import { TerminalTheme, WorkspaceControl } from "./PortfolioSession.jsx"
import "./TerminalShell.css"

function isTypingContext(target) {
  return target instanceof HTMLElement && (
    target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
  )
}

/**
 * Persistent interactive zsh prompt & tmux split pane.
 * - Dock mode: razor-thin single prompt bar at bottom (expands smoothly once commands run)
 * - Split mode: full resizable tmux terminal pane with Ctrl+R reverse search, Ctrl+C, Ctrl+L, Tab completion
 */
export default function TerminalShell({ path = "~", mode = "dock", active = false, zoomed = false, onActivate, onOpenPalette }) {
  const appearance = useContext(TerminalTheme)
  const workspace = useContext(WorkspaceControl)
  const navigate = useNavigate()
  const location = useLocation()

  const entries = workspace?.shellEntries || []
  const setEntries = workspace?.setShellEntries
  const history = workspace?.shellHistory || []
  const setHistory = workspace?.setShellHistory

  const [input, setInput] = useState("")
  const [historyCursor, setHistoryCursor] = useState(-1)
  const [searchMode, setSearchMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const inputRef = useRef(null)
  const logRef = useRef(null)
  const lastDeepCmd = useRef("")

  const suggestion = useMemo(
    () => (searchMode ? "" : getShellSuggestion(input, { accents: appearance?.accents, currentPath: path, projects })),
    [input, appearance?.accents, path, searchMode],
  )

  const searchMatch = useMemo(() => {
    if (!searchMode || !searchQuery) return ""
    const q = searchQuery.toLowerCase()
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].toLowerCase().includes(q)) return history[i]
    }
    return ""
  }, [searchMode, searchQuery, history])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [entries, mode])

  useEffect(() => {
    if (workspace?.shellFocusTick > 0) {
      inputRef.current?.focus()
    }
  }, [workspace?.shellFocusTick])

  // Global `/` shortcut focuses the prompt
  useEffect(() => {
    function onGlobalKey(event) {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented) return
      if (isTypingContext(event.target)) return
      event.preventDefault()
      onActivate?.()
      inputRef.current?.focus()
    }
    document.addEventListener("keydown", onGlobalKey)
    return () => document.removeEventListener("keydown", onGlobalKey)
  }, [onActivate])

  // Deep-link `/?cmd=man+aaser` execution on arrival
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const cmd = params.get("cmd")?.trim()
    if (!cmd || cmd === lastDeepCmd.current) return
    lastDeepCmd.current = cmd
    workspace?.toggleSplit("vertical")
    runCommand(cmd)
  }, [location.search])

  function runCommand(rawCommand) {
    const trimmed = rawCommand.trim()
    if (!trimmed) return

    const nextHistory = [...history, trimmed]
    setHistory?.(nextHistory)
    setHistoryCursor(-1)
    setInput("")
    setSearchMode(false)
    setSearchQuery("")

    const result = executeShellCommand(trimmed, {
      currentPath: path,
      projects,
      activities,
      theme: appearance?.theme,
      accent: appearance?.accent,
      accents: appearance?.accents,
      surface: appearance?.surface,
      audio: appearance?.audio,
      history: nextHistory,
      startedAt: workspace?.startedAt,
    })

    if (result.isError) playTerminalBell(appearance?.audio)
    else playKeyTick(appearance?.audio)

    if (result.clear) {
      setEntries?.([])
      return
    }

    setEntries?.((prev) => [
      ...prev.slice(-30),
      { id: `${Date.now()}-${prev.length}`, path, command: trimmed, lines: result.lines || [] },
    ])

    if (result.setCwd) workspace?.setShellCwd(result.setCwd)
    if (result.setTheme) appearance?.setTheme(result.setTheme)
    if (result.setAccent) appearance?.setAccent(result.setAccent)
    if (result.setSurface) appearance?.setSurface(result.setSurface)
    if (typeof result.setAudio === "boolean") appearance?.setAudio(result.setAudio)
    if (result.setSplit) workspace?.toggleSplit(result.setSplit)
    if (result.toggleZoom) workspace?.toggleZoom()
    if (result.copyText && typeof navigator !== "undefined") {
      navigator.clipboard?.writeText(result.copyText).catch(() => {})
    }
    if (result.openUrl && typeof window !== "undefined") {
      if (result.external) window.open(result.openUrl, "_blank", "noopener,noreferrer")
      else window.location.href = result.openUrl
    }
    if (result.navigate) {
      navigate(result.navigate)
    }
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault()
      if (searchMode) {
        setSearchMode(false)
        setSearchQuery("")
      } else {
        inputRef.current?.blur()
      }
      return
    }

    if (event.ctrlKey && event.key.toLowerCase() === "c") {
      event.preventDefault()
      playTerminalBell(appearance?.audio)
      if (searchMode) {
        setSearchMode(false)
        setSearchQuery("")
        return
      }
      if (input) {
        setEntries?.((prev) => [
          ...prev.slice(-30),
          { id: `${Date.now()}-int`, path, command: `${input}^C`, lines: [] },
        ])
        setInput("")
        setHistoryCursor(-1)
      }
      return
    }

    if (event.ctrlKey && event.key.toLowerCase() === "l") {
      event.preventDefault()
      setEntries?.([])
      return
    }

    if (event.ctrlKey && event.key.toLowerCase() === "r") {
      event.preventDefault()
      setSearchMode(true)
      setSearchQuery(input)
      return
    }

    if (searchMode) {
      if (event.key === "Enter") {
        event.preventDefault()
        const resolved = searchMatch || searchQuery
        setSearchMode(false)
        setSearchQuery("")
        if (resolved) runCommand(resolved)
        return
      }
      if (event.key === "Tab" || event.key === "ArrowRight") {
        event.preventDefault()
        if (searchMatch) setInput(searchMatch)
        setSearchMode(false)
        setSearchQuery("")
        return
      }
      return
    }

    if ((event.key === "Tab" || (event.key === "ArrowRight" && event.currentTarget.selectionStart === input.length)) && suggestion) {
      event.preventDefault()
      setInput(input + suggestion)
      playKeyTick(appearance?.audio)
      return
    }

    if (event.key === "ArrowUp") {
      if (!history.length) return
      event.preventDefault()
      const nextIndex = historyCursor < 0 ? history.length - 1 : Math.max(0, historyCursor - 1)
      setHistoryCursor(nextIndex)
      setInput(history[nextIndex])
      return
    }

    if (event.key === "ArrowDown") {
      if (historyCursor < 0) return
      event.preventDefault()
      if (historyCursor >= history.length - 1) {
        setHistoryCursor(-1)
        setInput("")
      } else {
        const nextIndex = historyCursor + 1
        setHistoryCursor(nextIndex)
        setInput(history[nextIndex])
      }
    }
  }

  const isSplit = mode !== "dock"

  return (
    <section
      aria-label="Interactive terminal shell"
      className={`terminal-shell terminal-shell--${mode}${active ? " terminal-shell--active" : ""}`}
      onPointerDown={() => onActivate?.()}
      onClick={(event) => {
        if (!(event.target instanceof Element) || !event.target.closest("button, a")) {
          inputRef.current?.focus()
        }
      }}
    >
      {isSplit ? (
        <div className="terminal-shell__pane-bar">
          <span className="terminal-shell__pane-title">{`zsh · ${path}`}</span>
          <div className="terminal-shell__pane-actions">
            {entries.length > 0 ? (
              <button type="button" className="terminal-shell__pane-btn" onClick={() => setEntries?.([])}>clear</button>
            ) : null}
            <button
              type="button"
              className="terminal-shell__pane-btn"
              onClick={() => workspace?.toggleZoom()}
              title="Zoom pane (Ctrl+B z)"
            >
              {zoomed ? "unzoom" : "zoom"}
            </button>
            <button
              type="button"
              className="terminal-shell__pane-btn"
              onClick={() => workspace?.toggleSplit("dock")}
              title="Collapse split (Ctrl+B x)"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}

      {entries.length > 0 ? (
        <div ref={logRef} className="terminal-shell__log" aria-live="polite">
          {!isSplit ? (
            <div className="terminal-shell__dock-actions">
              <button type="button" className="terminal-shell__pane-btn" onClick={() => workspace?.toggleSplit("vertical")}>
                expand split
              </button>
              <button type="button" className="terminal-shell__pane-btn" onClick={() => setEntries?.([])}>
                clear
              </button>
            </div>
          ) : null}
          {entries.map((entry) => (
            <div key={entry.id} className="terminal-shell__entry">
              <p className="terminal-shell__echo">
                <span className="terminal-shell__user">{`${profile.handle}@portfolio:`}</span>
                <span className="terminal-shell__path">{entry.path}</span>
                <span className="terminal-shell__user">{"% "}</span>
                <span>{entry.command}</span>
              </p>
              {entry.lines.map((line, idx) => (
                <p
                  key={`${entry.id}-${idx}`}
                  className={line.tone ? `terminal-shell__line terminal-shell__line--${line.tone}` : "terminal-shell__line"}
                >
                  {line.text || "\u00A0"}
                </p>
              ))}
            </div>
          ))}
        </div>
      ) : isSplit ? (
        <div className="terminal-shell__welcome">
          <p>{`zsh 5.9 (${profile.handle}@portfolio) — type `}<span className="terminal-shell__hl">help</span>{`, `}<span className="terminal-shell__hl">ls -la</span>{`, `}<span className="terminal-shell__hl">man aaser</span>{`, or pipe commands (`}<span className="terminal-shell__hl">cat README.md | grep -i ml</span>{`).`}</p>
        </div>
      ) : null}

      <form
        className="terminal-shell__form"
        onSubmit={(event) => {
          event.preventDefault()
          if (searchMode) {
            const resolved = searchMatch || searchQuery
            setSearchMode(false)
            setSearchQuery("")
            if (resolved) runCommand(resolved)
          } else {
            runCommand(input)
          }
        }}
      >
        <label htmlFor="terminal-shell-input" className="terminal-shell__prompt">
          {searchMode ? (
            <span className="terminal-shell__search-label">{`(reverse-i-search)'${searchQuery}': `}</span>
          ) : (
            <>
              <span className="terminal-shell__user">{`${profile.handle}@portfolio:`}</span>
              <span className="terminal-shell__path">{path}</span>
              <span className="terminal-shell__sigil">{"%"}</span>
            </>
          )}
        </label>

        <div className="terminal-shell__field">
          {!searchMode ? (
            <span aria-hidden="true" className="terminal-shell__mirror">
              <span className="terminal-shell__typed">{input}</span>
              {suggestion ? <span className="terminal-shell__ghost">{suggestion}</span> : null}
            </span>
          ) : null}

          <input
            ref={inputRef}
            id="terminal-shell-input"
            type="text"
            value={searchMode ? searchQuery : input}
            onChange={(event) => {
              if (searchMode) {
                setSearchQuery(event.target.value)
              } else {
                setInput(event.target.value)
                setHistoryCursor(-1)
              }
            }}
            onKeyDown={onKeyDown}
            placeholder={searchMode ? "search history…" : isSplit ? "help, ls -la, cat README.md…" : "help, ls -la, man aaser, split v…"}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="terminal-shell__input"
          />

          {searchMode && searchMatch ? (
            <span className="terminal-shell__search-match">{searchMatch}</span>
          ) : null}
        </div>

        {!isSplit ? (
          <span aria-hidden="true" className="terminal-shell__key-hints">
            <kbd className="tui-kbd">/</kbd>
            {onOpenPalette ? (
              <button type="button" className="terminal-shell__pane-btn" onClick={onOpenPalette}>
                fzf
              </button>
            ) : null}
          </span>
        ) : null}
      </form>
    </section>
  )
}
