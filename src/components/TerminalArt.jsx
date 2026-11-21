import { useEffect, useRef, useState } from "react"
import "./TerminalArt.css"

const COLS = 44
const ROWS = 22
const SHADE = ".,-~:;=!*#$@"

// Icosahedron + core node for 3D neural/attention lattice
const PHI = (1 + Math.sqrt(5)) / 2
const LATTICE_NODES = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
  [0, 0, 0],
]
const LATTICE_EDGES = []
for (let i = 0; i < 12; i++) {
  for (let j = i + 1; j < 12; j++) {
    const dx = LATTICE_NODES[i][0] - LATTICE_NODES[j][0]
    const dy = LATTICE_NODES[i][1] - LATTICE_NODES[j][1]
    const dz = LATTICE_NODES[i][2] - LATTICE_NODES[j][2]
    if (Math.hypot(dx, dy, dz) < 2.2) LATTICE_EDGES.push([i, j])
  }
  if (i % 2 === 0) LATTICE_EDGES.push([i, 12])
}

// 3D Giza stepped pyramid wireframe + base horizon
const PYRAMID_NODES = [
  [0, 1.55, 0], // apex
  [-1.35, -0.95, -1.35],
  [1.35, -0.95, -1.35],
  [1.35, -0.95, 1.35],
  [-1.35, -0.95, 1.35],
  [-0.68, 0.3, -0.68],
  [0.68, 0.3, -0.68],
  [0.68, 0.3, 0.68],
  [-0.68, 0.3, 0.68],
]
const PYRAMID_EDGES = [
  [0, 1], [0, 2], [0, 3], [0, 4],
  [1, 2], [2, 3], [3, 4], [4, 1],
  [5, 6], [6, 7], [7, 8], [8, 5],
]

function computeTorus(A, B, chars, tones, zBuf) {
  chars.fill(" ")
  tones.fill(0)
  zBuf.fill(0)
  const cosA = Math.cos(A)
  const sinA = Math.sin(A)
  const cosB = Math.cos(B)
  const sinB = Math.sin(B)

  for (let j = 0; j < 6.28; j += 0.08) {
    const cosJ = Math.cos(j)
    const sinJ = Math.sin(j)
    for (let i = 0; i < 6.28; i += 0.03) {
      const sinI = Math.sin(i)
      const cosI = Math.cos(i)
      const h = cosJ + 2.08
      const D = 1 / (sinI * h * sinA + sinJ * cosA + 5.1)
      const t = sinI * h * cosA - sinJ * sinA
      const x = Math.floor(COLS / 2 + 24 * D * (cosI * h * cosB - t * sinB))
      const y = Math.floor(ROWS / 2 + 12.2 * D * (cosI * h * sinB + t * cosB))
      if (x < 0 || x >= COLS || y < 0 || y >= ROWS) continue
      const idx = x + y * COLS
      if (D > zBuf[idx]) {
        zBuf[idx] = D
        const lum = Math.floor(8 * ((sinJ * sinA - sinI * cosJ * cosA) * cosB - sinI * cosJ * sinA - sinJ * cosA - cosI * cosJ * sinB))
        const shadeIdx = Math.max(0, Math.min(SHADE.length - 1, lum))
        chars[idx] = SHADE[shadeIdx]
        tones[idx] = shadeIdx > 9 ? 3 : shadeIdx > 6 ? 2 : shadeIdx > 3 ? 1 : 0
      }
    }
  }
}

function drawEdge(a, b, chars, tones, zBuf, pulsePos, glyphMid = ":", glyphFar = "·") {
  const steps = Math.max(10, Math.ceil(Math.hypot(b.x - a.x, (b.y - a.y) * 2)))
  for (let s = 1; s < steps; s++) {
    const t = s / steps
    const px = Math.round(a.x + (b.x - a.x) * t)
    const py = Math.round(a.y + (b.y - a.y) * t)
    const pz = a.z + (b.z - a.z) * t
    if (px < 0 || px >= COLS || py < 0 || py >= ROWS) continue
    const idx = px + py * COLS
    if (pz > zBuf[idx]) {
      zBuf[idx] = pz
      const nearPulse = pulsePos != null && Math.abs(t - pulsePos) < 0.11
      chars[idx] = nearPulse ? "*" : pz > 0.25 ? glyphMid : glyphFar
      tones[idx] = nearPulse ? 3 : pz > 0.25 ? 1 : 0
    }
  }
}

