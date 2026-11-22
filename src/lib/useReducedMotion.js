import { useEffect, useState } from "react"

/** Follows the OS preference, including changes while the page is open. */
export default function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined"
      && typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onChange = (event) => setReduced(event.matches)
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", onChange)
      return () => query.removeEventListener("change", onChange)
    }
    if (typeof query.addListener === "function") {
      query.addListener(onChange)
      return () => query.removeListener(onChange)
    }
    return undefined
  }, [])

  return reduced
}
