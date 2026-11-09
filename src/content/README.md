# Editing portfolio content

Edit `projects.json` to add projects and `activities.json` to add activities.
Each file is a JSON array: copy an example below into the matching file, replace
the sample text, then add more objects separated by commas. Entries display in
the order you write them, so put your preferred projects and newest activities first.

The examples below are templates; they are not displayed on the site.
Keep a file as `[]` if you have no entries yet.

## Projects

```json
[
  {
    "slug": "my-project",
    "name": "My project",
    "tagline": "A short description for the list and project header.",
    "year": "2026",
    "status": "in-progress",
    "category": "web",
    "stack": ["React", "Node.js", "PostgreSQL"],
    "images": [
      {
        "src": "/images/my-project/dashboard.webp",
        "alt": "The project dashboard showing recent tasks",
        "caption": "The main dashboard",
        "width": 1600,
        "height": 1000
      }
    ],
    "description": [
      "Explain the problem this project solves and who it is for.",
      "Describe your contribution and any interesting technical decisions."
    ],
    "highlights": [
      "One feature or result worth mentioning.",
      "Another feature or result."
    ],
    "links": [
      {
        "label": "Source",
        "href": "https://github.com/your-username/your-project"
      }
    ]
  }
]
```

- Give every project a unique `slug` using lowercase letters, numbers and hyphens.
  The example above automatically creates `/projects/my-project`.
- Use `shipped`, `in-progress`, or `archived` for `status`.
- Choose any `category`; the filter buttons are generated automatically. Avoid
  `all`, which is reserved for the filter that shows every project.
- `description` contains paragraphs; `highlights` contains feature bullets.
- The first `links` entry is the primary button. Add more entries for a live demo,
  documentation, or other links.
- Include all the fields shown. Use `[]` for `stack`, `description`, `highlights`,
  or `links` when you have no items to add. No diagram is needed.

Adding an entry updates the project list, grid, category filters and detail page.
Collections of fewer than six projects use a simple grid. At six projects,
list/grid controls appear; category filters appear when there are also multiple categories.

### Optional project images

Put image files in `public/images/my-project/`, then reference them with a path
starting at `/images/` as above. HTTPS image URLs work too. WebP, PNG, JPEG,
AVIF and GIF files are supported by the browser.

`images` is optional. Omit it or use `"images": []` to hide the entire screenshots
section, including its heading and spacing. Each image needs a `src`; add a
descriptive `alt` for accessibility. `caption`, `width` and `height` are optional;
supplying the original dimensions reserves the correct space while loading.
Images retain their proportions. An image that fails to load is removed, and
the gallery disappears if none remain.

## Activities

```json
[
  {
    "role": "Your role",
    "org": "Organization name",
    "orgUrl": "https://example.com",
    "start": "Sep 2026",
    "end": "present",
    "summary": "Briefly explain what you do and your contribution.",
    "highlights": [
      "An achievement or responsibility.",
      "Another contribution worth mentioning."
    ]
  }
]
```

- `role` and `org` appear together as the entry title.
- `orgUrl` is optional; leave it out or use `""` for no organization link.
- Dates are display text. Use `present` for `end` to show the current tag,
  or a date such as `Jun 2026` for a finished role.
- Include all fields except `orgUrl`. Use `[]` for `highlights` if you only want
  to show the summary.

## Saving changes

Use double quotes around JSON keys and text. JSON does not allow comments or
trailing commas. A JSON syntax error will be reported by Vite when it reads the file.

While `pnpm dev` is running, saving a JSON file updates the preview automatically.
For the live site, commit the JSON changes and run your usual build/deployment
workflow; these files are bundled into the site at build time.

Your name, summary, contact links and stack still live in `site.js`.
Stack groups can use `hidden: true` to hide them without deleting their contents.
To restore the ML / AI group, change its `hidden` value to `false` in `site.js`.

## Terminal navigation

The home view runs `neofetch` followed by its directory listing. Visitors choose
a section from that directory; later sections never open automatically. Each
section offers commands to return home or choose another section. Links such as
`/#projects`, `/#about`, `/#activities` and `/#contact` open a view directly and
work with browser Back/Forward. The old `/#experience` and `/#extracurriculars`
links still open activities. Refresh preserves the chosen view and resets its
scroll position. Reduced-motion preferences skip typing and the clear/reveal
transition, and pause the ASCII animation.
