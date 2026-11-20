import { useEffect, useMemo, useRef, useState } from "react"
import "./TerminalArt.css"

const COLS = 50
const ROWS = 24
const SHADE = ".,-~:;=!*#$@"

function renderTorusFrame(A, B) {
  const output = new Array(COLS * ROWS).fill(" ")
  const tones = new Array(COLS * ROWS).fill(0)
  const zBuffer = new Float32Array(COLS * ROWS)

  const cosA = Math.cos(A)
  const sinA = Math.sin(A)
  const cosB = Math.cos(B)
  const sinB = Math.sin(B)

  for (let theta = 0; theta < Math.PI * 2; theta += 0.08) {
    const cosT = Math.cos(theta)
    const sinT = Math.sin(theta)
    const circleX = 2.05 + 0.95 * cosT
    const circleY = 0.95 * sinT

    for (let phi = 0; phi < Math.PI * 2; phi += 0.03) {
      const cosP = Math.cos(phi)
      const sinP = Math.sin(phi)

      const x = circleX * (cosB * cosP + sinA * sinB * sinP) - circleY * cosA * sinB
      const y = circleX * (sinB * cosP - sinA * cosB * sinP) + circleY * cosA * cosB
      const z = 5.0 + cosA * circleX * sinP + circleY * sinA
      const ooz = 1 / z

      const xp = Math.floor(COLS / 2 + 31 * ooz * x)
      const yp = Math.floor(ROWS / 2 - 15.5 * ooz * y)

      const L =
        cosP * cosT * sinB -
        cosA * cosT * sinP -
        sinA * sinT +
        cosB * (cosA * sinT - cosT * sinA * sinP)

      if (L > 0 && xp >= 0 && xp < COLS && yp >= 0 && yp < ROWS) {
        const idx = xp + yp * COLS
        if (ooz > zBuffer[idx]) {
          zBuffer[idx] = ooz
          const lumIndex = Math.min(SHADE.length - 1, Math.floor(L * 8.2))
          output[idx] = SHADE[lumIndex]
          tones[idx] = lumIndex >= 9 ? 3 : lumIndex >= 6 ? 2 : lumIndex >= 3 ? 1 : 0
        }
      }
    }
  }

  return packRows(output, tones)
}

// 12 vertices of an icosahedron + core node for a 3D neural/graph lattice
const PHI = (1 + Math.sqrt(5)) / 2
const RAW_NODES = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
  [0, 0, 0],
]
const EDGES = []
for (let i = 0; i < 12; i++) {
  for (let j = i + 1; j < 12; j++) {
    const dx = RAW_NODES[i][0] - RAW_NODES[j][0]
    const dy = RAW_NODES[i][1] - RAW_NODES[j][1]
    const dz = RAW_NODES[i][2] - RAW_NODES[j][2]
    if (Math.hypot(dx, dy, dz) < 2.2) EDGES.push([i, j])
  }
  if (i % 2 === 0) EDGES.push([i, 12])
}

function renderNeuralFrame(A, B, tick) {
  const output = new Array(COLS * ROWS).fill(" ")
  const tones = new Array(COLS * ROWS).fill(0)
  const zBuffer = new Float32Array(COLS * ROWS).fill(-99)

  const cosA = Math.cos(A)
  const sinA = Math.sin(A)
  const cosB = Math.cos(B)
  const sinB = Math.sin(B)

  const projected = RAW_NODES.map(([nx, ny, nz]) => {
    const x1 = nx * cosB - nz * sinB
    const z1 = nx * sinB + nz * cosB
    const y2 = ny * cosA - z1 * sinA
    const z2 = ny * sinA + z1 * cosA
    const depth = 5.0 + z2
    const scale = 1 / depth
    return {
      x: COLS / 2 + x1 * 30 * scale,
      y: ROWS / 2 - y2 * 15 * scale,
      z: -z2,
    }
  })

  // Draw edges with subtle traveling signal pulse
  EDGES.forEach(([u, v], edgeIndex) => {
    const a = projected[u]
    const b = projected[v]
    const steps = Math.max(10, Math.ceil(Math.hypot(b.x - a.x, (b.y - a.y) * 2)))
    const pulsePos = ((tick * 0.045 + edgeIndex * 0.17) % 1)
    for (let s = 1; s < steps; s++) {
      const t = s / steps
      const px = Math.round(a.x + (b.x - a.x) * t)
      const py = Math.round(a.y + (b.y - a.y) * t)
      const pz = a.z + (b.z - a.z) * t
      if (px < 0 || px >= COLS || py < 0 || py >= ROWS) continue
      const idx = px + py * COLS
      if (pz > zBuffer[idx]) {
        zBuffer[idx] = pz
        const nearPulse = Math.abs(t - pulsePos) < 0.12
        output[idx] = nearPulse ? "*" : pz > 0.3 ? ":" : "·"
        tones[idx] = nearPulse ? 3 : pz > 0.3 ? 1 : 0
      }
    }
  })

  // Draw vertices on top
  projected.forEach((p, idxNode) => {
    const px = Math.round(p.x)
    const py = Math.round(p.y)
    if (px < 0 || px >= COLS || py < 0 || py >= ROWS) return
    const idx = px + py * COLS
    const isCore = idxNode === 12
    output[idx] = isCore ? "◈" : p.z > 0.4 ? "●" : p.z > -0.4 ? "◎" : "○"
    tones[idx] = isCore ? 3 : p.z > 0.3 ? 2 : 1
  })

  return packRows(output, tones)
}

