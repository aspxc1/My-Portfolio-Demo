import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { profile } from "../content/site.js"
import { scrollWindowTopInstant } from "../lib/scrollInstant.js"
import { DEFAULT_THEME, getSessionTask } from "../lib/terminalTheme.js"
import useReducedMotion from "../lib/useReducedMotion.js"
import { PaletteControl, TerminalTheme, WorkspaceControl } from "./PortfolioSession.jsx"
import CommandPalette from "./CommandPalette.jsx"
import TerminalShell from "./TerminalShell.jsx"
import TerminalStartup from "./TerminalStartup.jsx"
import TerminalStatusBar from "./TerminalStatusBar.jsx"
import "./SessionTransition.css"

const address = (location) => `${location.pathname}${location.hash}`
const windowRoutes = ["/", "/#about", "/#projects", "/#activities", "/#contact"]

function formatCairoClock() {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Cairo",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short",
    }).formatToParts(new Date())
    const hh = parts.find((p) => p.type === "hour")?.value || ""
    const mm = parts.find((p) => p.type === "minute")?.value || ""
    const tz = parts.find((p) => p.type === "timeZoneName")?.value || ""
    return hh && mm ? `${hh}:${mm}${tz ? ` ${tz}` : ""}` : ""
  } catch {
    return ""
  }
}

function shouldBoot(location) {
  if (typeof window === "undefined") return false
  return location.pathname === "/" && (!location.hash || location.hash === "#home")
    && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
}

/**
 * Single terminal workspace combining:
 * - Original boot startup (on fresh Home arrival, Escape to skip) & clear/reveal transitions
 * - Clean Kanagawa/Noir/CRT visual surfaces (no neon glow, no starfield)
 * - Real resizable tmux split panes (Ctrl+B % vertical, Ctrl+B " horizontal, Ctrl+B z zoom, Ctrl+B x close)
 */
