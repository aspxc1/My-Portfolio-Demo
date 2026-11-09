import { profile, sections } from "../content/site.js"
import useTerminalRun from "../lib/useTerminalRun.js"
import TerminalCommand from "./TerminalCommand.jsx"
import "./HomeListing.css"
import { Link } from "react-router"

function stripProtocol(url) {
  return url.replace(/^https?:\/\/(www\.)?/, "")
}

/** Sections show up as folders, links as symlinks, files (like a resume) as files. */
const entries = [
  ...Object.values(sections).map((section) => ({
    perms: "drwxr-xr-x",
    name: `${section.path.replace(/^~\//, "")}/`,
    href: `/#${section.id}`,
    kind: "dir",
  })),
  ...profile.links.map((link) => ({
    perms: link.kind === "file" ? "-rw-r--r--" : "lrwxrwxrwx",
    name: link.label,
    href: link.href,
    kind: link.kind,
    target: link.kind === "link" ? stripProtocol(link.href) : null,
  })),
]

export default function HomeListing({ enabled = true }) {
  const run = useTerminalRun("ls -la ~", { enabled })

  return (
    <nav ref={run.ref} aria-label="Site" className={`listing terminal-run terminal-run--${run.stage}`} style={run.style}>
      <p className="listing__command">
        <TerminalCommand command="ls -la ~" />
      </p>
      <div className="listing__output" inert={!run.finished}>
        <p aria-hidden="true" className="listing__muted">{`total ${entries.length}`}</p>

        <ul className="listing__list">
          {entries.map((entry) => {
            const isExternal = entry.kind !== "dir"
            const nameClass = entry.kind === "dir" ? "listing__name listing__name--dir" : "listing__name"
            const Row = isExternal ? "a" : Link

            return (
              <li key={entry.name}>
                <Row
                  {...(isExternal ? { href: entry.href } : { to: entry.href })}
                  className="listing__row"
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                >
                  <span aria-hidden="true" className="listing__faint">
                    {entry.perms}
                  </span>
                  <span aria-hidden="true" className="listing__faint listing__owner">
                    {profile.handle}
                  </span>
                  <span className="listing__file">
                    <span className={nameClass}>{entry.name}</span>
                    {entry.target ? <span className="listing__muted">{` -> ${entry.target}`}</span> : null}
                    {isExternal ? <span className="sr-only"> (opens in new tab)</span> : null}
                  </span>
                </Row>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
