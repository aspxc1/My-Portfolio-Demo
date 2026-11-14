import { useEffect, useRef } from "react"
import { profile, site } from "../content/site.js"
import "./TerminalStartup.css"

/** Short shell startup; routed commands mount only after this screen finishes. */
export default function TerminalStartup({ onComplete }) {
  const skipRef = useRef(null)

  useEffect(() => {
    const timer = window.setTimeout(() => onComplete(document.activeElement === skipRef.current), 1380)
    const onKeyDown = (event) => {
      if (event.key !== "Escape" || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      event.preventDefault()
      onComplete(true)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [onComplete])

  return (
    <main className="terminal-startup container" aria-label="Terminal startup">
      <title>{site.title}</title>
      <meta name="description" content={site.description} />
      <p role="status" className="sr-only">Starting the portfolio terminal. Press Escape to skip.</p>
      <div aria-hidden="true" className="terminal-startup__output">
        <p className="terminal-startup__line terminal-startup__identity">{`${profile.handle}@portfolio`}</p>
        <p className="terminal-startup__line"><span className="terminal-startup__ok">[ OK ]</span> Theme loaded.</p>
        <p className="terminal-startup__line"><span className="terminal-startup__ok">[ OK ]</span> Navigation ready.</p>
        <p className="terminal-startup__line"><span className="terminal-startup__ok">[ OK ]</span> Session initialized.</p>
        <p className="terminal-startup__line terminal-startup__welcome">Welcome, visitor.</p>
        <p className="terminal-startup__line terminal-startup__prompt">
          <span>{profile.handle}@portfolio</span><span className="terminal-startup__path">:~$ </span>
          <span className="terminal-cursor" />
        </p>
      </div>
      <button ref={skipRef} type="button" className="terminal-startup__skip" onClick={() => onComplete(true)}>
        Skip startup <kbd>Esc</kbd>
      </button>
    </main>
  )
}
