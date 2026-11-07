import { Link, useParams } from "react-router"
import StatusBadge from "../components/StatusBadge.jsx"
import { profile } from "../content/site.js"
import { getProject, projects } from "../lib/projects.js"
import NotFoundPage from "./NotFoundPage.jsx"
import "./ProjectPage.css"

/** The page at /projects/:slug, e.g. /projects/lecture-rag */
export default function ProjectPage() {
  const { slug } = useParams()
  const project = getProject(slug)
  if (!project) return <NotFoundPage />

  // Prev/next wrap around, so the last project links back to the first.
  const index = projects.findIndex((p) => p.slug === slug)
  const prev = projects[(index - 1 + projects.length) % projects.length]
  const next = projects[(index + 1) % projects.length]

  const details = [
    { label: "Year", value: project.year },
    { label: "Category", value: project.category },
    { label: "Stack", value: project.stack.join(", ") },
  ]

  return (
    <main className="container project-page">
      <title>{`${project.name} | ${profile.name}`}</title>
      <meta name="description" content={project.tagline} />

      <nav aria-label="Breadcrumb" className="project-page__breadcrumb">
        <ol>
          <li>
            <Link to="/">~</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/#projects">projects</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="project-page__breadcrumb-current">
            {project.slug}
          </li>
        </ol>
      </nav>

      <header className="project-page__header">
        <StatusBadge status={project.status} />
        <h1 className="project-page__title">{project.name}</h1>
        <p className="project-page__tagline">{project.tagline}</p>

        {project.links.length > 0 ? (
          <ul className="project-page__links">
            {project.links.map((link, i) => (
              <li key={link.href + link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className={i === 0 ? "project-page__button project-page__button--primary" : "project-page__button"}
                >
                  {link.label}
                  <span aria-hidden="true">{"->"}</span>
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <div className="project-page__columns">
        <div className="project-page__main">
          <section aria-labelledby="overview" className="project-page__section">
            <h2 id="overview" className="label">
              Overview
            </h2>
            <div className="project-page__description">
              {project.description.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section aria-labelledby="features" className="project-page__section">
            <h2 id="features" className="label">
              Features
            </h2>
            <ul className="project-page__features">
              {project.highlights.map((highlight) => (
                <li key={highlight}>
                  <span aria-hidden="true" className="project-page__arrow">
                    {">"}
                  </span>
                  {highlight}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside aria-label="Details" className="project-page__section">
          <h2 className="label">Details</h2>
          <dl className="kv-list">
            {details.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      <nav aria-label="More projects" className="project-page__pager">
        <Link to={`/projects/${prev.slug}`} className="project-page__pager-link">
          <span className="project-page__pager-hint">{"← prev"}</span>
          <span className="project-page__pager-name">{prev.name}</span>
        </Link>
        <Link to={`/projects/${next.slug}`} className="project-page__pager-link project-page__pager-link--next">
          <span className="project-page__pager-hint">{"next →"}</span>
          <span className="project-page__pager-name">{next.name}</span>
        </Link>
      </nav>
    </main>
  )
}