/** Group consecutive cells of the same tone per row to keep DOM spans minimal and fast. */
function packRows(output, tones) {
  const rows = []
  for (let y = 0; y < ROWS; y++) {
    const runs = []
    let currentTone = -1
    let buffer = ""
    for (let x = 0; x < COLS; x++) {
      const idx = x + y * COLS
      const ch = output[idx]
      const tone = ch === " " ? -1 : tones[idx]
      if (tone === currentTone) {
        buffer += ch
      } else {
        if (buffer) runs.push({ tone: currentTone, text: buffer })
        currentTone = tone
        buffer = ch
      }
    }
    if (buffer) runs.push({ tone: currentTone, text: buffer })
    rows.push(runs)
  }
  return rows
}

const MODES = [
  { id: "torus", label: "donut.c" },
  { id: "neural", label: "lattice" },
]

export default function TerminalArt({ active }) {
  const [mode, setMode] = useState("torus")
  const [paused, setPaused] = useState(false)
  const angles = useRef({ a: 1.08, b: 0.36, targetA: 0, targetB: 0, tick: 0 })
  const [frame, setFrame] = useState(() => renderTorusFrame(1.08, 0.36))

  const staticFrame = useMemo(() => {
    if (mode === "neural") return renderNeuralFrame(0.62, 0.55, 4)
    return renderTorusFrame(1.08, 0.36)
  }, [mode])

  useEffect(() => {
    if (!active || paused) {
      setFrame(staticFrame)
      return
    }

    let rafId = 0
    let lastTime = 0
    const interval = 1000 / 24

    function step(now) {
      if (now - lastTime >= interval) {
        lastTime = now
        angles.current.a += mode === "torus" ? 0.048 : 0.018
        angles.current.b += mode === "torus" ? 0.026 : 0.028
        angles.current.tick += 1
        const A = angles.current.a + angles.current.targetA
        const B = angles.current.b + angles.current.targetB
        setFrame(mode === "torus" ? renderTorusFrame(A, B) : renderNeuralFrame(A, B, angles.current.tick))
      }
      rafId = window.requestAnimationFrame(step)
    }

    rafId = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(rafId)
  }, [active, paused, mode, staticFrame])

  function onPointerMove(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2
    const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2
    angles.current.targetA = ny * 0.55
    angles.current.targetB = nx * 0.65
  }

  function onPointerLeave() {
    angles.current.targetA = 0
    angles.current.targetB = 0
  }

  return (
    <div className="terminal-art">
      <div
        className="terminal-art__stage"
        aria-hidden="true"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <pre className="terminal-art__canvas">
          {frame.map((runs, rowIndex) => (
            <span key={rowIndex} className="terminal-art__row">
              {runs.map((run, runIndex) =>
                run.tone < 0 ? (
                  <span key={runIndex}>{run.text}</span>
                ) : (
                  <span key={runIndex} className={`terminal-art__tone-${run.tone}`}>
                    {run.text}
                  </span>
                ),
              )}
            </span>
          ))}
        </pre>
      </div>

      <div className="terminal-art__controls" role="group" aria-label="ASCII visual mode">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            className="terminal-art__mode"
            aria-pressed={mode === item.id}
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          className="terminal-art__pause"
          aria-pressed={paused}
          aria-label={paused ? "Resume ASCII animation" : "Pause ASCII animation"}
          onClick={() => setPaused((v) => !v)}
        >
          {paused ? "▸" : "‖"}
        </button>
      </div>
    </div>
  )
}
