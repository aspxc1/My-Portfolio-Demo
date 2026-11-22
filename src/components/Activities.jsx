import activities from "../content/activities.json"
import { sections } from "../content/site.js"
import TerminalSection from "./TerminalSection.jsx"
import "./Activities.css"

const section = sections.activities

function shortHash(seed) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16).padStart(7, "0").slice(0, 7)
}

/**
 * Experience & clubs rendered as `git log --graph --decorate`.
 * Strictly respects empty activities.json without auto-populating.
 */
export default function Activities({ onReady }) {
  return (
    <TerminalSection section={section} roomy onReady={onReady}>
      {activities.length === 0 ? (
        <div className="activities__empty-frame tui-frame">
          <span className="tui-frame__legend" aria-hidden="true">git · main</span>
          <p className="activities__git-fatal">
            fatal: your current branch &lsquo;main&rsquo; does not have any commits yet
          </p>
          <p className="activities__empty">No experience or clubs listed yet.</p>
        </div>
      ) : (
        <ol className="activities">
          {activities.map((item, i) => {
            const isCurrent = item.end.toLowerCase() === "present"
            const isLast = i === activities.length - 1
            const hash = item.hash || shortHash(item.org + item.role + item.start)

            return (
              <li key={item.org + item.role} className="activity">
                <div aria-hidden="true" className="activity__rail">
                  <span className="activity__star">*</span>
                  {isLast ? null : <span className="activity__line" />}
                </div>

                <article className={isLast ? "activity__body" : "activity__body activity__body--spaced"}>
                  <p className="activity__commit">
                    <span className="activity__hash">{hash}</span>
                    {i === 0 && isCurrent ? <span className="activity__ref">(HEAD -&gt; main)</span> : null}
                    <span className="activity__date-inline">{`${item.start} — ${item.end}`}</span>
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

                  <div className="activity__details">
                    <p className="activity__summary">{item.summary}</p>
                    {item.highlights.length > 0 ? (
                      <ul className="activity__highlights">
                        {item.highlights.map((highlight) => (
                          <li key={highlight}>
                            <span aria-hidden="true" className="activity__plus">+</span>
                            <span>{highlight}</span>
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
      )}
    </TerminalSection>
  )
}
