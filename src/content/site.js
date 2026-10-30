/**
 * Personal info and site copy. Edit this file to make the site yours.
 * Projects live in content/projects.js, extracurriculars in content/extracurriculars.js.
 */

export const profile = {
  name: "Alex Rivera",
  /** Short lowercase username, shown in the header prompt and terminal output. */
  handle: "arivera",
  role: "Computer Engineering student",
  school: "State University",
  location: "Austin, TX",
  status: "Open to summer 2027 SWE / ML internships",
  summary:
    "I like building the parts of software you don't see: APIs, data pipelines, and the services that keep them fast. Lately that has meant a lot of retrieval and ML tooling too.",
  email: "alex.rivera@example.com",
  /**
   * External links. Shown in the hero listing and the contact section.
   * kind "file" renders like a file (e.g. a resume PDF in /public), "link" like a symlink.
   * Remove an entry to hide it everywhere.
   */
  links: [
    { label: "github", href: "https://github.com/your-username", kind: "link" },
    { label: "linkedin", href: "https://www.linkedin.com/in/your-username", kind: "link" },
    { label: "resume.pdf", href: "/resume.pdf", kind: "file" },
  ],
}

export const site = {
  /** Browser tab title and search description. */
  title: `${profile.name} | Software Engineer`,
  description: profile.summary,
  footer: "built by hand, no templates",
}

export const hero = {
  /**
   * ASCII art shown in the neofetch block. Generate your own initials at
   * https://patorjk.com/software/taag (font "Slant" works well) and paste it here.
   */
  asciiArt: String.raw`    ___    ____
   /   |  / __ \
  / /| | / /_/ /
 / ___ |/ _, _/
/_/  |_/_/ |_|`,
  /** Key/value rows in the neofetch block. */
  neofetch: [
    { key: "OS", value: `Computer Engineering @ ${profile.school}` },
    { key: "Uptime", value: "3rd year, graduating May 2027" },
    { key: "Focus", value: "backend, full-stack, applied ML" },
    { key: "Shell", value: "zsh + neovim" },
    { key: "Location", value: profile.location },
  ],
}

/** Section ids, terminal-style headings, and header nav labels, in page order. */
export const sections = {
  about: { id: "about", path: "~/about", command: "whoami", nav: "about" },
  projects: { id: "projects", path: "~/projects", command: "ls ./projects", nav: "projects" },
  extracurriculars: {
    id: "extracurriculars",
    path: "~/extracurriculars",
    command: "git log --activities",
    nav: "activities",
  },
  contact: { id: "contact", path: "~/contact", command: `ping ${profile.handle}`, nav: "contact" },
}

export const about = {
  facts: [
    { key: "Program", value: "B.S. Computer Engineering" },
    { key: "Expected grad", value: "May 2027" },
    { key: "Interests", value: "Distributed systems, APIs, RAG / LLM tooling" },
    { key: "Currently", value: "TA for Data Structures" },
    { key: "Learning", value: "Kubernetes, model evaluation" },
  ],
  skills: [
    { group: "Languages", items: ["TypeScript", "Python", "Go", "Java", "SQL", "C++"] },
    { group: "Backend", items: ["Node.js", "FastAPI", "PostgreSQL", "Redis", "gRPC", "Docker"] },
    { group: "Frontend", items: ["React", "Next.js", "Tailwind CSS"] },
    { group: "ML / AI", items: ["PyTorch", "scikit-learn", "NumPy", "Hugging Face", "pgvector"] },
  ],
  /** A tongue-in-cheek table. Delete the rows array contents to hide it. */
  rateLimits: {
    rows: [
      { resource: "coffee", limit: "3", window: "per day" },
      { resource: "open browser tabs", limit: "214", window: "per session" },
      { resource: "side projects in flight", limit: "4", window: "concurrent" },
      { resource: "meetings before 10am", limit: "0", window: "per day" },
    ],
    footnote: "* Requests over the limit return 429 Too Many Requests.",
  },
}

export const contact = {
  blurb:
    "I'm looking for internships and interesting problems, especially backend and ML work. Email is the fastest way to reach me, and I usually reply within a day.",
}
