import assert from "node:assert/strict"
import { after, before, test } from "node:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router"
import { createServer } from "vite"

const baseProject = {
  slug: "with-images", name: "Media project", tagline: "A test project", year: "2026",
  status: "shipped", category: "web", stack: ["React"],
  description: ["Project overview."], highlights: [], links: [],
}
const fixtureProjects = [
  { ...baseProject, images: [{ src: "/images/project.webp", alt: "Project dashboard", caption: "The main view" }] },
  { ...baseProject, slug: "without-images" },
  { ...baseProject, slug: "empty-images", images: [] },
]
let server
let App

before(async () => {
  server = await createServer({
    server: { middlewareMode: true },
    plugins: [{
      name: "portfolio-test-content",
      enforce: "pre",
      load(id) {
        if (id.replaceAll("\\", "/").endsWith("/src/content/projects.json")) {
          return JSON.stringify(fixtureProjects)
        }
      },
    }],
  })
  App = (await server.ssrLoadModule("/src/App.jsx")).default
})
after(async () => { await server?.close() })

function render(path) {
  return renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [path] }, createElement(App)))
}

test("project details display supplied images with alt text and an optional caption", () => {
  const html = render("/projects/with-images")
  assert.match(html, /<img[^>]+src="\/images\/project.webp"[^>]+alt="Project dashboard"/)
  assert.match(html, /<figcaption[^>]*>The main view<\/figcaption>/)
})

test("projects without images have no gallery, gallery heading or reserved image area", () => {
  for (const slug of ["without-images", "empty-images"]) {
    const html = render(`/projects/${slug}`)
    assert.doesNotMatch(html, /project-gallery|<img|Screenshots/)
  }
})
