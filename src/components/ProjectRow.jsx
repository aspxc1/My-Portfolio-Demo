import { Link } from "react-router"
import { statusLabel } from "../lib/projects.js"
import "./ProjectRow.css"

/** One row in the projects list view. */
export default function ProjectRow({ project }) {
  const { glyph, label } = statusLabel[project.status]
  const statusClass =
    project.status === "archived" ? "project-row__status project-row__status--archived" : "project-row__status"

  return (
    <li>
      <Link to={`/projects/${project.slug}`} className="project-row">
        <span className={statusClass}>
          <span aria-hidden="true">{glyph}</span>
          <span className="sr-only">{label}</span>
        </span>
        <span className="project-row__name">{project.name}</span>
        <span className="project-row__year-mobile">{project.year}</span>
        <span className="project-row__tagline">{project.tagline}</span>
        <span className="project-row__stack">{project.stack.join(" · ")}</span>
        <span className="project-row__year">{project.year}</span>
        <span aria-hidden="true" className="project-row__arrow">
          →
        </span>
      </Link>
    </li>
  )
}
