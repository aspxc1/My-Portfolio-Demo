import { useEffect, useRef, useState } from "react"
import "./TerminalArt.css"

const COLS = 44
const ROWS = 22
const SHADE = ".,-~:;=!*#$@"

// Precomputed trig lookup tables for the torus so the hot loop stays allocation-free and math-light.
const TORUS_J_STEPS = []
for (let j = 0; j < 6.28; j += 0.08) {
  const cosJ = Math.cos(j)
  TORUS_J_STEPS.push({ cosJ, sinJ: Math.sin(j), h: cosJ + 2.08 })
}
const TORUS_I_STEPS = []
for (let i = 0; i < 6.28; i += 0.03) {
  TORUS_I_STEPS.push({ cosI: Math.cos(i), sinI: Math.sin(i) })
}

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
const LATTICE_PROJ = LATTICE_NODES.map(() => ({ x: 0, y: 0, z: 0 }))

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
const PYRAMID_PROJ = PYRAMID_NODES.map(() => ({ x: 0, y: 0, z: 0 }))

const GLYPHS = Array.from(new Set([...SHADE, ":", "·", "◈", "●", "◎", "○", "▲", "+", "/"]))
const GLYPH_INDEX = Object.create(null)
GLYPHS.forEach((ch, idx) => {
  GLYPH_INDEX[ch] = idx
})

