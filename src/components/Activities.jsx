import activities from "../content/activities.json"
import { sections } from "../content/site.js"
import TerminalSection from "./TerminalSection.jsx"
import "./Activities.css"

const section = sections.activities

/** Turns any text into a short, stable, git-looking hash like "6314932". */
function shortHash(input) {
  let hash = 5381
  for (const ch of input) hash = ((hash * 33) ^ ch.charCodeAt(0)) >>> 0
  return hash.toString(16).padStart(8, "0").slice(0, 7)
}

export default function Activities({ onReady }) {
  return (
    <TerminalSection section={section} roomy onReady={onReady}>
      <ol className="activities">
        {activities.length === 0 ? <li className="activities__empty">No activities listed yet.</li> : null}
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
                <p className="activity__commit">
                  <span className="activity__hash">{`commit ${shortHash(item.org + item.role + item.start)}`}</span>
                  {isCurrent ? <span className="activity__muted">{"(HEAD -> current)"}</span> : null}
                </p>

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

                <p className="activity__date">{`Date:   ${item.start} - ${item.end}`}</p>

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
