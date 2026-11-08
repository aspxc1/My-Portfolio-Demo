import { useLayoutEffect } from "react"
import { useLocation } from "react-router"

/**
 * React Router doesn't scroll for you when the URL changes. This does:
 * - a link like "/#projects" scrolls to the element with id="projects"
 * - any other page change jumps back to the top
 */
export default function ScrollToHash() {
  const { pathname, hash, key } = useLocation()

  useLayoutEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
    } else {
      window.scrollTo({ top: 0, behavior: "instant" })
    }
  }, [pathname, hash, key])

  return null
}
