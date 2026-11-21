import { Link } from "react-router"
import { statusLabel } from "../lib/projects.js"
import "./ProjectRow.css"

export default function ProjectRow({ project, startHere = false, selected = false, onInspect }) {
  const status = statusLabel[project.status]
  return (
    <Link
      to={`/projects/${project.slug}`}
      className={selected ? "project-row project-row--selected" : "project-row"}
      onMouseEnter={onInspect}
      onFocus={onInspect}
    >
      <span
        className={project.status === "archived" ? "project-row__status project-row__status--archived" : "project-row__status"}
        aria-label={status.label}
      >
        {status.glyph}
      </span>

      <span className="project-row__name">
        {project.name}
        {startHere ? <span className="project-start">Start here</span> : null}
      </span>

      <span className="project-row__year-mobile">{project.year}</span>
      <span className="project-row__tagline">{project.tagline}</span>
      <span className="project-row__stack">{project.stack.slice(0, 3).join(", ")}</span>
      <span className="project-row__year">{project.year}</span>
      <span aria-hidden="true" className="project-row__arrow">→</span>
    </Link>
  )
}
