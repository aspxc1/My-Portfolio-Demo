# Terminal portfolio

A personal portfolio built with React, React Router and Vite, with animated
ASCII, terminal-style navigation, accent controls and background presets.

## Run locally

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. In Windows PowerShell, use `pnpm.cmd` or `npm.cmd`
if the shell blocks the corresponding PowerShell script.

## Verify and build

```sh
pnpm test
pnpm build
pnpm preview
```

The production output is written to `dist/`. When choosing static hosting,
configure unknown paths to serve `index.html` so project detail links work.

## Edit content

Edit `src/content/site.js` for profile, contact and stack information.
Projects and experience/club entries come from `src/content/projects.json`
and `src/content/activities.json`. See `src/content/README.md` for their format.
