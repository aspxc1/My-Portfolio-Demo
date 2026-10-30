/**
 * Shown in the order written here (put the newest first).
 *
 * Fields:
 *   role        Your title, e.g. "Workshop Lead".
 *   org         Organization name.
 *   orgUrl      Optional link for the organization name. Delete the line for no link.
 *   start, end  Free text dates. Use end: "present" for ongoing activities; they get a "current" tag.
 *   summary     One or two sentences.
 *   highlights  Bullet points. Use [] for none.
 */
export const extracurriculars = [
  {
    role: "Workshop Lead",
    org: "Machine Learning Club",
    orgUrl: "https://example.com/",
    start: "Sep 2025",
    end: "present",
    summary:
      "Run the club's applied ML workshop series. Each session builds one small, working thing end to end instead of slides about theory.",
    highlights: [
      "Wrote and taught 8 workshops, from linear regression to a RAG chatbot",
      "Grew weekly attendance from about 15 to 60 students",
      "Maintain the shared GPU notebook setup the club uses",
    ],
  },
  {
    role: "Backend Lead",
    org: "HackState (university hackathon)",
    orgUrl: "https://example.com/",
    start: "Jan 2025",
    end: "present",
    summary:
      "Own the registration and judging platform for a 400-person annual hackathon.",
    highlights: [
      "Rebuilt check-in on Postgres and FastAPI, cutting the line from 40 to 10 minutes",
      "Built a judging app that assigns judges to projects without conflicts",
    ],
  },
  {
    role: "Competitor",
    org: "ICPC Regional Team",
    start: "Sep 2024",
    end: "Nov 2025",
    summary: "Three-person team, weekly practice contests and two regional competitions.",
    highlights: ["Placed 14th of 120 teams at the 2025 South Central regional"],
  },
  {
    role: "Contributor",
    org: "Open source",
    orgUrl: "https://github.com/",
    start: "Jun 2024",
    end: "present",
    summary: "Small fixes and features in tools I use every day.",
    highlights: [
      "Merged PRs into a Python HTTP client and a Postgres migration tool",
      "Wrote the docs page on connection pooling for a Go ORM",
    ],
  },
]
