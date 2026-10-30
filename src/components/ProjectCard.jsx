import { Link } from "react-router"
import StatusBadge from "./StatusBadge.jsx"
import "./ProjectCard.css"

/** One card in the projects grid view. */
export default function ProjectCard({ project }) {
  return (
    <li className="project-card-item">
      <Link to={`/projects/${project.slug}`} className="project-card">
        <div className="project-card__top">
          <span className="project-card__category">{`~/${project.category}`}</span>
          <StatusBadge status={project.status} />
        </div>
        <pre aria-hidden="true" className="project-card__diagram">
          {project.diagram}
        </pre>
        <div className="project-card__body">
          <h3 className="project-card__name">{project.name}</h3>
          <p className="project-card__tagline">{project.tagline}</p>
        </div>
        <p className="project-card__meta">
          {project.stack.join(" · ")} <span aria-hidden="true">{"//"}</span> {project.year}
        </p>
      </Link>
    </li>
  )
}