function computeLattice(A, B, tick, chars, tones, zBuf) {
  chars.fill(" ")
  tones.fill(0)
  zBuf.fill(-99)
  const cosA = Math.cos(A)
  const sinA = Math.sin(A)
  const cosB = Math.cos(B)
  const sinB = Math.sin(B)

  const projected = LATTICE_NODES.map(([nx, ny, nz]) => {
    const x1 = nx * cosB - nz * sinB
    const z1 = nx * sinB + nz * cosB
    const y2 = ny * cosA - z1 * sinA
    const z2 = ny * sinA + z1 * cosA
    const scale = 1 / (5.0 + z2)
    return { x: COLS / 2 + x1 * 32 * scale, y: ROWS / 2 - y2 * 16 * scale, z: -z2 }
  })

  LATTICE_EDGES.forEach(([u, v], edgeIdx) => {
    const pulse = (tick * 0.025 + edgeIdx * 0.17) % 1
    drawEdge(projected[u], projected[v], chars, tones, zBuf, pulse)
  })

  projected.forEach((p, idxNode) => {
    const px = Math.round(p.x)
    const py = Math.round(p.y)
    if (px < 0 || px >= COLS || py < 0 || py >= ROWS) return
    const idx = px + py * COLS
    const isCore = idxNode === 12
    chars[idx] = isCore ? "◈" : p.z > 0.35 ? "●" : p.z > -0.35 ? "◎" : "○"
    tones[idx] = isCore ? 3 : p.z > 0.25 ? 2 : 1
  })
}

function computeGiza(A, B, tick, chars, tones, zBuf) {
  chars.fill(" ")
  tones.fill(0)
  zBuf.fill(-99)
  const tilt = 0.32 + Math.sin(A) * 0.22
  const cosA = Math.cos(tilt)
  const sinA = Math.sin(tilt)
  const cosB = Math.cos(B)
  const sinB = Math.sin(B)

  const projected = PYRAMID_NODES.map(([nx, ny, nz]) => {
    const x1 = nx * cosB - nz * sinB
    const z1 = nx * sinB + nz * cosB
    const y2 = ny * cosA - z1 * sinA
    const z2 = ny * sinA + z1 * cosA
    const scale = 1 / (4.8 + z2)
    return { x: COLS / 2 + x1 * 34 * scale, y: ROWS / 2 - y2 * 16.5 * scale, z: -z2 }
  })

  // Subtle horizon line behind the pyramid
  const horizonY = Math.floor(ROWS * 0.78)
  for (let x = 2; x < COLS - 2; x += 2) {
    const idx = x + horizonY * COLS
    zBuf[idx] = -5
    chars[idx] = "·"
    tones[idx] = 0
  }

  PYRAMID_EDGES.forEach(([u, v], edgeIdx) => {
    const pulse = edgeIdx < 4 ? (tick * 0.02 + edgeIdx * 0.25) % 1 : null
    drawEdge(projected[u], projected[v], chars, tones, zBuf, pulse, "/", ":")
  })

  projected.forEach((p, idxNode) => {
    const px = Math.round(p.x)
    const py = Math.round(p.y)
    if (px < 0 || px >= COLS || py < 0 || py >= ROWS) return
    const idx = px + py * COLS
    chars[idx] = idxNode === 0 ? "▲" : "+"
    tones[idx] = idxNode === 0 ? 3 : 2
  })
}

const MODES = [
  { id: "torus", label: "--donut" },
  { id: "neural", label: "--lattice" },
  { id: "giza", label: "--giza" },
]

/**
 * Unboxed 60fps HiDPI <canvas> 3D ASCII renderer with drag-to-spin inertia.
 * Zero React re-renders per frame.
 */
