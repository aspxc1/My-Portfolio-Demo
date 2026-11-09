import About from "../components/About.jsx"
import Contact from "../components/Contact.jsx"
import Activities from "../components/Activities.jsx"
import Hero from "../components/Hero.jsx"
import Projects from "../components/Projects.jsx"
import { site } from "../content/site.js"

export default function HomePage() {
  return (
    <main>
      {/* React moves <title> and <meta> tags into the page <head> automatically. */}
      <title>{site.title}</title>
      <meta name="description" content={site.description} />

      <Hero />
      <About />
      <Projects />
      <Activities />
      <Contact />
    </main>
  )
}
