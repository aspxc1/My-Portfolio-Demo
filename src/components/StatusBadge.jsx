import { statusLabel } from "../lib/projects.js"
import "./StatusBadge.css"

/** e.g. "[+] SHIPPED". Archived projects are shown in grey instead of amber. */
export default function StatusBadge({ status }) {
  const { glyph, label } = statusLabel[status]
  const className = status === "archived" ? "status-badge status-badge--archived" : "status-badge"

  return (
    <span className={className}>
      <span aria-hidden="true">{glyph}</span>
      {label}
    </span>
  )
}
