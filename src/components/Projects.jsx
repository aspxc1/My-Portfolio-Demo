import { useContext, useState } from "react"
import { Link, useNavigate } from "react-router"
import { projects, statusLabel } from "../lib/projects.js"
import { profile, sections } from "../content/site.js"
import { ProjectBrowsing } from "./PortfolioSession.jsx"
import TerminalSection from "./TerminalSection.jsx"
import Toggle from "./Toggle.jsx"
import ProjectRow from "./ProjectRow.jsx"
import ProjectCard from "./ProjectCard.jsx"
import "./Projects.css"

const section = sections.projects
const categories = ["all", ...new Set(projects.map((p) => p.category))]
const startProject = projects.find((project) => project.featured) || projects[0]

/**
 * Projects rendered as a yazi/ranger TUI file explorer (list + live preview pane),
 * preserving list/grid controls at >=6 projects and category filters when multiple categories exist.
 * Strictly respects empty projects.json without auto-populating.
 */
export default function Projects({ onReady, onNavigate }) {
  const browsing = useContext(ProjectBrowsing)
  const navigate = useNavigate()
  const local = useState({ view: "list", category: "all" })
  const [{ view, category }, setBrowsing] = browsing || local

  const hasFilters = projects.length >= 6 && categories.length > 2
  const hasViews = projects.length >= 6
  const activeCategory = hasFilters ? category : "all"
  const activeView = hasViews ? view : "list"

  const visible = activeCategory === "all" ? projects : projects.filter((p) => p.category === activeCategory)
  const [selectedSlug, setSelectedSlug] = useState(visible[0]?.slug || null)
  const activeProject = visible.find((p) => p.slug === selectedSlug) || visible[0] || null

  const setCategory = (next) => setBrowsing((current) => ({ ...current, category: next }))
  const setView = (next) => setBrowsing((current) => ({ ...current, view: next }))

  function onListKeyDown(event) {
    if (!visible.length) return
    const idx = visible.findIndex((p) => p.slug === activeProject?.slug)
    if (event.key === "ArrowDown" || event.key === "j") {
      event.preventDefault()
      setSelectedSlug(visible[(idx + 1) % visible.length].slug)
    } else if (event.key === "ArrowUp" || event.key === "k") {
      event.preventDefault()
      setSelectedSlug(visible[(idx - 1 + visible.length) % visible.length].slug)
    } else if (event.key === "Enter" && activeProject) {
      event.preventDefault()
      navigate(`/projects/${activeProject.slug}`)
    }
  }

  return (
    <TerminalSection section={section} onReady={onReady} onNavigate={onNavigate}>
      {projects.length === 0 ? (
        <div className="projects__empty-frame tui-frame">
          <span className="tui-frame__legend" aria-hidden="true">yazi · ~/projects</span>
          <p className="projects__empty-meta">total 0</p>
          <p className="projects__empty-dir"><span>drwxr-xr-x</span><span>{profile.handle}</span><span>./</span></p>
          <p className="projects__empty-dir"><span>drwxr-xr-x</span><span>{profile.handle}</span><span>../</span></p>
          <p className="projects__empty">No projects listed yet.</p>
        </div>
      ) : (
        <>
          {hasFilters || hasViews ? (
            <div className="projects__controls">
              {hasFilters ? (
                <div role="group" aria-label="Filter by category" className="projects__filters">
                  {categories.map((cat) => (
                    <Toggle
                      key={cat}
                      pressed={activeCategory === cat}
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </Toggle>
                  ))}
                </div>
              ) : null}

              {hasViews ? (
                <div role="group" aria-label="View mode" className="projects__views">
                  <span className="projects__view-label">view:</span>
                  <Toggle pressed={activeView === "list"} onClick={() => setView("list")}>list</Toggle>
                  <Toggle pressed={activeView === "grid"} onClick={() => setView("grid")}>grid</Toggle>
                </div>
              ) : null}
            </div>
          ) : null}

          <p className="projects__total" role="status">
            {visible.length === projects.length
              ? `total ${projects.length} ${projects.length === 1 ? "project" : "projects"}`
              : `showing ${visible.length} of ${projects.length} in ${activeCategory}`}
          </p>

          {activeView === "list" ? (
            <div className="projects__yazi" onKeyDown={onListKeyDown}>
              <div className="projects__table tui-frame">
                <span className="tui-frame__legend" aria-hidden="true">~/projects</span>
                <div aria-hidden="true" className="projects__table-head">
                  <span>st</span>
                  <span>name</span>
                  <span>summary</span>
                  <span>stack</span>
                  <span>year</span>
                  <span />
                </div>
                <ul className="projects__rows">
                  {visible.map((project) => (
                    <li key={project.slug}>
                      <ProjectRow
                        project={project}
                        startHere={projects.length > 1 && project === startProject}
                        selected={activeProject?.slug === project.slug}
                        onInspect={() => setSelectedSlug(project.slug)}
                      />
                    </li>
                  ))}
                </ul>
              </div>

              {activeProject ? (
                <aside className="projects__preview tui-frame" aria-label="Selected project preview">
                  <span className="tui-frame__legend" aria-hidden="true">
                    {`preview · ${activeProject.slug}`}
                  </span>
                  <div className="projects__preview-meta">
                    <span className="projects__preview-status">
                      {`${statusLabel[activeProject.status].glyph} ${statusLabel[activeProject.status].label}`}
                    </span>
                    <span>{`${activeProject.year} · ${activeProject.category}`}</span>
                  </div>
                  <h2 className="projects__preview-title">{activeProject.name}</h2>
                  <p className="projects__preview-tagline">{activeProject.tagline}</p>

                  {activeProject.problem ? (
                    <div className="projects__preview-block">
                      <span className="projects__preview-key">problem</span>
                      <p>{activeProject.problem}</p>
                    </div>
                  ) : null}

                  {activeProject.outcome ? (
                    <div className="projects__preview-block">
                      <span className="projects__preview-key">outcome</span>
                      <p>{activeProject.outcome}</p>
                    </div>
                  ) : null}

                  {activeProject.stack?.length ? (
                    <div className="projects__preview-block">
                      <span className="projects__preview-key">stack</span>
                      <p className="projects__preview-stack">{activeProject.stack.join(" · ")}</p>
                    </div>
                  ) : null}

                  <Link to={`/projects/${activeProject.slug}`} className="projects__preview-open">
                    {`man ${activeProject.slug} →`}
                  </Link>
                </aside>
              ) : null}
            </div>
          ) : (
            <ul className="projects__grid">
              {visible.map((project) => (
                <ProjectCard key={project.slug} project={project} startHere={projects.length > 1 && project === startProject} />
              ))}
            </ul>
          )}
        </>
      )}
    </TerminalSection>
  )
}
