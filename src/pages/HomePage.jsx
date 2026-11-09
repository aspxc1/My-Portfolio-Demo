import About from "../components/About.jsx"
import Contact from "../components/Contact.jsx"
import Activities from "../components/Activities.jsx"
import Hero from "../components/Hero.jsx"
import Projects from "../components/Projects.jsx"
import SessionNavigation from "../components/SessionNavigation.jsx"
import { useLocation } from "react-router"
import { site } from "../content/site.js"

const views = { home: Hero, about: About, projects: Projects, activities: Activities, contact: Contact }
const legacy = { experience: "activities", extracurriculars: "activities" }

export default function HomePage() {
  const { hash } = useLocation()
  const selected = hash.slice(1)
  const view = legacy[selected] || (Object.hasOwn(views, selected) ? selected : "home")
  const View = views[view]
  return (
    <main className="terminal-home">
      {/* React moves <title> and <meta> tags into the page <head> automatically. */}
      <title>{site.title}</title>
      <meta name="description" content={site.description} />

      <View key={view} />
      <SessionNavigation current={view} />
    </main>
  )
}
