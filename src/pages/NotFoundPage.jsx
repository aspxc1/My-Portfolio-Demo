import { Link } from "react-router"
import { profile } from "../content/site.js"
import "./NotFoundPage.css"

export default function NotFoundPage() {
  return (
    <main className="container not-found">
      <title>{`Not found | ${profile.name}`}</title>

      <p className="not-found__command">
        <span className="not-found__accent">{"$ "}</span>cd ./this-page
      </p>
      <h1 className="not-found__title">404: no such file or directory</h1>
      <Link to="/" className="text-link not-found__link">
        <span aria-hidden="true">cd ~ — </span>Back to Home
      </Link>
    </main>
  )
}
