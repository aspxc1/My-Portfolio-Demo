import { about, profile, sections } from "../content/site.js"
import TerminalSection from "./TerminalSection.jsx"
import "./About.css"

const section = sections.about

export default function About() {
  return (
    <TerminalSection section={section} roomy>
      <div className="about__columns">
        <div className="about__block">
          <p className="about__summary">
            <span className="about__summary-lead">
              {profile.role} at {profile.school}.
            </span>{" "}
            {profile.summary}
          </p>

          <h2 className="label">Currently</h2>
          <dl className="about__now">
            {about.currently.map((item) => (
              <div key={item.label} className="about__now-item">
                <dt>
                  <span aria-hidden="true" className="about__marker">{"~ "}</span>
                  {item.label}
                </dt>
                <dd>{item.description}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="about__block">
          <h2 className="label">Stack</h2>
          <dl className="about__stack">
            {about.skills.filter((group) => !group.hidden).map((group) => (
              <div key={group.group} className="about__stack-row">
                <dt>{group.group}</dt>
                <dd>
                  <ul className="about__tools">
                    {group.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </TerminalSection>
  )
}
