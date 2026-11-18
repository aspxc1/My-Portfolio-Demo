import { useEffect, useState } from "react"
import { profile } from "../content/site.js"
import { getContributionOverview, getGitHubUsername, loadContributions } from "../lib/githubActivity.js"
import { loadRepositories } from "../lib/githubRepositories.js"
import GitHubHeatmap from "./GitHubHeatmap.jsx"
import GitHubProcesses from "./GitHubProcesses.jsx"
import "./GitHubMonitor.css"

const github = profile.links.find(link => link.icon === "github")
const username = getGitHubUsername(github?.href)
const updatedLabel = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })
const displayCount = number => number?.toLocaleString("en") ?? "—"
const formatUpdated = date => updatedLabel.format(new Date(date))

function useActivitySource(load, enabled) {
  const [result, setResult] = useState({ status: "loading" })
  const [request, retry] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let active = true
    setResult({ status: "loading" })
    load(username).then(
      data => { if (active) setResult({ status: "loaded", data }) },
      error => { if (active) setResult({ status: "error", error }) },
    )
    return () => { active = false }
  }, [enabled, load, request])

  return { ...result, retry: () => retry(value => value + 1) }
}

function SourceStatus({ source, name, label, fallback }) {
  const limited = source.error?.status === 429
  const message = source.status === "loading" ? `Loading ${name}…`
    : limited ? `Rate limit reached for ${name}. Try again later.`
    : `${label} is unavailable right now.`
  return (
    <div className="htop__status">
      <p>{message}{source.status === "error" && fallback ? ` ${fallback}` : ""}</p>
      {source.status === "error" ? <button className="text-link" type="button" onClick={source.retry}>Retry {name}</button> : null}
    </div>
  )
}

export default function GitHubMonitor({ enabled }) {
  const contributions = useActivitySource(loadContributions, enabled)
  const repositories = useActivitySource(loadRepositories, enabled)
  const calendar = contributions.data
  const snapshot = repositories.data
  const overview = calendar ? getContributionOverview(calendar.days, calendar.updatedAt) : null
  const [help, setHelp] = useState(false)
  const [search, setSearch] = useState(false)

  const timestamps = [snapshot?.updatedAt, calendar?.updatedAt].filter(Boolean).sort()
  const latest = timestamps.at(-1)
  const separateTimes = latest && formatUpdated(timestamps[0]) !== formatUpdated(latest)
  function sourceAnnouncement(source, label) {
    if (source.status === "loading") return `Loading ${label}.`
    if (source.status === "loaded") return `${label} loaded.`
    return source.error?.status === 429 ? `Rate limit reached for ${label}.` : `Could not load ${label}.`
  }

  return (
    <section className="htop" aria-labelledby="htop-title">
      <header className="htop__section-heading htop__intro">
        <h2 id="htop-title">GitHub Activity Monitor</h2>
        <a className="text-link htop__identity" href={github?.href}>@{username}</a>
      </header>
      <div className="htop__dashboard">
        <p role="status" className="sr-only">{sourceAnnouncement(contributions, "contribution history")}</p>
        <p role="status" className="sr-only">{sourceAnnouncement(repositories, "repository data")}</p>
        <section className="htop__pane" aria-labelledby="htop-session">
          <div className="htop__section-heading"><h3 id="htop-session">Session stats</h3></div>
          <dl className="htop__stats">
            <div><dt>Uptime:</dt><dd>{overview?.streak == null ? "—" : `${overview.streak} ${overview.streak === 1 ? "day" : "days"}`} <small>current streak</small></dd></div>
            <div><dt>Load:</dt><dd>{overview ? overview.load.map(displayCount).join(" / ") : "—"} <small>contributions (1d / 7d / 30d)</small></dd></div>
            <div><dt>Tasks:</dt><dd>{displayCount(snapshot?.repos.length)} <small>{snapshot?.hasMore ? "public repos shown" : "public repos"}</small></dd></div>
          </dl>
        </section>
        <section className="htop__pane" aria-label="Contribution history">
          {calendar ? <GitHubHeatmap weeks={calendar.weeks.slice(-13)} /> : <SourceStatus source={contributions} name="contribution history" label="Contribution history" />}
        </section>
      </div>
      {snapshot ? (
        <GitHubProcesses snapshot={snapshot} search={search} />
      ) : (
        <section className="htop__processes" aria-labelledby="htop-process-title">
          <div className="htop__section-heading"><h3 id="htop-process-title">Repository processes</h3></div>
          <SourceStatus source={repositories} name="repository data" label="Repository data" fallback={calendar ? "Contribution history is still available above." : null} />
        </section>
      )}
      {help ? (
        <div id="htop-help" className="htop__help">
          <p>Choose a column heading to sort. Focus a repository and use ↑/↓ to select a row, Page Up/Page Down to change pages, or Home/End to jump. TIME+ is the last push date (UTC); %MEM is each repository’s share of the displayed repository size.</p>
          <p>Load counts GitHub calendar contributions, not just commits. The current streak can continue from yesterday if there are none today.</p>
        </div>
      ) : null}
      <footer className="htop__footer">
        <div className="htop__keys" role="group" aria-label="Monitor controls">
          <button type="button" className="htop__key" aria-expanded={help} aria-controls={help ? "htop-help" : undefined} onClick={() => setHelp(value => !value)}>
            <span aria-hidden="true">F1</span><span>Help</span>
          </button>
          {snapshot?.repos.length ? <button type="button" className="htop__key" aria-expanded={search} aria-controls="htop-search" onClick={() => setSearch(value => !value)}>
            <span aria-hidden="true">F3</span><span>Search</span>
          </button> : null}
        </div>
        <div className="htop__source">
          <p>Last updated: {latest ? (
            separateTimes
              ? <>repos <time dateTime={snapshot.updatedAt}>{formatUpdated(snapshot.updatedAt)} UTC</time> · contributions <time dateTime={calendar.updatedAt}>{formatUpdated(calendar.updatedAt)} UTC</time></>
              : <time dateTime={latest}>{formatUpdated(latest)} UTC</time>
          ) : "—"}</p>
          <p>Cached for 1 hour · <a className="text-link" href="https://github.com/grubersjoe/github-contributions-api">Contribution feed</a></p>
        </div>
      </footer>
    </section>
  )
}
