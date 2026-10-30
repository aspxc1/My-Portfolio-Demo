import { extracurriculars } from "../content/extracurriculars.js"
import { sections } from "../content/site.js"
import SectionHeading from "./SectionHeading.jsx"
import "./Extracurriculars.css"

const section = sections.extracurriculars

/** Turns any text into a short, stable, git-looking hash like "6314932". */
function shortHash(input) {
  let hash = 5381
  for (const ch of input) hash = ((hash * 33) ^ ch.charCodeAt(0)) >>> 0
  return hash.toString(16).padStart(8, "0").slice(0, 7)
}

export default function Extracurriculars() {
  return (
    <section aria-labelledby="extracurriculars-title" id={section.id} className="section">
      <div className="container section-inner section-inner--roomy">
        <SectionHeading path={section.path} command={section.command} id="extracurriculars-title" />

        <ol className="activities">
          {extracurriculars.map((item, i) => {
            const isCurrent = item.end.toLowerCase() === "present"
            const isLast = i === extracurriculars.length - 1

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

                  <h3 className="activity__title">
                    {item.role} <span className="activity__muted">@</span>{" "}
                    {item.orgUrl ? (
                      <a href={item.orgUrl} target="_blank" rel="noreferrer" className="text-link">
                        {item.org}
                        <span className="sr-only"> (opens in new tab)</span>
                      </a>
                    ) : (
                      item.org
                    )}
                  </h3>

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
      </div>
    </section>
  )
}