export default function TerminalArt({ active }) {
  const [mode, setMode] = useState("torus")
  const [paused, setPaused] = useState(false)
  const canvasRef = useRef(null)
  const stateRef = useRef({
    a: 1.08,
    b: 0.42,
    velA: 0,
    velB: 0,
    tick: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const chars = new Array(COLS * ROWS)
    const tones = new Uint8Array(COLS * ROWS)
    const zBuf = new Float32Array(COLS * ROWS)

    let palette = ["#7a7a8c", "#7e9cd8", "#7aa89f", "#e6c384"]
    function readPalette() {
      const style = getComputedStyle(document.documentElement)
      palette = [
        style.getPropertyValue("--muted-foreground").trim() || "#7a7a8c",
        style.getPropertyValue("--terminal-blue").trim() || "#7e9cd8",
        style.getPropertyValue("--terminal-teal").trim() || "#7aa89f",
        style.getPropertyValue("--primary").trim() || "#e6c384",
      ]
    }
    readPalette()

    const observer = new MutationObserver(readPalette)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-accent"] })

    function drawFrame() {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const targetW = Math.round(rect.width * dpr)
      const targetH = Math.round(rect.height * dpr)
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW
        canvas.height = targetH
      }

      const s = stateRef.current
      if (mode === "torus") computeTorus(s.a, s.b, chars, tones, zBuf)
      else if (mode === "neural") computeLattice(s.a, s.b, s.tick, chars, tones, zBuf)
      else computeGiza(s.a, s.b, s.tick, chars, tones, zBuf)

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, rect.width, rect.height)

      const cellW = rect.width / COLS
      const cellH = rect.height / ROWS
      const fontSize = Math.max(7.5, Math.min(cellH * 0.96, cellW * 1.62))
      ctx.font = `600 ${fontSize.toFixed(1)}px "JetBrains Mono", ui-monospace, monospace`
      ctx.textBaseline = "middle"
      ctx.textAlign = "center"

      for (let y = 0; y < ROWS; y++) {
        const cy = (y + 0.5) * cellH
        for (let x = 0; x < COLS; x++) {
          const idx = x + y * COLS
          const ch = chars[idx]
          if (ch === " ") continue
          ctx.fillStyle = palette[tones[idx]] || palette[0]
          ctx.fillText(ch, (x + 0.5) * cellW, cy)
        }
      }
    }

    drawFrame()

    if (!active || paused) {
      return () => observer.disconnect()
    }

    let rafId = 0
    let lastNow = performance.now()

    function step(now) {
      const dt = Math.min(0.05, (now - lastNow) / 1000)
      lastNow = now
      const s = stateRef.current

      if (!s.dragging) {
        const autoA = mode === "torus" ? 0.95 : mode === "neural" ? 0.38 : 0.25
        const autoB = mode === "torus" ? 0.52 : mode === "neural" ? 0.55 : 0.62
        s.a += (autoA + s.velA) * dt
        s.b += (autoB + s.velB) * dt
        s.velA *= 0.94
        s.velB *= 0.94
      }
      s.tick += dt * 36
      drawFrame()
      rafId = window.requestAnimationFrame(step)
    }

    rafId = window.requestAnimationFrame(step)
    return () => {
      window.cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [active, paused, mode])

  function onPointerDown(event) {
    const s = stateRef.current
    s.dragging = true
    s.lastX = event.clientX
    s.lastY = event.clientY
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function onPointerMove(event) {
    const s = stateRef.current
    if (!s.dragging) return
    const dx = event.clientX - s.lastX
    const dy = event.clientY - s.lastY
    s.lastX = event.clientX
    s.lastY = event.clientY
    s.b += dx * 0.012
    s.a += dy * 0.012
    s.velB = dx * 0.28
    s.velA = dy * 0.28
  }

  function onPointerUp() {
    stateRef.current.dragging = false
  }

  return (
    <div className="terminal-art">
      <div
        className="terminal-art__stage"
        aria-hidden="true"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        title="Drag to spin"
      >
        <canvas ref={canvasRef} className="terminal-art__canvas" />
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
