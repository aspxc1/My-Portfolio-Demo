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
  { ...baseProject, problem: "The problem to solve.", contribution: "My specific contribution.", outcome: "The measured outcome.", images: [{ src: "/images/project.webp", alt: "Project dashboard", caption: "The main view" }] },
  { ...baseProject, slug: "without-images" },
  { ...baseProject, slug: "empty-images", images: [] },
  { ...baseProject, slug: "null-images", images: null },
  { ...baseProject, slug: "blank-images", images: [{ src: "" }, null, { src: "   " }] },
]
let server
let App
let getProjectNeighbours
let GitHubProcesses
let GitHubHeatmap

before(async () => {
  server = await createServer({
    cacheDir: "node_modules/.vite-tests",
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
  getProjectNeighbours = (await server.ssrLoadModule("/src/lib/projects.js")).getProjectNeighbours
  GitHubProcesses = (await server.ssrLoadModule("/src/components/GitHubProcesses.jsx")).default
  GitHubHeatmap = (await server.ssrLoadModule("/src/components/GitHubHeatmap.jsx")).default
})
after(async () => { await server?.close() })

function render(path) {
  return renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [path] }, createElement(App)))
}

test("normal-motion browser arrival boots only Home, before mounting its commands", () => {
  globalThis.window = { matchMedia: () => ({ matches: false }) }
  try {
    for (const path of ["/", "/#home"]) {
      const html = render(path)
      assert.match(html, /aria-label="Terminal startup"/)
      assert.match(html, /Skip startup/)
      assert.match(html, /<title>Aaser Mohamed \| CE Student<\/title>/)
      assert.doesNotMatch(html, /id="hero-title"|terminal-run--typing|\.\/menu\.sh/)
    }
    for (const path of ["/#about", "/#projects", "/#contact", "/projects/with-images", "/missing"]) {
      assert.doesNotMatch(render(path), /aria-label="Terminal startup"/)
    }
  } finally {
    delete globalThis.window
  }
})

test("a fresh session starts with Kanagawa Wave on a flat surface; appearance drawer is collapsed", () => {
  for (const path of ["/", "/#about", "/projects/with-images"]) {
    const html = render(path)
    assert.match(html, /class="session"[^>]+data-theme="kanagawa"[^>]+data-surface="flat"/)
    assert.doesNotMatch(html, /terminal-starfield/)
    assert.match(html, /class="tmux-bar__control" aria-expanded="false" aria-controls="[^"]+"/)
    assert.match(html, /class="tmux-bar__settings"[^>]+hidden=""/)
    assert.doesNotMatch(html, /<select\b/)
  }
})

test("project details display supplied images with alt text and an optional caption", () => {
  const html = render("/projects/with-images")
  assert.match(html, /WITH-IMAGES\(1\)/)
  assert.match(html, /<img[^>]+src="\/images\/project.webp"[^>]+alt="Project dashboard"/)
  assert.match(html, /<figcaption[^>]*>The main view<\/figcaption>/)
})

test("projects without images have no gallery, gallery heading or reserved image area", () => {
  for (const slug of ["without-images", "empty-images", "null-images", "blank-images"]) {
    let html
    assert.doesNotThrow(() => { html = render(`/projects/${slug}`) })
    assert.doesNotMatch(html, /project-gallery|<img|Screenshots/)
  }
})

test("the initial terminal shows the identity and navigation without loading later sections", () => {
  const html = render("/")
  assert.match(html, /id="hero-title"/)
  for (const id of ["about", "projects", "activities", "contact"]) {
    assert.doesNotMatch(html, new RegExp(`id="${id}"`))
    assert.match(html, new RegExp(`href="/#${id}"`))
  }
  assert.doesNotMatch(html, /site-header|hero__block-caret|class="hero__accent cursor"/)
})

test("a section deep link renders only that section with named destinations to navigate elsewhere", () => {
  for (const id of ["about", "projects", "activities", "contact"]) {
    const html = render(`/#${id}`)
    assert.match(html, new RegExp(`id="${id}"`))
    assert.match(html, new RegExp(`<h1[^>]+id="${id}-title"`))
    assert.doesNotMatch(html, /id="hero-title"/)
    for (const other of ["about", "projects", "activities", "contact"].filter((other) => other !== id)) {
      assert.doesNotMatch(html, new RegExp(`id="${other}"`))
    }
    assert.match(html, /aria-label="Portfolio navigation"/)
    assert.match(html, /aria-label="Home"/)
  }
})

