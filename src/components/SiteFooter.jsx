import { profile, site } from "../content/site.js"
import "./SiteFooter.css"

export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p>{`© ${year} ${profile.name}`}</p>
        <p>{`${site.footer} · ${profile.location}`}</p>
      </div>
    </footer>
  )
}
