import { useContext, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { profile } from "../content/site.js"
import { projects } from "../lib/projects.js"
import { executeShellCommand, getShellSuggestion } from "../lib/terminalShell.js"
import { TerminalTheme } from "./PortfolioSession.jsx"
import "./TerminalShell.css"

const QUICK_COMMANDS = ["help", "man aaser", "ls -la", "theme kanagawa", "copy email"]

export default function TerminalShell({ path = "~", onOpenPalette }) {
  const navigate = useNavigate()
  const appearance = useContext(TerminalTheme)
  const [input, setInput] = useState("")
  const [entries, setEntries] = useState([])
  const [history, setHistory] = useState([])
  const [historyCursor, setHistoryCursor] = useState(-1)
  const startedAt = useRef(Date.now())
  const inputRef = useRef(null)
  const logRef = useRef(null)

  const suggestion = getShellSuggestion(input, appearance?.accents || [])

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [entries])

  // Global "/" shortcut focuses the interactive prompt when not already typing
  useEffect(() => {
    function onGlobalKey(event) {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented) return
      const target = event.target instanceof Element ? event.target : null
      if (target?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]')) return
      event.preventDefault()
      inputRef.current?.focus()
    }
    document.addEventListener("keydown", onGlobalKey)
    return () => document.removeEventListener("keydown", onGlobalKey)
  }, [])

  function runCommand(rawCommand) {
    const trimmed = rawCommand.trim()
    if (!trimmed) return

    const nextHistory = [...history, trimmed]
    setHistory(nextHistory)
    setHistoryCursor(-1)
    setInput("")

    const result = executeShellCommand(trimmed, {
      currentPath: path,
      projects,
      theme: appearance?.theme,
      accent: appearance?.accent,
      accents: appearance?.accents,
      background: appearance?.background,
      history: nextHistory,
      startedAt: startedAt.current,
    })

    if (result.clear) {
      setEntries([])
      return
    }

    setEntries((prev) => [
      ...prev.slice(-14),
      { id: `${Date.now()}-${prev.length}`, path, command: trimmed, lines: result.lines || [] },
    ])

    if (result.setTheme) appearance?.setTheme(result.setTheme)
    if (result.setAccent) appearance?.setAccent(result.setAccent)
    if (result.setBackground) appearance?.setBackground(result.setBackground)
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
      inputRef.current?.blur()
      return
    }
    if ((event.key === "Tab" || (event.key === "ArrowRight" && event.currentTarget.selectionStart === input.length)) && suggestion) {
      event.preventDefault()
      setInput(input + suggestion)
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
      return
    }
    if (event.key === "l" && event.ctrlKey) {
      event.preventDefault()
      setEntries([])
    }
  }

  return (
    <section
      aria-label="Interactive terminal shell"
      className="terminal-shell"
      onClick={(event) => {
        if (!(event.target instanceof Element) || !event.target.closest("button, a")) {
          inputRef.current?.focus()
        }
      }}
    >
      <div className="terminal-shell__header">
        <span className="terminal-shell__title">
          <span aria-hidden="true" className="terminal-shell__glyph">❯</span>
          Interactive shell
        </span>
        <div className="terminal-shell__hints">
          <span className="terminal-shell__hint"><kbd className="tui-kbd">/</kbd> focus</span>
          {onOpenPalette ? (
            <button type="button" className="terminal-shell__palette-trigger" onClick={onOpenPalette}>
              <kbd className="tui-kbd">Ctrl+K</kbd> fzf
            </button>
          ) : null}
        </div>
      </div>

      {entries.length > 0 ? (
        <div ref={logRef} className="terminal-shell__log" aria-live="polite">
          {entries.map((entry) => (
            <div key={entry.id} className="terminal-shell__entry">
              <p className="terminal-shell__echo">
                <span className="terminal-shell__user">{profile.handle}@portfolio</span>
                <span className="terminal-shell__path">:{entry.path}$ </span>
                <span>{entry.command}</span>
              </p>
              {entry.lines.map((line, lineIndex) => (
                <p
                  key={lineIndex}
                  className={line.tone ? `terminal-shell__line terminal-shell__line--${line.tone}` : "terminal-shell__line"}
                >
                  {line.text || "\u00A0"}
                </p>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="terminal-shell__intro">
          <p className="terminal-shell__note">
            Type a command or press <kbd className="tui-kbd">Tab</kbd> to autocomplete. Try:
          </p>
          <div className="terminal-shell__chips">
            {QUICK_COMMANDS.map((cmd) => (
              <button
                key={cmd}
                type="button"
                className="terminal-shell__chip"
                onClick={() => {
                  runCommand(cmd)
                  inputRef.current?.focus()
                }}
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        className="terminal-shell__form"
        onSubmit={(event) => {
          event.preventDefault()
          runCommand(input)
        }}
      >
        <label htmlFor="terminal-shell-input" className="sr-only">
          Terminal command input
        </label>
        <span className="terminal-shell__prompt" aria-hidden="true">
          <span className="terminal-shell__user">{profile.handle}@portfolio</span>
          <span className="terminal-shell__path">:{path}$</span>
        </span>
        <div className="terminal-shell__field">
          <span className="terminal-shell__mirror" aria-hidden="true">
            <span className="terminal-shell__typed">{input}</span>
            {suggestion ? <span className="terminal-shell__ghost">{suggestion}</span> : null}
          </span>
          <input
            ref={inputRef}
            id="terminal-shell-input"
            type="text"
            value={input}
            onChange={(event) => {
              setInput(event.target.value)
              setHistoryCursor(-1)
            }}
            onKeyDown={onKeyDown}
            placeholder="help"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="terminal-shell__input"
          />
        </div>
      </form>
    </section>
  )
}
