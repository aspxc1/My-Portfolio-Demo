import { useEffect, useRef, useState } from "react"

const columns = [
  { key: "id", label: "PID" },
  { key: "name", label: "Repository", short: "Repo" },
  { key: "language", label: "Language", short: "Lang" },
  { key: "size", label: "%MEM", description: "Share of total repository size shown" },
  { key: "pushedAt", label: "TIME+", description: "Last push (UTC)" },
]
const pushDate = date => date ? new Date(date).toISOString().slice(0, 10) : "—"
const memory = (size, total) => total ? (100 * size / total).toFixed(1) + "%" : "—"
const pageSize = 4

function compare(a, b, key, descending) {
  if (a[key] === null) return b[key] === null ? a.name.localeCompare(b.name) : 1
  if (b[key] === null) return -1
  const result = typeof a[key] === "number" ? a[key] - b[key]
    : key === "pushedAt" ? Date.parse(a[key]) - Date.parse(b[key]) : a[key].localeCompare(b[key])
  return (descending ? -result : result) || a.name.localeCompare(b.name)
}

export default function GitHubProcesses({ snapshot }) {
  const [sort, setSort] = useState({ key: "pushedAt", descending: true })
  const [selectedId, setSelectedId] = useState(null)
  const tableBody = useRef(null)
  const focusPending = useRef(false)
  const rows = [...snapshot.repos].sort((a, b) => compare(a, b, sort.key, sort.descending))
  const index = Math.max(0, rows.findIndex(repo => repo.id === selectedId))
  const selected = rows[index]
  const pageStart = Math.floor(index / pageSize) * pageSize
  const pageEnd = Math.min(pageStart + pageSize, rows.length)

  useEffect(() => {
    if (!focusPending.current) return
    focusPending.current = false
    tableBody.current?.querySelector('a[tabindex="0"]')?.focus()
  }, [selected?.id])

  function sortBy(key) {
    setSelectedId(null)
    setSort(current => ({ key, descending: current.key === key ? !current.descending : key === "size" || key === "pushedAt" }))
  }

  function onRowKey(event, index) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    const steps = { ArrowUp: index - 1, ArrowDown: index + 1, PageUp: index - pageSize, PageDown: index + pageSize, Home: 0, End: rows.length - 1 }
    if (!Object.hasOwn(steps, event.key)) return
    event.preventDefault()
    event.stopPropagation()
    const next = rows[Math.max(0, Math.min(rows.length - 1, steps[event.key]))]
    if (next.id !== selected.id) {
      focusPending.current = true
      setSelectedId(next.id)
    }
  }

  return (
    <section className="htop__processes" aria-labelledby="htop-process-title" data-keyboard-scope="repositories">
      <div className="htop__section-heading">
        <h3 id="htop-process-title">Repository processes</h3>
        <p role="status">{selected ? `${pageStart + 1}–${pageEnd} of ${rows.length}` : "0 repos"} <span className="htop__row-hint" aria-hidden="true">· ↑↓ select</span></p>
      </div>
      {snapshot.hasMore ? <p className="htop__note">Showing the 100 most recently pushed public repositories.</p> : null}
      <div className="htop__table">
        <table aria-label="Public repositories" aria-describedby="htop-table-help">
          <thead><tr>
            {columns.map(({ key, label, short, description }) => (
              <th key={key} scope="col" aria-sort={sort.key === key ? (sort.descending ? "descending" : "ascending") : undefined}>
                <button type="button" aria-label={short ? label : undefined} title={description} onClick={() => sortBy(key)}>
                  {short ? <><span className="htop__full-label">{label}</span><span className="htop__short-label">{short}</span></> : label}
                  {description ? <span className="sr-only"> ({description})</span> : null}
                  {sort.key === key ? <span aria-hidden="true"> {sort.descending ? "↓" : "↑"}</span> : null}
                </button>
              </th>
            ))}
          </tr></thead>
          <tbody ref={tableBody}>
            {rows.slice(pageStart, pageEnd).map((repo, offset) => (
              <tr key={repo.id} data-repo={repo.id} data-selected={selected.id === repo.id || undefined} onClick={() => setSelectedId(repo.id)}>
                <td>{repo.id}</td>
                <td><a href={repo.url} tabIndex={selected.id === repo.id ? 0 : -1} onFocus={() => setSelectedId(repo.id)}
                  onKeyDown={(event) => onRowKey(event, pageStart + offset)}>{repo.name}</a></td>
                <td>{repo.language || "—"}</td>
                <td>{memory(repo.size, snapshot.totalSize)}</td>
                <td>{pushDate(repo.pushedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > pageSize ? (
        <div className="htop__pager" role="group" aria-label="Repository pages">
          <button type="button" aria-disabled={!pageStart} onClick={() => {
            if (pageStart) setSelectedId(rows[pageStart - pageSize].id)
          }}>← Prev</button>
          <button type="button" aria-disabled={pageEnd === rows.length} onClick={() => {
            if (pageEnd < rows.length) setSelectedId(rows[pageEnd].id)
          }}>Next →</button>
        </div>
      ) : null}
      <p id="htop-table-help" className="sr-only">Choose a column heading to sort. Focus a repository link and use Up, Down, Home, or End to select a row, or Page Up and Page Down to change pages. Enter opens the repository.</p>
      <p role="status" className="htop__detail">{selected
        ? `${selected.name}${selected.stars ? ` ★${selected.stars}` : ""} · ${selected.language || "No language listed"} · ${selected.size.toLocaleString("en")} KB${snapshot.totalSize ? ` · ${memory(selected.size, snapshot.totalSize)} of displayed size` : ""}${selected.description ? ` — ${selected.description}` : ""}`
        : "No public repositories found."}</p>
      <p role="status" className="sr-only">Sorted by {columns.find(column => column.key === sort.key).label}, {sort.descending ? "descending" : "ascending"}.</p>
    </section>
  )
}
