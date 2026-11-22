import "./TerminalCommand.css"

/** Consistent zsh prompt sign (%) with accessible full command text. */
export default function TerminalCommand({ command }) {
  return (
    <span className="terminal-command">
      <span aria-hidden="true" className="terminal-command__prompt">{"% "}</span>
      <span className="terminal-command__field">
        <span className="terminal-command__text">{command}</span>
        <span aria-hidden="true" className="terminal-command__caret-track">
          <span className="terminal-cursor terminal-command__caret" />
        </span>
      </span>
    </span>
  )
}
