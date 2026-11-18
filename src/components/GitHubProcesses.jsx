import { useEffect, useRef, useState } from "react"

const columns = [
  { key: "id", label: "PID" },
  { key: "name", label: "Repository" },
  { key: "language", label: "Language" },
  { key: "size", label: "%MEM", description: "Share of total repository size shown" },
  { key: "pushedAt", label: "TIME+", description: "Last push (UTC)" },
]
const pushDate = date => date ? new Date(date).toISOString().slice(0, 10) : "—"
const memory = (size, total) => total ? (100 * size / total).toFixed(1) + "%" : "—"

function compare(a, b, key, descending) {
  if (a[key] === null) return b[key] === null ? a.name.localeCompare(b.name) : 1
  if (b[key] === null) return -1
  const result = typeof a[key] === "number" ? a[key] - b[key]
    : key === "pushedAt" ? Date.parse(a[key]) - Date.parse(b[key]) : a[key].localeCompare(b[key])
  return (descending ? -result : result) || a.name.localeCompare(b.name)
}

export default function GitHubProcesses({ snapshot, search }) {
  const [sort, setSort] = useState({ key: "pushedAt", descending: true })
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState("")
  const input = useRef(null)
  const match = search ? query.trim().toLowerCase() : ""
  const rows = snapshot.repos.filter(repo => [repo.name, repo.language].some(value => value?.toLowerCase().includes(match)))
    .sort((a, b) => compare(a, b, sort.key, sort.descending))
  const selected = rows.find(repo => repo.id === selectedId) || rows[0]

  useEffect(() => {
    if (search) input.current?.focus()
  }, [search])

  function sortBy(key) {
    setSort(current => ({ key, descending: current.key === key ? !current.descending : key === "size" || key === "pushedAt" }))
  }

  function onRowKey(event, index) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    const steps = { ArrowUp: index - 1, ArrowDown: index + 1, Home: 0, End: rows.length - 1 }
    if (!Object.hasOwn(steps, event.key)) return
    event.preventDefault()
    event.stopPropagation()
    const next = rows[Math.max(0, Math.min(rows.length - 1, steps[event.key]))]
    event.currentTarget.closest("tbody").querySelector(`[data-repo="${next.id}"] a`).focus()
  }

  return (
    <section className="htop__processes" aria-labelledby="htop-process-title" data-keyboard-scope="repositories">
      <div className="htop__section-heading">
        <h3 id="htop-process-title">Repository processes</h3>
        <p>{rows.length} {rows.length === 1 ? "repo" : "repos"} shown <span className="htop__row-hint">· ↑↓ select</span></p>
      </div>
      {snapshot.hasMore ? <p className="htop__note">Showing the 100 most recently pushed public repositories.</p> : null}
      <div id="htop-search" className="htop__process-tools" hidden={!search}>
        <label><span className="sr-only">Filter by repository or language</span>
          <input ref={input} type="search" placeholder="Repository or language" value={query} onChange={event => setQuery(event.target.value)} />
        </label>
      </div>
      <div className="htop__table">
        <table aria-label="Public repositories" aria-describedby="htop-table-help">
          <thead><tr>
            {columns.map(({ key, label, description }) => (
              <th key={key} scope="col" aria-sort={sort.key === key ? (sort.descending ? "descending" : "ascending") : undefined}>
                <button type="button" title={description} onClick={() => sortBy(key)}>
                  {label}{description ? <span className="sr-only"> ({description})</span> : null}
                  {sort.key === key ? <span aria-hidden="true"> {sort.descending ? "↓" : "↑"}</span> : null}
                </button>
              </th>
            ))}
          </tr></thead>
          <tbody>
            {rows.map((repo, index) => (
              <tr key={repo.id} data-repo={repo.id} data-selected={selected.id === repo.id || undefined} onClick={() => setSelectedId(repo.id)}>
                <td>{repo.id}</td>
                <td><a href={repo.url} tabIndex={selected.id === repo.id ? 0 : -1} onFocus={() => setSelectedId(repo.id)}
                  onKeyDown={(event) => onRowKey(event, index)}>{repo.name}</a></td>
                <td>{repo.language || "—"}</td>
                <td>{memory(repo.size, snapshot.totalSize)}</td>
                <td>{pushDate(repo.pushedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p id="htop-table-help" className="sr-only">Choose a column heading to sort. Focus a repository link and use Up, Down, Home, or End to select a row. Enter opens the repository.</p>
      <p role="status" className="htop__detail">{selected
        ? `${selected.name} · ${selected.language || "No language listed"} · ${selected.size.toLocaleString("en")} KB${snapshot.totalSize ? ` · ${memory(selected.size, snapshot.totalSize)} of displayed size` : ""}`
        : snapshot.repos.length ? "No repositories match this search." : "No public repositories found."}</p>
      <p role="status" className="sr-only">Sorted by {columns.find(column => column.key === sort.key).label}, {sort.descending ? "descending" : "ascending"}.</p>
    </section>
  )
}
