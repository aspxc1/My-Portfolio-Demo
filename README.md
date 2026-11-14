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

## Cloudflare Workers

The repository includes Wrangler configuration for a static-assets Worker named
`aasermo`. Use the same Worker name in the Cloudflare dashboard (or update
`name` in `wrangler.json` to match an existing Worker).

For the connected GitHub build, set:

- Root directory: the repository root
- Build command: `pnpm run build`
- Deploy command: `pnpm run deploy`
- Non-production branch deploy command, if enabled: `pnpm exec wrangler versions upload`

Wrangler serves `dist/` with single-page-app fallback, including direct project
links. It is pinned as a development dependency. `pnpm-workspace.yaml` permits
only the required `esbuild` and `workerd` dependency install scripts.

To check the deployment locally without publishing:

```sh
pnpm install --frozen-lockfile
pnpm run build
pnpm run deploy:check
```

Cloudflare runs deployment after a GitHub push. For manual deployment, run
`pnpm run deploy` after building and authenticating with Cloudflare.

## Edit content

Edit `src/content/site.js` for profile, contact and stack information.
Projects and experience/club entries come from `src/content/projects.json`
and `src/content/activities.json`. See `src/content/README.md` for their format.
