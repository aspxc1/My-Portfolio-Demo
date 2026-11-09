import { useState } from "react"
import { sections } from "../content/site.js"
import { projects } from "../lib/projects.js"
import ProjectCard from "./ProjectCard.jsx"
import ProjectRow from "./ProjectRow.jsx"
import TerminalSection from "./TerminalSection.jsx"
import Toggle from "./Toggle.jsx"
import "./Projects.css"

const section = sections.projects

/** "all" plus every category used in content/projects.json, without duplicates. */
const categories = ["all", ...new Set(projects.map((project) => project.category))]
const showControls = projects.length >= 6
const showFilters = showControls && categories.length > 2

export default function Projects({ onReady }) {
  const [view, setView] = useState("list") // "list" or "grid"
  const [category, setCategory] = useState("all")

  const activeCategory = showFilters && categories.includes(category) ? category : "all"
  const layout = showControls ? view : "grid"
  const visible = activeCategory === "all" ? projects : projects.filter((project) => project.category === activeCategory)

  return (
    <TerminalSection section={section} onReady={onReady}>
      {showControls ? (
        <div className="projects__controls">
          {showFilters ? (
            <div role="group" aria-label="Filter by category" className="projects__filters">
              {categories.map((c) => (
                <Toggle key={c} active={activeCategory === c} onClick={() => setCategory(c)}>
                  {c}
                </Toggle>
              ))}
            </div>
          ) : null}
          <div role="group" aria-label="Layout" className="projects__views">
            <span className="projects__view-label">view:</span>
            <Toggle active={view === "list"} onClick={() => setView("list")}>list</Toggle>
            <Toggle active={view === "grid"} onClick={() => setView("grid")}>grid</Toggle>
          </div>
        </div>
      ) : null}

      {projects.length === 0 ? (
        <p className="projects__empty">No projects listed yet.</p>
      ) : (
        <>
          <p className="projects__total" aria-live="polite">{`total ${visible.length}`}</p>
          {layout === "list" ? (
            <div className="projects__table">
              <div aria-hidden="true" className="projects__table-head">
                <span>Stat</span>
                <span>Name</span>
                <span>Description</span>
                <span>Stack</span>
                <span>Year</span>
                <span />
              </div>
              <ul className="projects__rows">
                {visible.map((project) => <ProjectRow key={project.slug} project={project} />)}
              </ul>
            </div>
          ) : (
            <ul className="projects__grid">
              {visible.map((project) => <ProjectCard key={project.slug} project={project} />)}
            </ul>
          )}
        </>
      )}
    </TerminalSection>
  )
}
