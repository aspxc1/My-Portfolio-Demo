/**
 * Personal info and site copy. Edit this file to make the site yours.
 * Projects live in projects.json, activities in activities.json. See README.md here for examples.
 */

export const profile = {
  name: "Aaser Mohamed",

  handle: "aasermo",
  role: "Computer & AI Engineering student",
  school: "Ain Shams University",
  location: "Cairo, Egypt",
  summary:
    "Placeholder, imma do it later",
  email: "aaserzanaty@gmail.com",

  links: [
    { label: "github", href: "https://github.com/aspxc1", kind: "link" },
    { label: "linkedin", href: "https://www.linkedin.com/in/aaser-mohamed-695611352/", kind: "link" },
    { label: "codeforces", href: "https://codeforces.com/profile/Aspxc1", kind: "link" },
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
  about: { id: "about", path: "~/about", command: "whoami", nav: "About", description: "Introduction & stack" },
  projects: { id: "projects", path: "~/projects", command: "ls ~/projects", nav: "Projects", description: "Selected work" },
  activities: {
    id: "activities",
    path: "~/activities",
    command: "git log --oneline",
    nav: "Activities",
    description: "Roles & involvement",
  },
  contact: { id: "contact", path: "~/contact", command: `ping ${profile.handle}`, nav: "Contact", description: "Get in touch" },
}

export const about = {
  currently: [
    { label: "learning", description: "Full-stack development, with a focus on the backend." },
  ],
  skills: [
    { group: "Languages", items: ["JavaScript", "Python", "Java", "C++", "SQL"] },
    { group: "Web", items: ["Node.js", "Express.js", "React", "HTML", "CSS"] },
    { group: "Databases", items: ["PostgreSQL", "SQLite"] },
    // Set hidden to false to show this group again.
    { group: "ML / AI", hidden: true, items: ["PyTorch", "scikit-learn", "NumPy"] },
    { group: "Tools", items: ["Linux", "Git/GitHub"] },
  ],
}

export const contact = {
  blurb:
    "I'm looking for internships and interesting problems, especially backend/fullstack and ML work. LinkedIn and email are the fastest ways to reach me, and I usually reply within a day.",
}
