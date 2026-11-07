# Portfolio Site: Project Context

Paste this file into a new chat to pick up where the last one left off.

## Goal

A personal portfolio for a computer engineering student who is focused on **software engineering (backend / full-stack) and AI/ML**, not hardware. The most important requirement: it must **not** look AI-generated or "vibe coded". ASCII art and terminal references are welcome. Avoid generic AI looks (purple gradients, glowing blobs, gradient hero stats, emoji icons, rounded cards with a colored left-border stripe).

## Stack

The owner wants code they can read and edit by hand, so keep it simple:

- **React 19 with plain JavaScript (`.jsx`)**. No TypeScript.
- **Plain CSS**. Each component has its own `.css` file next to it; shared colors, reset and helpers are in `src/styles/global.css`. No Tailwind.
- **Vite** runs the dev server and builds the site (`pnpm dev`, `pnpm build`). Config is `vite.config.js`.
- **React Router** (`react-router`) for the `/projects/:slug` pages. Routes are in `src/App.jsx`.
- No database. All content is static config in `src/content/`.
- Deployed on Vercel as a static site. `vercel.json` sends every URL to `index.html` so project pages work on refresh.
- Package manager: pnpm.

## Design direction: "terminal"

- **Palette (5 colors, CSS variables in `src/styles/global.css`):**
  - `#0f0f10` terminal black (`--background`)
  - `#18181a` graphite (`--card`)
  - `#e7e5e0` paper white (`--foreground`)
  - `#8b8a87` gray (`--muted-foreground`)
  - `#e9a23b` amber phosphor (`--primary`, links, focus ring)
- **Fonts (2, loaded from Google Fonts in `index.html`):** JetBrains Mono for headings, labels and code; IBM Plex Sans for body text.
- **Rules:**
  - Use the CSS variables, never raw colors.
  - Ligatures are off site-wide so `->` and ASCII diagrams render literally.
  - ASCII diagrams use only plain characters (`+ - | > < ^ v`).
  - Status markers are text: `[+]` shipped, `[~]` in progress, `[-]` archived.
  - Section headings: a `~/path` label plus a shell command (`$ whoami`, `$ ls ./projects`, `$ git log --activities`, `$ ping`).
  - Breakpoints: 640px, 768px, 1024px (min-width media queries, mobile first).
- Dark only (theme color `#0f0f10`).

## Editing content (all in `src/content/`)

- `site.js`: name, handle, school, status, summary, email, links (github/linkedin/resume), page title, footer text, hero ASCII art + neofetch rows, section ids/commands/nav labels, about facts, skills, rate-limits table, contact blurb.
- `projects.js`: the projects array (fields documented at the top of the file). Add an object and it shows in the list, grid, and gets `/projects/<slug>`. Filter categories are generated from the `category` values used.
- `extracurriculars.js`: activities shown as a `git log`. `end: "present"` adds a current tag. Commit hashes are generated.

## File map

```
index.html                   the single HTML page; loads fonts and src/main.jsx
vite.config.js               dev server settings
vercel.json                  SPA rewrite + security headers
src/
  main.jsx                   starts React, wraps the app in the router
  App.jsx                    routes: / , /projects/:slug , 404
  styles/global.css          colors, fonts, reset, shared helpers (.container, .section, .label, .kv-list, .text-link, .sr-only), animations
  content/                   all site text (see above)
  lib/projects.js            getProject(slug), statusLabel
  pages/
    HomePage.jsx             Hero > About > Projects > Extracurriculars > Contact
    ProjectPage.jsx + .css   project page (diagram, overview, features, details, links, prev/next)
    NotFoundPage.jsx + .css
  components/                each has a matching .css file
    SiteHeader               sticky nav built from `sections`
    Hero                     neofetch-style block (ASCII initials + info rows) + summary + status
    HomeListing              `ls -la ~` listing used as the main navigation (sections + links)
    About                    info table, rate-limits joke table, stack grid
    Projects                 category filter, list/grid toggle (uses Toggle, ProjectRow, ProjectCard)
    Extracurriculars         git-log style timeline
    Contact                  fake ping output
    SectionHeading, StatusBadge, SiteFooter
    ScrollToHash.jsx         scrolls to #about etc. after navigation (React Router doesn't do it)
```

## Current state

- **Done:** all sections, extracurriculars, both project views, detail pages, mobile layout. Rewritten from Next.js + TypeScript + Tailwind to React + JS + plain CSS with an identical look.
- **Placeholder content:** "Alex Rivera", six sample SWE/ML projects, four sample extracurriculars, links to `your-username` / example.com.
- **Missing:** `public/resume.pdf`.
