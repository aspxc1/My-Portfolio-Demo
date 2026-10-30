import { about, sections } from "../content/site.js"
import SectionHeading from "./SectionHeading.jsx"
import "./About.css"

const section = sections.about

export default function About() {
  const { facts, skills, rateLimits } = about

  return (
    <section aria-labelledby="about-title" id={section.id} className="section">
      <div className="container section-inner section-inner--roomy">
        <SectionHeading path={section.path} command={section.command} id="about-title" />

        <div className="about__columns">
          <div className="about__block">
            <h3 className="label">Info</h3>
            <dl className="kv-list">
              {facts.map((row) => (
                <div key={row.key}>
                  <dt>{row.key}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {rateLimits.rows.length > 0 ? (
            <div className="about__block">
              <h3 className="label">Rate limits</h3>
              <div className="about__table-wrap">
                <table className="about__table">
                  <caption className="sr-only">Personal rate limits, mostly tongue-in-cheek</caption>
                  <thead>
                    <tr>
                      <th scope="col">Resource</th>
                      <th scope="col" className="about__align-right">
                        Limit
                      </th>
                      <th scope="col">Window</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rateLimits.rows.map((row) => (
                      <tr key={row.resource}>
                        <td>{row.resource}</td>
                        <td className="about__align-right about__limit">{row.limit}</td>
                        <td className="about__window">{row.window}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="about__footnote">{rateLimits.footnote}</p>
            </div>
          ) : null}
        </div>

        <div className="about__block">
          <h3 className="label">Stack</h3>
          <div className="about__skills">
            {skills.map((group) => (
              <div key={group.group} className="about__skill-group">
                <p className="about__skill-title">{group.group}</p>
                <ul className="about__skill-list">
                  {group.items.map((item) => (
                    <li key={item}>
                      <span aria-hidden="true" className="about__dash">
                        {"-"}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
