import { useEffect, useState } from "react"
import "./TerminalStarfield.css"

// Stable positions across renders and SSR; CSS moves just two lightweight planes.
function createStars(count, initialSeed) {
  let seed = initialSeed
  const next = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
  return Array.from({length:count}, (_,index) => ({
    x: `${(next() * 100).toFixed(3)}%`,
    y: `${(next() * 100).toFixed(3)}%`,
    opacity: (0.5 + next() * 0.4).toFixed(2),
    size: index % 7 === 0 ? "3px" : index % 4 === 0 ? "1px" : "2px",
  }))
}

const planes = [createStars(108, 1946), createStars(64, 8517)]

export default function TerminalStarfield() {
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    const onVisibility = () => setPaused(document.visibilityState === "hidden")
    onVisibility()
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [])

  return (
    <div className="terminal-starfield" aria-hidden="true" data-paused={paused || undefined}>
      {planes.map((stars,plane) => (
        <div key={plane} className="terminal-starfield__plane">
          {stars.map((star,index) => (
            <span key={index} className="terminal-starfield__star" style={{left:star.x,top:star.y,opacity:star.opacity,"--star-size":star.size}} />
          ))}
        </div>
      ))}
    </div>
  )
}