test("legacy experience and extracurriculars links open the activities view", () => {
  for (const oldHash of ["experience", "extracurriculars"]) {
    const html = render(`/#${oldHash}`)
    assert.match(html, /id="activities"/)
    assert.doesNotMatch(html, /id="hero-title"/)
  }
})

test("unknown fragments, including inherited object keys, safely return to the home terminal", () => {
  for (const hash of ["random", "constructor", "toString", "__proto__"]) {
    let html
    assert.doesNotThrow(() => { html = render(`/#${hash}`) })
    assert.match(html, /id="hero-title"/)
  }
})

test("reduced motion renders the selected output and home navigation immediately", () => {
  globalThis.window = { matchMedia: () => ({ matches: true }) }
  try {
    for (const path of ["/", "/#about", "/#projects", "/#activities", "/#contact"]) {
      const html = render(path)
      assert.doesNotMatch(html, /terminal-run--waiting|terminal-run--typing|terminal-run--queued| inert=""/)
      assert.doesNotMatch(html, /aria-label="Terminal startup"/)
      assert.match(html, /terminal-run--output/)
    }
  } finally {
    delete globalThis.window
  }
})

test("404 renders the actual requested pathname with a fuzzy route suggestion", () => {
  const html = render("/projcts")
  assert.match(html, /zsh: no such file or directory: \/projcts/)
  assert.match(html, /Did you mean/)
  assert.match(html, /~\/projects/)
})

test("home and section menus name destinations clearly without shell commands or file permissions", () => {
  for (const path of ["/", "/#about", "/#projects", "/#activities", "/#contact"]) {
    const html = render(path)
    const menu = html.match(/<nav[^>]+aria-label="Portfolio navigation"[\s\S]*?<\/nav>/)?.[0]
    assert.ok(menu, `A portfolio navigation menu is present at ${path}`)
    for (const label of ["About", "Projects", "Experience &amp; clubs", "Contact"]) {
      assert.match(menu, new RegExp(`aria-label="${label}"`))
    }
    assert.doesNotMatch(menu, /ls -la|whoami|git log|ping aaser|cd ~|drwx|lrwx/)
  }
})

test("the opening profile offers direct email and personal links without opening Contact", () => {
  const html = render("/")
  const contacts = html.match(/<nav[^>]+aria-label="Quick contact links"[\s\S]*?<\/nav>/)?.[0]
  assert.ok(contacts, "Direct contact links are present on the opening profile")
  assert.match(contacts, /href="mailto:aaserzanaty@gmail.com"/)
  assert.match(contacts, /href="https:\/\/github.com\/aspxc1"/)
  assert.match(contacts, /href="https:\/\/www.linkedin.com\/in\/aaser-mohamed-695611352\/"/)
  assert.match(contacts, /href="https:\/\/codeforces.com\/profile\/Aspxc1"/)
})

test("Home is listed as the current page in its own menu", () => {
  const html = render("/")
  assert.match(html, /<a[^>]+aria-label="Home"[^>]+aria-current="page"/)
})

test("About queues its stack and native htop output after whoami without a Codeforces widget", () => {
  const html = render("/#about")
  assert.match(html, /~\/about/)
  assert.match(html, /whoami/)
  assert.match(html, /terminal-run--queued[^>]*><p class="about__command"[^]*?tree ~\/stack[^]*?class="about__stack/)
  const listing = html.match(/<section class="about__stack[^"]*"[^>]*>([\s\S]*?)<\/section>/)[1]
  assert.deepEqual([...listing.matchAll(/<h2>(.*?)<\/h2>/g)].map((match) => match[1]), ["Languages", "Web", "Databases", "Tools"])
  assert.deepEqual([...listing.matchAll(/<li><span>(.*?)<\/span><\/li>/g)].map((match) => match[1]), [
    "TypeScript/JavaScript", "Python", "Java", "C++", "SQL", "Node.js", "Express.js", "HTML", "CSS",
    "PostgreSQL", "SQLite", "Linux", "Git/GitHub",
  ])
  assert.equal((listing.match(/<ul role="list">/g) || []).length, 4)
  assert.match(html, /terminal-run--queued[^>]*><p class="about__command"[^]*?>htop<\/span>/)
  assert.ok(html.indexOf("about__stack") < html.indexOf('id="htop-title"'))
  assert.match(html, /id="htop-title">GitHub Activity Monitor/)
  assert.match(html, /@aspxc1/)
  assert.match(html, /Loading contribution history/)
  assert.match(html, /Loading repository data/)
  assert.match(html, /Last updated/)
  assert.match(html, /Cached for 1 hour/)
  assert.doesNotMatch(html, /codeforces::/i)
  assert.doesNotMatch(render("/"), /id="htop-title"/)
})

test("reduced motion shows both About outputs immediately without a skip control", () => {
  globalThis.window = { matchMedia: () => ({ matches: true }) }
  try {
    const html = render("/#about")
    assert.equal((html.match(/about__run terminal-run terminal-run--output/g) || []).length, 2)
    assert.doesNotMatch(html, /about__output" inert|Skip animation/)
  } finally {
    delete globalThis.window
  }
})

test("htop heatmap renders interactive calendar cells and day details", () => {
  const weeks = [[
    { date: "2026-11-15", count: 0, level: 0 },
    { date: "2026-11-16", count: 3, level: 2 },
  ]]
  const html = renderToStaticMarkup(createElement(GitHubHeatmap, { weeks }))
  assert.match(html, /data-keyboard-scope="calendar"/)
  assert.match(html, /htop__heat-details/)
  assert.match(html, /3 contributions/)
})

test("htop renders four repos on the first page with a range and paging controls", () => {
  const repos = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1, name: `repo-${i + 1}`, url: `https://github.com/example/repo-${i + 1}`, language: "Python",
    pushedAt: `2026-11-${20 - i}T00:00:00Z`, size: 10,
  }))
  const html = renderToStaticMarkup(createElement(GitHubProcesses, { snapshot: { repos, totalSize: 60 } }))
  assert.equal((html.match(/data-repo=/g) || []).length, 4)
  assert.match(html, /1–4 of 6/)
  assert.match(html, /<button type="button" aria-disabled="true">← Prev/)
  assert.match(html, /<button type="button" aria-disabled="false">Next →/)
  assert.doesNotMatch(html, /repo-5|repo-6/)
})

