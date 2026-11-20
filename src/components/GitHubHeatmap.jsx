import { useState } from "react"

const dateLabel = (date) => new Date(date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
const monthShort = (date) => new Date(date).toLocaleDateString("en", { month: "short", timeZone: "UTC" })
const daysByKey = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 }

export default function GitHubHeatmap({ weeks }) {
  const [selectedDate, setSelectedDate] = useState(null)
  const days = weeks.flat().filter(Boolean)
  const selected = days.find((day) => day.date === selectedDate) || days.at(-1)

  const monthLabels = weeks.map((week, idx) => {
    const first = week.find(Boolean)
    if (!first) return ""
    const label = monthShort(first.date)
    const prevFirst = idx > 0 ? weeks[idx - 1].find(Boolean) : null
    if (!prevFirst || monthShort(prevFirst.date) !== label) return label
    return ""
  })

  function onCalendarKey(event) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    const step = daysByKey[event.key]
    if (step === undefined && event.key !== "Home" && event.key !== "End") return
    event.preventDefault()
    event.stopPropagation()
    const next = event.key === "Home" ? 0 : event.key === "End" ? days.length - 1 : days.indexOf(selected) + step
    setSelectedDate(days[Math.max(0, Math.min(days.length - 1, next))].date)
  }

  return (
    <>
      <div className="htop__section-heading">
        <h3>Contribution history</h3>
        <span>Last 13 weeks</span>
      </div>
      <p id="htop-calendar-help" className="sr-only">
        Use the arrow keys to inspect days. Left and right move by week. Home and End move to the first and last day.
      </p>
      <div
        className="htop__calendar"
        tabIndex={0}
        role="group"
        data-keyboard-scope="calendar"
        aria-label="Contribution calendar"
        aria-describedby="htop-calendar-help htop-calendar-day"
        onKeyDown={onCalendarKey}
      >
        <div className="htop__months" aria-hidden="true">
          <span className="htop__day-gutter-spacer" />
          <div className="htop__month-row">
            {monthLabels.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
        </div>

        <div className="htop__grid-wrap" aria-hidden="true">
          <div className="htop__day-gutter">
            <span />
            <span>M</span>
            <span />
            <span>W</span>
            <span />
            <span>F</span>
            <span />
          </div>
          <div className="htop__weeks">
            {weeks.map((week) => (
              <div className="htop__week" key={week.find(Boolean).date}>
                {week.map((day, row) => day ? (
                  <span
                    key={day.date}
                    className="htop__cell"
                    data-level={day.level}
                    data-selected={selected.date === day.date || undefined}
                    title={`${dateLabel(day.date)}: ${day.count}`}
                    onPointerEnter={() => setSelectedDate(day.date)}
                    onPointerDown={() => setSelectedDate(day.date)}
                  />
                ) : <span key={row} />)}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="htop__heat-details">
        <p id="htop-calendar-day" aria-live="polite">
          {dateLabel(selected.date)} · {selected.count} {selected.count === 1 ? "contribution" : "contributions"}
        </p>
        <div className="htop__legend" aria-hidden="true">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => <span key={level} className="htop__cell" data-level={level} />)}
          <span>More</span>
        </div>
      </div>
    </>
  )
}
