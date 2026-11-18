const paths = {
  "TypeScript/JavaScript": "m8 6-6 6 6 6m8-12 6 6-6 6m-2-15-4 18",
  Python: "M9 4h6a3 3 0 0 1 3 3v3a2 2 0 0 1-2 2H8a3 3 0 0 0-3 3v2m10 3H9a3 3 0 0 1-3-3v-3a2 2 0 0 1 2-2h8a3 3 0 0 0 3-3V7M10 7h.01M14 17h.01",
  Java: "M4 11h12v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zm12 0h2a2 2 0 0 1 0 4h-2M3 22h15M10 3c3 2-3 3 0 5",
  "C++": "M10 6a6 6 0 1 0 0 12m4-8v4m-2-2h4m4-2v4m-2-2h4",
  SQL: "M19 6c0 2-3 3-7 3S5 8 5 6s3-3 7-3 7 1 7 3ZM5 6v12c0 2 3 3 7 3s7-1 7-3V6M5 12c0 2 3 3 7 3s7-1 7-3",
  "Node.js": "m12 3 8 4.5v9L12 21l-8-4.5v-9ZM9 15V9l6 6V9",
  "Express.js": "m13 3-8 11h6l-1 7 9-12h-6z",
  HTML: "m8 7-6 5 6 5m8-10 6 5-6 5",
  CSS: "m10 3-3 18m10-18-3 18M4 9h16M3 15h16",
  PostgreSQL: "M19 6c0 2-3 3-7 3S5 8 5 6s3-3 7-3 7 1 7 3ZM5 6v12c0 2 3 3 7 3s7-1 7-3V6M5 12c0 2 3 3 7 3s7-1 7-3",
  SQLite: "M5 3h10l4 4v14H5zM14 3v5h5M8 12h8m-8 4h8",
  Linux: "m4 6 6 6-6 6m10 0h6",
  "Git/GitHub": "M6 8v8m12-8a6 6 0 0 1-6 6H6m12-6a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
}

export default function StackIcon({ name }) {
  return (
    <span className="about__stack-icon" aria-hidden="true">
      {Object.hasOwn(paths, name) ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d={paths[name]} />
        </svg>
      ) : "·"}
    </span>
  )
}