test("neofetch shows all profile facts together without a disclosure or Learning row", () => {
  const html = render("/")
  const facts = html.match(/<dl class="hero__facts">[\s\S]*?<\/dl>/g)
  assert.equal(facts?.length, 1)
  assert.deepEqual([...facts[0].matchAll(/<dt>([^<]+)<\/dt>/g)].map(([, label]) => label), ["OS", "Uptime", "Focus", "Status", "Location"])
  assert.doesNotMatch(html, /<details\b|System details/)
  assert.doesNotMatch(html, /<dt>Learning<\/dt>|Backend Development/)
})

test("the menu is a queued script command following neofetch", () => {
  const html = render("/")
  assert.ok(html.indexOf("neofetch") < html.indexOf("./menu.sh"))
  assert.match(html, /terminal-menu terminal-run terminal-run--queued/)
  const menu = html.match(/<nav[^>]+aria-label="Portfolio navigation"[^>]*>/)?.[0]
  assert.match(menu, /inert=""/)
})

test("project context and overview precede the optional gallery, with clear return actions", () => {
  const html = render("/projects/with-images")
  for (const text of ["The problem to solve.", "My specific contribution.", "The measured outcome.", "Project overview."]) {
    assert.ok(html.includes(text), `${text} is rendered`)
    assert.ok(html.indexOf(text) < html.indexOf("project-gallery"), `${text} precedes images`)
  }
  assert.doesNotMatch(html, /id="features"/)
  assert.match(html, /href="\/#projects"[^>]*>All projects/)
  assert.match(html, /href="\/#contact"/)
})

test("small project collections default to the yazi directory list + preview pane with one starting cue", () => {
  const html = render("/#projects")
  assert.match(html, /projects__rows/)
  assert.match(html, /projects__preview/)
  assert.doesNotMatch(html, /projects__views/)
  assert.equal((html.match(/Start here/g) || []).length, 1)
})

test("project neighbours never link to the same project or duplicate the only other project", () => {
  const [a, b, c] = fixtureProjects
  assert.deepEqual(getProjectNeighbours([], "missing"), { prev: null, next: null })
  assert.deepEqual(getProjectNeighbours([a], a.slug), { prev: null, next: null })
  assert.deepEqual(getProjectNeighbours([a, b], a.slug), { prev: null, next: b })
  assert.deepEqual(getProjectNeighbours([a, b], b.slug), { prev: null, next: a })
  assert.deepEqual(getProjectNeighbours([a, b, c], a.slug), { prev: c, next: b })
  assert.deepEqual(getProjectNeighbours([a, b, c], "missing"), { prev: null, next: null })
})

test("the heading navigation control follows the routed h1 in keyboard order", () => {
  for (const path of ["/", "/#about", "/#projects", "/#activities", "/#contact"]) {
    const html = render(path)
    assert.ok(html.indexOf('class="navigation-jump"') > html.indexOf("</h1>"), `Tab after the heading reaches Navigate at ${path}`)
  }
})
