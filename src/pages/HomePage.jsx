import About from "../components/About.jsx"
import Contact from "../components/Contact.jsx"
import Activities from "../components/Activities.jsx"
import Hero from "../components/Hero.jsx"
import Projects from "../components/Projects.jsx"
import SessionNavigation from "../components/SessionNavigation.jsx"
import { useLocation } from "react-router"
import { useCallback, useState } from "react"
import useReducedMotion from "../lib/useReducedMotion.js"
import { site } from "../content/site.js"

const views = { home: Hero, about: About, projects: Projects, activities: Activities, contact: Contact }
const legacy = { experience: "activities", extracurriculars: "activities" }

export default function HomePage() {
  const { hash } = useLocation()
  const selected = hash.slice(1)
  const view = Object.hasOwn(legacy, selected)
    ? legacy[selected]
    : Object.hasOwn(views, selected) ? selected : "home"
  return <HomeSession key={view} view={view} />
}

/** Readiness belongs to this visit, including a Back navigation mid-command. */
function HomeSession({ view }) {
  const View = views[view]
  const reducedMotion = useReducedMotion()
  const [ready, setReady] = useState(false)
  const [navigationRequest, setNavigationRequest] = useState(0)
  const onReady = useCallback(() => setReady(true), [])
  const onNavigate = useCallback(() => setNavigationRequest((request) => request + 1), [])
  return (
    <main className="terminal-home">
      {/* React moves <title> and <meta> tags into the page <head> automatically. */}
      <title>{site.title}</title>
      <meta name="description" content={site.description} />

      <View key={view} onReady={onReady} onNavigate={onNavigate} />
      <SessionNavigation current={view} enabled={reducedMotion || ready || navigationRequest > 0} request={navigationRequest} />
    </main>
  )
}
