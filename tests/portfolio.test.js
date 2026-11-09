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

test("the initial terminal shows the identity and directory without loading later sections", () => {
  const html = render("/")
  assert.match(html, /id="hero-title"/)
  for (const id of ["about", "projects", "activities", "contact"]) {
    assert.doesNotMatch(html, new RegExp(`id="${id}"`))
    assert.match(html, new RegExp(`href="/#${id}"`))
  }
  assert.doesNotMatch(html, /site-header|hero__block-caret|class="hero__accent cursor"/)
})

test("a section deep link renders only that section with commands to navigate elsewhere", () => {
  for (const id of ["about", "projects", "activities", "contact"]) {
    const html = render(`/#${id}`)
    assert.match(html, new RegExp(`id="${id}"`))
    assert.doesNotMatch(html, /id="hero-title"/)
    for (const other of ["about", "projects", "activities", "contact"].filter((other) => other !== id)) {
      assert.doesNotMatch(html, new RegExp(`id="${other}"`))
    }
    assert.match(html, /aria-label="Run a command"/)
    assert.match(html, /cd ~/)
  }
})

test("legacy experience and extracurriculars links open the activities view", () => {
  for (const oldHash of ["experience", "extracurriculars"]) {
    const html = render(`/#${oldHash}`)
    assert.match(html, /id="activities"/)
    assert.doesNotMatch(html, /id="hero-title"/)
  }
})
