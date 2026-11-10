import activities from "../content/activities.json"
import { sections } from "../content/site.js"
import TerminalSection from "./TerminalSection.jsx"
import "./Activities.css"

const section = sections.activities

export default function Activities({ onReady, onNavigate }) {
  return (
    <TerminalSection section={section} roomy onReady={onReady} onNavigate={onNavigate}>
      <ol className="activities">
        {activities.length === 0 ? <li className="activities__empty">No experience or clubs listed yet.</li> : null}
        {activities.map((item, i) => {
          const isCurrent = item.end.toLowerCase() === "present"
          const isLast = i === activities.length - 1

          return (
            <li key={item.org + item.role} className="activity">
              <div aria-hidden="true" className="activity__rail">
                <span className="activity__star">*</span>
                {isLast ? null : <span className="activity__line" />}
              </div>

              <article className={isLast ? "activity__body" : "activity__body activity__body--spaced"}>
                <h2 className="activity__title">
                  {item.role} <span className="activity__muted">@</span>{" "}
                  {item.orgUrl ? (
                    <a href={item.orgUrl} target="_blank" rel="noreferrer" className="text-link">
                      {item.org}
                      <span className="sr-only"> (opens in new tab)</span>
                    </a>
                  ) : (
                    item.org
                  )}
                </h2>

                <p className="activity__date">
                  {item.start} — {item.end}
                  {isCurrent ? <span className="activity__current">Current</span> : null}
                </p>

                <div className="activity__details">
                  <p className="activity__summary">{item.summary}</p>
                  {item.highlights.length > 0 ? (
                    <ul className="activity__highlights">
                      {item.highlights.map((highlight) => (
                        <li key={highlight}>
                          <span aria-hidden="true" className="activity__plus">
                            {"+"}
                          </span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            </li>
          )
        })}
      </ol>
    </TerminalSection>
  )
}
