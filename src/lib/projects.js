import projects from "../content/projects.json"

export { projects }

export function getProject(slug) {
  return projects.find((project) => project.slug === slug)
}

/** How each project status is displayed. */
export const statusLabel = {
  shipped: { glyph: "[+]", label: "Shipped" },
  "in-progress": { glyph: "[~]", label: "In progress" },
  archived: { glyph: "[-]", label: "Archived" },
}
