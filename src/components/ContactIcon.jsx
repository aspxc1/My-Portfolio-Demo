/** Consistently stroked icons; visible labels carry the accessible name. */
export default function ContactIcon({ name }) {
  const paths = {
    email: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></>,
    github: <path d="m8 8-4 4 4 4m8-8 4 4-4 4m-5 2 2-12" />,
    linkedin: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 10v7m4 0v-7m0 3a3 3 0 0 1 6 0v4M7 7h.01" /></>,
    codeforces: <path d="M5 20v-8h4v8m2 0V4h4v16m2 0V8h4v12M3 20h19" />,
    resume: <path d="M14 3H5v18h14V8Zm0 0v5h5M8 12h8m-8 4h6" />,
  }
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || paths.resume}
    </svg>
  )
}
