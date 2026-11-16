import { useEffect, useRef, useState } from "react"
import { profile } from "../content/site.js"
import { getGitHubUsername, loadContributions } from "../lib/githubActivity.js"
import ContactIcon from "./ContactIcon.jsx"
import "./GitHubActivity.css"

const github = profile.links.find(link => link.icon === "github")
const username = getGitHubUsername(github?.href)
const mobileQuery = "(max-width: 639px)"
const dateLabel = date => new Date(`${date}T00:00:00Z`).toLocaleDateString("en", {month:"short",day:"numeric",year:"numeric",timeZone:"UTC"})

export default function GitHubActivity() {
  const [request, setRequest] = useState(0)
  const [result, setResult] = useState({status:"loading",data:null})
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.matchMedia(mobileQuery).matches)
  const [fullYear, setFullYear] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [visible, setVisible] = useState(false)
  const root = useRef(null)
  const calendarScroll = useRef(null)

  useEffect(() => {
    let active = true
    setResult({status:"loading",data:null})
    loadContributions(username).then(
      data => { if (active) setResult({status:"loaded",data}) },
      () => { if (active) setResult({status:"error",data:null}) },
    )
    return () => { active = false }
  }, [request])

  useEffect(() => {
    const query = window.matchMedia(mobileQuery)
    const onChange = event => setMobile(event.matches)
    query.addEventListener("change",onChange)
    return () => query.removeEventListener("change",onChange)
  }, [])

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") { setVisible(true); return }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect() }
    }, {threshold:0.15})
    observer.observe(root.current)
    return () => observer.disconnect()
  }, [])

  const compact = mobile && !fullYear
  const weeks = compact ? result.data?.weeks.slice(-13) : result.data?.weeks
  const days = weeks?.flat().filter(Boolean) || []
  const selected = days.find(day => day.date === selectedDate) || days.at(-1)
  const total = compact ? days.reduce((sum,day) => sum + day.count,0) : result.data?.total || 0
  const activeDays = compact ? days.filter(day => day.count > 0).length : result.data?.activeDays || 0
  const months = weeks?.map((week,index) => {
    const day = index === 0 ? week.find(Boolean) : week.find(day => day?.date.endsWith("-01"))
    return day ? new Date(`${day.date}T00:00:00Z`).toLocaleDateString("en",{month:"short",timeZone:"UTC"}) : ""
  })

  useEffect(() => {
    if (calendarScroll.current) calendarScroll.current.scrollLeft = calendarScroll.current.scrollWidth
  }, [mobile, fullYear, result.data])

  function onCalendarKey(event) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    const step = {ArrowLeft:-7,ArrowRight:7,ArrowUp:-1,ArrowDown:1}[event.key]
    if (step === undefined && event.key !== "Home" && event.key !== "End") return
    event.preventDefault()
    event.stopPropagation()
    const current = days.indexOf(selected)
    const next = event.key === "Home" ? 0 : event.key === "End" ? days.length - 1 : Math.max(0,Math.min(days.length - 1,current + step))
    setSelectedDate(days[next].date)
    root.current?.querySelector(`[data-date="${days[next].date}"]`)?.scrollIntoView({block:"nearest",inline:"nearest"})
  }

  return (
    <section ref={root} className={`github-activity github-activity--${result.status}`} data-visible={visible || undefined} aria-labelledby="github-activity-title">
      <div className="github-activity__header">
        <h2 id="github-activity-title">GitHub activity</h2>
        <a className="text-link github-activity__profile" href={github?.href} target="_blank" rel="noreferrer">
          <ContactIcon name="github" />@{username}<span className="sr-only"> on GitHub (opens in new tab)</span>
        </a>
      </div>
      <div className="github-activity__body" aria-busy={result.status === "loading"}>
        {result.status === "loading" ? <p role="status" className="github-activity__message">Loading contribution history…</p> : null}
        {result.status === "error" ? (
          <div className="github-activity__message">
            <p role="status">Contribution history is unavailable right now.</p>
            <button className="text-link github-activity__retry" type="button" onClick={() => setRequest(value => value + 1)}>Try again</button>
          </div>
        ) : null}
        {result.data ? (
          <>
            <div className="github-activity__period">
              <p>{compact ? "Last 13 weeks" : "Last 12 months"}</p>
              {mobile ? <button type="button" aria-pressed={fullYear} onClick={() => setFullYear(value => !value)} className="text-link">{fullYear ? "Show recent weeks" : "View full year"}</button> : null}
            </div>
            <p id="github-activity-help" className="sr-only">Use arrow keys to inspect days; left and right move by week. Home and End move to the first and last day.</p>
            <div ref={calendarScroll} className="github-activity__scroll" tabIndex={0} role="group" data-keyboard-scope="calendar" aria-label="Contribution calendar" aria-describedby="github-activity-help github-activity-day" onKeyDown={onCalendarKey}>
              <div className="github-activity__calendar" style={{"--weeks":weeks.length}} aria-hidden="true">
                <div className="github-activity__months">{months.map((month,index) => <span key={index}>{month}</span>)}</div>
                <div className="github-activity__weekdays"><span>Mon</span><span>Wed</span><span>Fri</span></div>
                <div className="github-activity__weeks">
                  {weeks.map((week,index) => (
                    <div key={week.find(Boolean).date} className="github-activity__week" style={{"--week-delay":`${index * 6}ms`}}>
                      {week.map((day,row) => day ? (
                        <span key={day.date} className="github-activity__day" data-level={day.level} data-date={day.date} data-selected={selected?.date === day.date || undefined}
                          title={`${day.count} ${day.count === 1 ? "contribution" : "contributions"} on ${dateLabel(day.date)}`}
                          onPointerMove={() => setSelectedDate(day.date)} onPointerDown={() => setSelectedDate(day.date)} />
                      ) : <span key={`empty-${row}`} />)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="github-activity__details">
              <p id="github-activity-day" aria-live="polite">{dateLabel(selected.date)}<span> / </span>{selected.count} {selected.count === 1 ? "contribution" : "contributions"}</p>
              <div className="github-activity__legend" aria-label="Contribution intensity from less to more"><span>Less</span>{[0,1,2,3,4].map(level => <span key={level} className="github-activity__day" data-level={level} aria-hidden="true" />)}<span>More</span></div>
            </div>
            <p className="github-activity__summary"><strong>{total.toLocaleString("en")}</strong> contributions <span>·</span> <strong>{activeDays}</strong> active days</p>
            {total === 0 ? <p className="github-activity__empty">No contributions recorded in this period.</p> : null}
          </>
        ) : null}
      </div>
      <p className="github-activity__source">Public profile data <span>·</span> refreshed hourly <span>·</span> via <a href="https://github.com/grubersjoe/github-contributions-api" className="text-link" target="_blank" rel="noreferrer">GitHub Contributions API<span className="sr-only"> (opens in new tab)</span></a></p>
    </section>
  )
}