function computeTorus(A, B, chars, tones, zBuf) {
  chars.fill(" ")
  tones.fill(0)
  zBuf.fill(0)
  const cosA = Math.cos(A)
  const sinA = Math.sin(A)
  const cosB = Math.cos(B)
  const sinB = Math.sin(B)
  const halfCols = COLS / 2
  const halfRows = ROWS / 2

  for (let ji = 0; ji < TORUS_J_STEPS.length; ji++) {
    const { cosJ, sinJ, h } = TORUS_J_STEPS[ji]
    const sinJCosA = sinJ * cosA
    const sinJSinA = sinJ * sinA
    const cosJCosA = cosJ * cosA
    const cosJSinA = cosJ * sinA
    const baseD = sinJCosA + 5.1

    for (let ii = 0; ii < TORUS_I_STEPS.length; ii++) {
      const { cosI, sinI } = TORUS_I_STEPS[ii]
      const sinIH = sinI * h
      const D = 1 / (sinIH * sinA + baseD)
      const t = sinIH * cosA - sinJSinA
      const cosIH = cosI * h
      const x = Math.floor(halfCols + 24 * D * (cosIH * cosB - t * sinB))
      const y = Math.floor(halfRows + 12.2 * D * (cosIH * sinB + t * cosB))
      if (x < 0 || x >= COLS || y < 0 || y >= ROWS) continue
      const idx = x + y * COLS
      if (D > zBuf[idx]) {
        zBuf[idx] = D
        const lum = Math.floor(8 * ((sinJSinA - sinI * cosJCosA) * cosB - sinI * cosJSinA - sinJCosA - cosI * cosJ * sinB))
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

  for (let k = 0; k < LATTICE_NODES.length; k++) {
    const [nx, ny, nz] = LATTICE_NODES[k]
    const x1 = nx * cosB - nz * sinB
    const z1 = nx * sinB + nz * cosB
    const y2 = ny * cosA - z1 * sinA
    const z2 = ny * sinA + z1 * cosA
    const scale = 1 / (5.0 + z2)
    const p = LATTICE_PROJ[k]
    p.x = COLS / 2 + x1 * 32 * scale
    p.y = ROWS / 2 - y2 * 16 * scale
    p.z = -z2
  }

  for (let edgeIdx = 0; edgeIdx < LATTICE_EDGES.length; edgeIdx++) {
    const [u, v] = LATTICE_EDGES[edgeIdx]
    const pulse = (tick * 0.025 + edgeIdx * 0.17) % 1
    drawEdge(LATTICE_PROJ[u], LATTICE_PROJ[v], chars, tones, zBuf, pulse)
  }

  for (let idxNode = 0; idxNode < LATTICE_PROJ.length; idxNode++) {
    const p = LATTICE_PROJ[idxNode]
    const px = Math.round(p.x)
    const py = Math.round(p.y)
    if (px < 0 || px >= COLS || py < 0 || py >= ROWS) continue
    const idx = px + py * COLS
    const isCore = idxNode === 12
    chars[idx] = isCore ? "◈" : p.z > 0.35 ? "●" : p.z > -0.35 ? "◎" : "○"
    tones[idx] = isCore ? 3 : p.z > 0.25 ? 2 : 1
  }
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

  for (let k = 0; k < PYRAMID_NODES.length; k++) {
    const [nx, ny, nz] = PYRAMID_NODES[k]
    const x1 = nx * cosB - nz * sinB
    const z1 = nx * sinB + nz * cosB
    const y2 = ny * cosA - z1 * sinA
    const z2 = ny * sinA + z1 * cosA
    const scale = 1 / (4.8 + z2)
    const p = PYRAMID_PROJ[k]
    p.x = COLS / 2 + x1 * 34 * scale
    p.y = ROWS / 2 - y2 * 16.5 * scale
    p.z = -z2
  }

  // Subtle horizon line behind the pyramid
  const horizonY = Math.floor(ROWS * 0.78)
  for (let x = 2; x < COLS - 2; x += 2) {
    const idx = x + horizonY * COLS
    zBuf[idx] = -5
    chars[idx] = "·"
    tones[idx] = 0
  }

  for (let edgeIdx = 0; edgeIdx < PYRAMID_EDGES.length; edgeIdx++) {
    const [u, v] = PYRAMID_EDGES[edgeIdx]
    const pulse = edgeIdx < 4 ? (tick * 0.02 + edgeIdx * 0.25) % 1 : null
    drawEdge(PYRAMID_PROJ[u], PYRAMID_PROJ[v], chars, tones, zBuf, pulse, "/", ":")
  }

  for (let idxNode = 0; idxNode < PYRAMID_PROJ.length; idxNode++) {
    const p = PYRAMID_PROJ[idxNode]
    const px = Math.round(p.x)
    const py = Math.round(p.y)
    if (px < 0 || px >= COLS || py < 0 || py >= ROWS) continue
    const idx = px + py * COLS
    chars[idx] = idxNode === 0 ? "▲" : "+"
    tones[idx] = idxNode === 0 ? 3 : 2
  }
}

const MODES = [
  { id: "torus", label: "--donut" },
  { id: "neural", label: "--lattice" },
  { id: "giza", label: "--giza" },
]

/**
 * Unboxed 60fps HiDPI <canvas> 3D ASCII renderer with drag-to-spin inertia.
 * Uses precomputed trig tables, ResizeObserver sizing, and an offscreen glyph atlas
 * so animation loops cause zero forced layout reads or text-shaping overhead.
 */
export default function TerminalArt({ active }) {
  const [mode, setMode] = useState("torus")
  const [paused, setPaused] = useState(false)
  const canvasRef = useRef(null)
  const drawRef = useRef(null)
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
    const size = { width: 0, height: 0, dpr: 1, cellW: 0, cellH: 0, fontSize: 10 }

    const atlasCanvas = typeof document !== "undefined" ? document.createElement("canvas") : null
    const atlasCtx = atlasCanvas ? atlasCanvas.getContext("2d") : null
    const atlasMeta = { spriteW: 0, spriteH: 0, ready: false }
    let atlasDirty = true

    function syncSize(nextWidth, nextHeight) {
      if (!nextWidth || !nextHeight) return false
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const targetW = Math.round(nextWidth * dpr)
      const targetH = Math.round(nextHeight * dpr)
      const changed = size.width !== nextWidth || size.height !== nextHeight || size.dpr !== dpr
      size.width = nextWidth
      size.height = nextHeight
      size.dpr = dpr
      size.cellW = nextWidth / COLS
      size.cellH = nextHeight / ROWS
      size.fontSize = Math.max(7.5, Math.min(size.cellH * 0.96, size.cellW * 1.62))
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW
        canvas.height = targetH
      }
      if (changed) atlasDirty = true
      return changed
    }

    function rebuildAtlas() {
      if (!atlasCanvas || !atlasCtx || !size.width || !size.height) {
        atlasMeta.ready = false
        atlasDirty = false
        return
      }
      const tileW = Math.ceil(Math.max(size.cellW, size.fontSize * 1.15)) + 4
      const tileH = Math.ceil(Math.max(size.cellH, size.fontSize * 1.3)) + 4
      const spriteW = Math.max(1, Math.round(tileW * size.dpr))
      const spriteH = Math.max(1, Math.round(tileH * size.dpr))

      atlasCanvas.width = GLYPHS.length * spriteW
      atlasCanvas.height = 4 * spriteH
      atlasCtx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0)
      atlasCtx.clearRect(0, 0, GLYPHS.length * tileW, 4 * tileH)
      atlasCtx.font = `600 ${size.fontSize.toFixed(1)}px "JetBrains Mono", ui-monospace, monospace`
      atlasCtx.textBaseline = "middle"
      atlasCtx.textAlign = "center"

      for (let tone = 0; tone < 4; tone++) {
        atlasCtx.fillStyle = palette[tone] || palette[0]
        const cy = (tone + 0.5) * tileH
        for (let g = 0; g < GLYPHS.length; g++) {
          atlasCtx.fillText(GLYPHS[g], (g + 0.5) * tileW, cy)
        }
      }

      atlasMeta.spriteW = spriteW
      atlasMeta.spriteH = spriteH
      atlasMeta.ready = true
      atlasDirty = false
    }

    function readPalette() {
      const style = getComputedStyle(document.documentElement)
      palette = [
        style.getPropertyValue("--muted-foreground").trim() || "#7a7a8c",
        style.getPropertyValue("--terminal-blue").trim() || "#7e9cd8",
        style.getPropertyValue("--terminal-teal").trim() || "#7aa89f",
        style.getPropertyValue("--primary").trim() || "#e6c384",
      ]
      atlasDirty = true
    }

    function drawFrame() {
      if (!size.width || !size.height) return
      if (atlasDirty) rebuildAtlas()

      const s = stateRef.current
      if (mode === "torus") computeTorus(s.a, s.b, chars, tones, zBuf)
      else if (mode === "neural") computeLattice(s.a, s.b, s.tick, chars, tones, zBuf)
      else computeGiza(s.a, s.b, s.tick, chars, tones, zBuf)

      if (atlasMeta.ready && atlasCanvas) {
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const { spriteW, spriteH } = atlasMeta
        const halfSpriteW = spriteW * 0.5
        const halfSpriteH = spriteH * 0.5
        const stepX = size.cellW * size.dpr
        const stepY = size.cellH * size.dpr

        for (let y = 0; y < ROWS; y++) {
          const rowOffset = y * COLS
          const dy = Math.round((y + 0.5) * stepY - halfSpriteH)
          for (let x = 0; x < COLS; x++) {
            const idx = x + rowOffset
            const ch = chars[idx]
            if (ch === " ") continue
            const glyphIdx = GLYPH_INDEX[ch]
            if (glyphIdx === undefined) continue
            const dx = Math.round((x + 0.5) * stepX - halfSpriteW)
            ctx.drawImage(
              atlasCanvas,
              glyphIdx * spriteW,
              tones[idx] * spriteH,
              spriteW,
              spriteH,
              dx,
              dy,
              spriteW,
              spriteH,
            )
          }
        }
        return
      }

      ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0)
      ctx.clearRect(0, 0, size.width, size.height)
      ctx.font = `600 ${size.fontSize.toFixed(1)}px "JetBrains Mono", ui-monospace, monospace`
      ctx.textBaseline = "middle"
      ctx.textAlign = "center"
      for (let y = 0; y < ROWS; y++) {
        const cy = (y + 0.5) * size.cellH
        for (let x = 0; x < COLS; x++) {
          const idx = x + y * COLS
          const ch = chars[idx]
          if (ch === " ") continue
          ctx.fillStyle = palette[tones[idx]] || palette[0]
          ctx.fillText(ch, (x + 0.5) * size.cellW, cy)
        }
      }
    }

    drawRef.current = drawFrame
    readPalette()
    syncSize(canvas.clientWidth, canvas.clientHeight)

    const themeObserver = new MutationObserver(() => {
      readPalette()
      drawFrame()
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-accent"] })

    let resizeObserver = null
    const onWindowResize = () => {
      if (syncSize(canvas.clientWidth, canvas.clientHeight)) drawFrame()
    }
    if (typeof ResizeObserver === "function") {
      resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[entries.length - 1]
        if (!entry) return
        if (syncSize(entry.contentRect.width, entry.contentRect.height)) drawFrame()
      })
      resizeObserver.observe(canvas)
    } else {
      window.addEventListener("resize", onWindowResize)
    }

    let fontEffectAlive = true
    document.fonts?.ready?.then(() => {
      if (!fontEffectAlive) return
      atlasDirty = true
      drawFrame()
    })

    drawFrame()

    if (!active || paused) {
      return () => {
        fontEffectAlive = false
        drawRef.current = null
        themeObserver.disconnect()
        if (resizeObserver) resizeObserver.disconnect()
        else window.removeEventListener("resize", onWindowResize)
      }
    }

    let rafId = 0
    let lastNow = null

    function step(now) {
      const dt = lastNow === null ? 1 / 60 : Math.max(0, Math.min(0.05, (now - lastNow) / 1000))
      lastNow = now
      const s = stateRef.current

      if (!s.dragging) {
        const autoA = mode === "torus" ? 0.95 : mode === "neural" ? 0.38 : 0.25
        const autoB = mode === "torus" ? 0.52 : mode === "neural" ? 0.55 : 0.62
        s.a += (autoA + s.velA) * dt
        s.b += (autoB + s.velB) * dt
        const damping = Math.pow(0.94, dt * 60)
        s.velA *= damping
        s.velB *= damping
      }
      s.tick += dt * 36
      drawFrame()
      rafId = window.requestAnimationFrame(step)
    }

    rafId = window.requestAnimationFrame(step)
    return () => {
      fontEffectAlive = false
      drawRef.current = null
      window.cancelAnimationFrame(rafId)
      themeObserver.disconnect()
      if (resizeObserver) resizeObserver.disconnect()
      else window.removeEventListener("resize", onWindowResize)
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
    if (!active || paused) drawRef.current?.()
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
