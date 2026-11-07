/**
 * Personal info and site copy. Edit this file to make the site yours.
 * Projects live in content/projects.js, extracurriculars in content/extracurriculars.js.
 */

export const profile = {
  name: "Aaser Mohamed",

  handle: "aasermo",
  role: "Computer & AI Engineering student",
  school: "Ain Shams University",
  location: "Cairo, Egypt",
  status: "Open to summer 2027 tech internships",
  summary:
    "Placeholder, imma do it later",
  email: "aaserzanaty@gmail.com",

  links: [
    { label: "github", href: "https://github.com/aspxc1", kind: "link" },
    { label: "linkedin", href: "https://www.linkedin.com/in/aaser-mohamed-695611352/", kind: "link" },
    { label: "resume.pdf", href: "/resume.pdf", kind: "file" },
  ],
}

export const site = {

  title: `${profile.name} | CE Student`,
  description: profile.summary,
}

export const hero = {

  neofetch: [
    { key: "OS", value: `Computer Engineering @ ${profile.school}` },
    { key: "Uptime", value: "2nd year, graduating May 2029" },
    { key: "Focus", value: "Backend/Fullstack SWE, Applied AI/ML" },
    { key: "Status", value: "Open to internships" },
    { key: "Location", value: profile.location },
  ],
}


export const sections = {
  about: { id: "about", path: "~/about", command: "whoami", nav: "about" },
  projects: { id: "projects", path: "~/projects", command: "ls ~/projects", nav: "projects" },
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
    { key: "Expected grad", value: "May 2029" },
    { key: "Interests", value: "" },
    { key: "Currently", value: "Student" },
    { key: "Learning", value: "Fullstack dev" },
  ],
  skills: [
    { group: "Languages", items: ["JavaScript", "Python", "Java", "SQL", "C++", "HTML", "CSS"] },
    { group: "Frameworks/Tools", items: ["Node.js", "SQLite", "PostgreSQL", "React"] },
    { group: "Platforms", items: ["Linux", "Github"] },
    { group: "ML / AI", items: ["PyTorch", "scikit-learn", "NumPy"] },
  ],
  /** A tongue-in-cheek table. Delete the rows array contents to hide it. */
  rateLimits: {
    rows: [
      { resource: "coffee", limit: "3", window: "per day" },
      { resource: "open browser tabs", limit: "214", window: "per session" },
      { resource: "side projects in flight", limit: "4", window: "concurrent" },
      { resource: "meetings before 10am", limit: "0", window: "per day" },
    ],

  },
}

export const contact = {
  blurb:
    "I'm looking for internships and interesting problems, especially backend/fullstack and ML work. LinkedIn and email are the fastest ways to reach me, and I usually reply within a day.",
}
