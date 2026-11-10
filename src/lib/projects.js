import projects from "../content/projects.json"

export { projects }

export function getProject(slug) {
  return projects.find((project) => project.slug === slug)
}

/** With two projects, show the other once; never generate a self-link. */
export function getProjectNeighbours(collection, slug) {
  const index = collection.findIndex((project) => project.slug === slug)
  if (collection.length < 2 || index < 0) return { prev: null, next: null }
  return {
    prev: collection.length > 2 ? collection[(index - 1 + collection.length) % collection.length] : null,
    next: collection[(index + 1) % collection.length],
  }
}

/** How each project status is displayed. */
export const statusLabel = {
  shipped: { glyph: "[+]", label: "Shipped" },
  "in-progress": { glyph: "[~]", label: "In progress" },
  archived: { glyph: "[-]", label: "Archived" },
}