export default function SessionTransition({ children }) {
  const requested = useLocation()
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()
  const theme = useContext(TerminalTheme)
  const palette = useContext(PaletteControl)
  const workspace = useContext(WorkspaceControl)

  const [starting, setStarting] = useState(() => shouldBoot(requested))
  const [displayed, setDisplayed] = useState(requested)
  const [phase, setPhase] = useState("idle")
  const [cairoClock, setCairoClock] = useState("")
  const [isMac, setIsMac] = useState(false)
  const [prefixArmed, setPrefixArmed] = useState(false)
  const [curlCopied, setCurlCopied] = useState(false)

  const displayedRef = useRef(displayed)
  displayedRef.current = displayed
  const firstRender = useRef(true)
  const focusAfterStartup = useRef(false)
  const screenRef = useRef(null)
  const workspaceRef = useRef(null)
  const prefixTimer = useRef(0)

  const surface = theme?.resolvedSurface || DEFAULT_THEME.surface
  const task = getSessionTask(displayed)
  const splitMode = workspace?.splitMode || "dock"
  const splitRatio = workspace?.splitRatio ?? 0.62
  const zoomed = Boolean(workspace?.zoomed)
  const activePane = workspace?.activePane || "main"

  const finishStartup = useCallback((shouldFocus = false) => {
    focusAfterStartup.current = shouldFocus
    setStarting(false)
  }, [])

  useEffect(() => {
    setIsMac(/mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent || ""))
    setCairoClock(formatCairoClock())
    const timer = window.setInterval(() => setCairoClock(formatCairoClock()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (workspace?.setShellCwd) {
      workspace.setShellCwd(task.path)
    }
  }, [task.path])

  // Global keyboard shortcuts: Ctrl+K / ⌘K palette, Ctrl+B tmux prefix
  useEffect(() => {
    function disarmPrefix() {
      window.clearTimeout(prefixTimer.current)
      setPrefixArmed(false)
    }

    function onKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        disarmPrefix()
        palette?.toggle()
        return
      }

      if (event.ctrlKey && !event.metaKey && !event.altKey && event.key.toLowerCase() === "b") {
        event.preventDefault()
        setPrefixArmed(true)
        window.clearTimeout(prefixTimer.current)
        prefixTimer.current = window.setTimeout(() => setPrefixArmed(false), 1600)
        return
      }

      if (prefixArmed) {
        if (event.key === "%") {
          event.preventDefault()
          workspace?.toggleSplit("vertical")
          workspace?.focusShell()
          disarmPrefix()
          return
        }
        if (event.key === '"') {
          event.preventDefault()
          workspace?.toggleSplit("horizontal")
          workspace?.focusShell()
          disarmPrefix()
          return
        }
        if (event.key.toLowerCase() === "z") {
          event.preventDefault()
          workspace?.toggleZoom()
          disarmPrefix()
          return
        }
        if (event.key.toLowerCase() === "x") {
          event.preventDefault()
          workspace?.toggleSplit("dock")
          workspace?.setActivePane("main")
          disarmPrefix()
          return
        }
        if (event.key.toLowerCase() === "o") {
          event.preventDefault()
          if (activePane === "main") workspace?.focusShell()
          else workspace?.setActivePane("main")
          disarmPrefix()
          return
        }
        if (/^[0-4]$/.test(event.key)) {
          event.preventDefault()
          navigate(windowRoutes[Number(event.key)])
          disarmPrefix()
          return
        }
        disarmPrefix()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      window.clearTimeout(prefixTimer.current)
    }
  }, [palette, workspace, navigate, prefixArmed, activePane])

  useEffect(() => {
    if (reducedMotion || requested.pathname !== "/" || (requested.hash && requested.hash !== "#home")) {
      setStarting(false)
    }
  }, [reducedMotion, requested])

  useLayoutEffect(() => {
    if (starting || !focusAfterStartup.current) return
    focusAfterStartup.current = false
    const target = screenRef.current?.querySelector("main")
    target?.setAttribute("tabindex", "-1")
    target?.focus({ preventScroll: true })
  }, [starting])

  useEffect(() => {
    if (address(requested) === address(displayedRef.current) || reducedMotion) {
      setDisplayed(requested)
      setPhase("idle")
      return
    }

    setPhase("leaving")
    const timer = window.setTimeout(() => {
      setDisplayed(requested)
      setPhase("entering")
    }, 140)
    return () => window.clearTimeout(timer)
  }, [requested, reducedMotion])

  useEffect(() => {
    if (phase !== "entering") return undefined
    const fallback = window.setTimeout(() => setPhase("idle"), 340)
    return () => window.clearTimeout(fallback)
  }, [phase])

  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (screenRef.current) screenRef.current.scrollTop = 0
    scrollWindowTopInstant()
    const heading = screenRef.current?.querySelector("h1, h2")
    const target = heading && getComputedStyle(heading).visibility !== "hidden"
      ? heading
      : screenRef.current?.querySelector("main")
    if (target) {
      target.setAttribute("tabindex", "-1")
      target.focus({ preventScroll: true })
    }
  }, [displayed])

  function onDividerPointerDown(event) {
    if (!workspaceRef.current || !workspace?.setSplitRatio) return
    event.preventDefault()
    const rect = workspaceRef.current.getBoundingClientRect()
    const isVertical = splitMode === "vertical"

    function onMove(moveEvent) {
      const next = isVertical
        ? (moveEvent.clientX - rect.left) / rect.width
        : (moveEvent.clientY - rect.top) / rect.height
      workspace.setSplitRatio(Math.max(0.28, Math.min(0.76, next)))
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }

  function onDividerKeyDown(event) {
    if (!workspace?.setSplitRatio) return
    const delta = splitMode === "vertical"
      ? (event.key === "ArrowLeft" ? -0.04 : event.key === "ArrowRight" ? 0.04 : 0)
      : (event.key === "ArrowUp" ? -0.04 : event.key === "ArrowDown" ? 0.04 : 0)
    if (!delta) return
    event.preventDefault()
    workspace.setSplitRatio((r) => Math.max(0.28, Math.min(0.76, r + delta)))
  }

  async function copyCurlCommand() {
    const cmd = `curl -sL ${window.location.origin}`
    try {
      await navigator.clipboard.writeText(cmd)
      setCurlCopied(true)
      window.setTimeout(() => setCurlCopied(false), 1800)
    } catch {
      workspace?.toggleSplit("vertical")
      workspace?.focusShell()
    }
  }

  const isSplit = splitMode !== "dock"
  const splitStyle = isSplit ? { "--split-primary": `${(splitRatio * 100).toFixed(2)}%` } : undefined
  const hideMain = zoomed && isSplit && activePane === "shell"
  const hideSplitShell = !isSplit || (zoomed && activePane === "main")

  return (
    <div
      className="session"
      data-theme={theme?.theme || DEFAULT_THEME.id}
      data-surface={surface}
    >
      <div className="session__window">
        <header className="session__topbar" aria-label="Terminal session bar">
          <div className="session__topbar-left">
            <span className="session__topbar-host">{`${profile.handle}@portfolio`}</span>
            <span aria-hidden="true" className="session__topbar-sep">/</span>
            <span className="session__topbar-cwd">{task.path}</span>
            <button
              type="button"
              className="session__topbar-curl"
              onClick={copyCurlCommand}
              title="Copy curl command to view this portfolio in your terminal"
            >
              {curlCopied ? "copied curl" : "curl -sL"}
            </button>
          </div>

          <div className="session__topbar-right">
            {cairoClock ? (
              <span className="session__topbar-clock" title="Cairo, Egypt local time">
                {`CAI ${cairoClock}`}
              </span>
            ) : null}

            <button
              type="button"
              className="session__topbar-btn"
              aria-pressed={isSplit}
              onClick={() => {
                const next = splitMode === "dock" ? "vertical" : splitMode === "vertical" ? "horizontal" : "dock"
                workspace?.toggleSplit(next)
                if (next !== "dock") workspace?.focusShell()
              }}
              title='Cycle tmux split pane (Ctrl+B % vertical, Ctrl+B " horizontal)'
            >
              <span>{splitMode === "dock" ? "split" : splitMode === "vertical" ? "split:v" : "split:h"}</span>
            </button>

            {palette ? (
              <button
                type="button"
                className="session__topbar-btn session__topbar-palette"
                onClick={palette.open}
                aria-label="Open fuzzy command palette"
              >
                <span>fzf</span>
                <kbd className="tui-kbd">{isMac ? "⌘K" : "Ctrl+K"}</kbd>
              </button>
            ) : null}
          </div>
        </header>

        <div
          ref={workspaceRef}
          className={`session__workspace session__workspace--${splitMode}${zoomed ? " session__workspace--zoomed" : ""}`}
          style={splitStyle}
        >
          {!hideMain ? (
            <div
              ref={screenRef}
              className={`session__screen session__screen--${phase}${isSplit && activePane === "main" ? " session__pane--active" : ""}`}
              inert={phase === "leaving"}
              onPointerDown={() => workspace?.setActivePane("main")}
              onAnimationEnd={(event) => {
                if (event.target === event.currentTarget && phase === "entering") setPhase("idle")
              }}
            >
              {starting && !reducedMotion
                ? <TerminalStartup onComplete={finishStartup} />
                : children(displayed)}
            </div>
          ) : null}

          {isSplit && !zoomed ? (
            <div
              role="separator"
              tabIndex={0}
              aria-orientation={splitMode === "vertical" ? "vertical" : "horizontal"}
              aria-label="Resize tmux panes"
              aria-valuenow={Math.round(splitRatio * 100)}
              aria-valuemin={28}
              aria-valuemax={76}
              className="session__divider"
              onPointerDown={onDividerPointerDown}
              onKeyDown={onDividerKeyDown}
            />
          ) : null}

          {!hideSplitShell ? (
            <TerminalShell
              path={workspace?.shellCwd || task.path}
              mode={splitMode}
              active={isSplit && activePane === "shell"}
              zoomed={zoomed}
              onActivate={() => workspace?.setActivePane("shell")}
              onOpenPalette={palette?.open}
            />
          ) : null}
        </div>

        <TerminalStatusBar location={displayed} prefixArmed={prefixArmed} />
      </div>

      {palette ? <CommandPalette open={palette.isOpen} onClose={palette.close} isMac={isMac} /> : null}
    </div>
  )
}
