import { useEffect, useRef, useState } from "react"
import { hero, profile } from "../content/site.js"
import HomeListing from "./HomeListing.jsx"
import "./Hero.css"


const swatchColors = ["var(--foreground)", "var(--primary)", "var(--muted-foreground)", "var(--card)"]

const COMMAND = "neofetch"

/**
 * Pacing for the fake shell session, in milliseconds.
 * Change these to retune the feel.
 */
const TIMING = {
  startDelay: 600, // let the page's fade-in finish, then a beat before typing again
  typeChar: 95, // per character of `neofetch`
  afterCommand: 1200, // hold on the entered command so it can be read
  beforePrompt: 900, // let the output land before the next prompt appears
  hold: 2600, // sit on the finished output before the next run
}

/**
 * Stages of the run, repeated forever. Numbers let the JSX read as
 * `stage >= STAGE.output`: keep showing a stage until the next one begins.
 */
const STAGE = {
  idle: 0, // empty prompt; the previous output has faded away
  typing: 1, // `neofetch` typing out
  entered: 2, // command submitted, cursor moves on
  output: 3, // ASCII art + header + every info row, all at once
  prompt: 4, // fresh shell prompt, held for a moment
}

/** How long each stage stays on screen before advancing. */
const DELAYS = {
  [STAGE.idle]: TIMING.startDelay,
  [STAGE.typing]: COMMAND.length * TIMING.typeChar,
  [STAGE.entered]: TIMING.afterCommand,
  [STAGE.output]: TIMING.beforePrompt,
  [STAGE.prompt]: TIMING.hold,
}


/** Tracks whether the block is on screen, so the loop pauses off-screen. */
function useInView(ref) {
  const [inView, setInView] = useState(true)

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || !ref.current) return

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref])

  return inView
}


/** Follows the OS "reduce motion" setting, including live changes. */
function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onChange = (event) => setReduced(event.matches)

    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  return reduced
}


export default function Hero() {
  const title = `${profile.handle}@portfolio`
  const runRef = useRef(null)
  const inView = useInView(runRef)
  const reducedMotion = useReducedMotion()
  const [stage, setStage] = useState(reducedMotion ? STAGE.prompt : STAGE.idle)

  // The loop only runs while the block is visible and motion is allowed.
  const running = inView && !reducedMotion

  useEffect(() => {
    if (!running) return

    let current = STAGE.idle
    let timer = window.setTimeout(next, DELAYS[current])

    setStage(current)

    function next() {
      current = current === STAGE.prompt ? STAGE.idle : current + 1
      setStage(current)
      timer = window.setTimeout(next, DELAYS[current])
    }

    return () => window.clearTimeout(timer)
  }, [running])

  // Show the finished output as-is when motion is reduced.
  useEffect(() => {
    if (reducedMotion) setStage(STAGE.prompt)
  }, [reducedMotion])

  const runClassName = [
    "hero__run boot",
    stage === STAGE.typing && "hero__run--typing",
    stage >= STAGE.entered && "hero__run--typed",
    stage >= STAGE.output && "hero__run--output",
    stage >= STAGE.prompt && "hero__run--prompt",
  ]
    .filter(Boolean)
    .join(" ")

  const runStyle = {
    animationDelay: "150ms",
    "--command-width": `${COMMAND.length}ch`,
    "--command-steps": String(COMMAND.length),
    "--type-duration": `${COMMAND.length * TIMING.typeChar}ms`,
  }

  return (
    <section aria-labelledby="hero-title" className="container hero">
      <div className="hero__top">
        <div ref={runRef} className={runClassName} style={runStyle}>
          <p className="hero__command">
            <span aria-hidden="true" className="hero__prompt">
              {"$ "}
            </span>
            {/* Width is animated, not the text, so the command stays intact for screen readers. */}
            <span className="hero__command-text">{COMMAND}</span>
            <span aria-hidden="true" className="hero__caret" />
          </p>

          <div className="hero__neofetch">
            <pre aria-hidden="true" className="hero__ascii">
              {hero.asciiArt}
            </pre>

            <div className="hero__info">
              <div className="hero__title-group">
                <p className="hero__muted">
                  <span className="hero__accent">{profile.handle}</span>@portfolio
                </p>
                <h1 id="hero-title" className="hero__name">
                  {profile.name}
                  <span aria-hidden="true" className="hero__accent cursor">
                    _
                  </span>
                </h1>
                <p aria-hidden="true" className="hero__dashes">
                  {"-".repeat(title.length + 8)}
                </p>
              </div>

              <dl className="hero__facts">
                {hero.neofetch.map((row) => (
                  <div key={row.key} className="hero__fact">
                    <dt>{row.key}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>

              <div aria-hidden="true" className="hero__swatches">
                {swatchColors.map((color) => (
                  <span key={color} className="hero__swatch" style={{ background: color }} />
                ))}
              </div>
            </div>
          </div>

          {/* The next prompt, printed after the output like a real shell would. */}
          <p aria-hidden="true" className="hero__prompt-line">
            <span className="hero__muted">{profile.handle}@portfolio</span>
            <span className="hero__accent">:~$ </span>
            <span className="hero__block-caret" />
          </p>
        </div>

        <div className="hero__intro boot" style={{ animationDelay: "300ms" }}>
          <p className="hero__summary">
            <span className="hero__summary-lead">
              {profile.role} at {profile.school}.
            </span>{" "}
            {profile.summary}
          </p>
        </div>
      </div>

      <div className="boot" style={{ animationDelay: "450ms" }}>
        <HomeListing />
      </div>
    </section>
  )
}
