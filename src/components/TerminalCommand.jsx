import "./TerminalCommand.css"

/** The full command stays readable by assistive technology while its width types. */
export default function TerminalCommand({ command }) {
  return (
    <span className="terminal-command">
      <span aria-hidden="true" className="terminal-command__prompt">{"$ "}</span>
      <span className="terminal-command__text">{command}</span>
      <span aria-hidden="true" className="terminal-command__caret" />
    </span>
  )
}
