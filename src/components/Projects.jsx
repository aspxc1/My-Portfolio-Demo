import { useState } from "react"
import { sections } from "../content/site.js"
import { projects } from "../lib/projects.js"
import ProjectCard from "./ProjectCard.jsx"
import ProjectRow from "./ProjectRow.jsx"
import SectionHeading from "./SectionHeading.jsx"
import Toggle from "./Toggle.jsx"
import "./Projects.css"

const section = sections.projects

/** "all" plus every category used in content/projects.js, without duplicates. */
const categories = ["all", ...new Set(projects.map((project) => project.category))]

export default function Projects() {
  const [view, setView] = useState("list") // "list" or "grid"
  const [category, setCategory] = useState("all")

  const visible = category === "all" ? projects : projects.filter((project) => project.category === category)

  return (
    <section aria-labelledby="projects-title" id={section.id} className="section">
      <div className="container section-inner">
        <SectionHeading path={section.path} command={section.command} id="projects-title" />

        <div className="projects__controls">
          <div role="group" aria-label="Filter by category" className="projects__filters">
            {categories.map((c) => (
              <Toggle key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </Toggle>
            ))}
          </div>
          <div role="group" aria-label="Layout" className="projects__views">
            <span className="projects__view-label">view:</span>
            <Toggle active={view === "list"} onClick={() => setView("list")}>
              list
            </Toggle>
            <Toggle active={view === "grid"} onClick={() => setView("grid")}>
              grid
            </Toggle>
          </div>
        </div>

        <p className="projects__total" aria-live="polite">
          {`total ${visible.length}`}
        </p>

        {view === "list" ? (
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
              {visible.map((project) => (
                <ProjectRow key={project.slug} project={project} />
              ))}
            </ul>
          </div>
        ) : (
          <ul className="projects__grid">
            {visible.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
