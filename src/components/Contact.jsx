import { contact, profile, sections } from "../content/site.js"
import TerminalSection from "./TerminalSection.jsx"
import "./Contact.css"

const section = sections.contact

/** Email first, then every link from profile.links, shown as ping replies. */
const replies = [
  { via: "email", label: profile.email, href: `mailto:${profile.email}`, external: false },
  ...profile.links.map((link) => ({
    via: link.label.replace(/\.[a-z]+$/, ""),
    label: link.kind === "file" ? link.label : link.href.replace(/^https?:\/\/(www\.)?/, ""),
    href: link.href,
    external: true,
  })),
]

export default function Contact() {
  return (
    <TerminalSection section={section}>
      <div className="contact__columns">
        <p className="contact__blurb">{contact.blurb}</p>

        <div className="contact__terminal">
          <p>{`PING ${profile.handle} (you -> me): 56 data bytes`}</p>
          <ul className="contact__replies">
            {replies.map((reply, i) => (
              <li key={reply.via}>
                {`64 bytes from ${reply.via}: seq=${i} time=${(0.4 + i * 0.3).toFixed(1)}ms -> `}
                <a
                  href={reply.href}
                  className="text-link contact__link"
                  target={reply.external ? "_blank" : undefined}
                  rel={reply.external ? "noreferrer" : undefined}
                >
                  {reply.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="contact__summary">
            {`--- ${replies.length} packets transmitted, ${replies.length} received, `}
            <span className="contact__accent">0% packet loss</span>
            {" ---"}
          </p>
        </div>
      </div>
    </TerminalSection>
  )
}
