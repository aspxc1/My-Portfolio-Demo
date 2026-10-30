import "./SectionHeading.css"

/**
 * The heading at the top of each section:
 *   ~/about ------------------------------
 *   $ whoami
 */
export default function SectionHeading({ path, command, id }) {
  return (
    <header className="section-heading">
      <div className="section-heading__path">
        <span>{path}</span>
        <span aria-hidden="true" className="section-heading__rule" />
      </div>
      <h2 id={id} className="section-heading__title">
        <span aria-hidden="true" className="section-heading__dollar">
          {"$ "}
        </span>
        {command}
      </h2>
    </header>
  )
}
