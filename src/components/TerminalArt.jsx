import { useEffect, useRef, useState } from "react"
import "./TerminalArt.css"

// Character-cell Braille grid: 2x4 subpixels per cell -> 72x72 virtual canvas
const COLS = 36
const ROWS = 18
const DOT_COLS = COLS * 2
const DOT_ROWS = ROWS * 4
const DOT_BITS = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
]

// Precomputed trig lookup tables for the torus so the hot loop stays allocation-free
const TORUS_J_STEPS = []
for (let j = 0; j < 6.28; j += 0.12) {
  const cosJ = Math.cos(j)
  TORUS_J_STEPS.push({ cosJ, sinJ: Math.sin(j), h: cosJ + 2.08 })
}
const TORUS_I_STEPS = []
for (let i = 0; i < 6.28; i += 0.05) {
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
  [0, 1.55, 0],
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

function plotDot(px, py, tone, z, bits, tones, zBuf) {
  const x = Math.round(px)
  const y = Math.round(py)
  if (x < 0 || x >= DOT_COLS || y < 0 || y >= DOT_ROWS) return
  const cellIdx = (y >> 2) * COLS + (x >> 1)
  bits[cellIdx] |= DOT_BITS[y & 3][x & 1]
  if (z > zBuf[cellIdx]) {
    zBuf[cellIdx] = z
    tones[cellIdx] = tone
  }
}

function drawBrailleLine(a, b, bits, tones, zBuf, pulsePos, stepStride = 1) {
  const steps = Math.max(12, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y)))
  for (let s = 0; s <= steps; s += stepStride) {
    const t = s / steps
    const px = a.x + (b.x - a.x) * t
    const py = a.y + (b.y - a.y) * t
    const pz = a.z + (b.z - a.z) * t
    const nearPulse = pulsePos != null && Math.abs(t - pulsePos) < 0.09
    const tone = nearPulse ? 3 : pz > 0.25 ? 2 : pz > -0.35 ? 1 : 0
    plotDot(px, py, tone, nearPulse ? pz + 2 : pz, bits, tones, zBuf)
  }
}

function computeLattice(A, B, tick, bits, tones, zBuf) {
  bits.fill(0)
  tones.fill(0)
  zBuf.fill(-99)
  const cosA = Math.cos(A)
  const sinA = Math.sin(A)
  const cosB = Math.cos(B)
  const sinB = Math.sin(B)
  const halfW = DOT_COLS / 2
  const halfH = DOT_ROWS / 2

  for (let k = 0; k < LATTICE_NODES.length; k++) {
    const [nx, ny, nz] = LATTICE_NODES[k]
    const x1 = nx * cosB - nz * sinB
    const z1 = nx * sinB + nz * cosB
    const y2 = ny * cosA - z1 * sinA
    const z2 = ny * sinA + z1 * cosA
    const scale = 1 / (5.0 + z2)
    const p = LATTICE_PROJ[k]
    p.x = halfW + x1 * 56 * scale
    p.y = halfH - y2 * 80 * scale
    p.z = -z2
  }

  for (let edgeIdx = 0; edgeIdx < LATTICE_EDGES.length; edgeIdx++) {
    const [u, v] = LATTICE_EDGES[edgeIdx]
    const pulse = (tick * 0.025 + edgeIdx * 0.17) % 1
    const isCoreEdge = u === 12 || v === 12
    drawBrailleLine(LATTICE_PROJ[u], LATTICE_PROJ[v], bits, tones, zBuf, pulse, isCoreEdge ? 2 : 1)
  }

  for (let idxNode = 0; idxNode < LATTICE_PROJ.length; idxNode++) {
    const p = LATTICE_PROJ[idxNode]
    const isCore = idxNode === 12
    const tone = isCore ? 3 : p.z > 0.25 ? 3 : p.z > -0.25 ? 2 : 1
    const zBoost = p.z + 1.5
    plotDot(p.x, p.y, tone, zBoost, bits, tones, zBuf)
    plotDot(p.x - 1, p.y, tone, zBoost, bits, tones, zBuf)
    plotDot(p.x + 1, p.y, tone, zBoost, bits, tones, zBuf)
    plotDot(p.x, p.y - 1, tone, zBoost, bits, tones, zBuf)
    plotDot(p.x, p.y + 1, tone, zBoost, bits, tones, zBuf)
    if (isCore) {
      plotDot(p.x - 1, p.y - 1, 3, zBoost + 1, bits, tones, zBuf)
      plotDot(p.x + 1, p.y + 1, 3, zBoost + 1, bits, tones, zBuf)
    }
  }
}

function computeGiza(A, B, tick, bits, tones, zBuf) {
  bits.fill(0)
  tones.fill(0)
  zBuf.fill(-99)
  const tilt = 0.32 + Math.sin(A) * 0.22
  const cosA = Math.cos(tilt)
  const sinA = Math.sin(tilt)
  const cosB = Math.cos(B)
  const sinB = Math.sin(B)
  const halfW = DOT_COLS / 2
  const halfH = DOT_ROWS / 2

  for (let k = 0; k < PYRAMID_NODES.length; k++) {
    const [nx, ny, nz] = PYRAMID_NODES[k]
    const x1 = nx * cosB - nz * sinB
    const z1 = nx * sinB + nz * cosB
    const y2 = ny * cosA - z1 * sinA
    const z2 = ny * sinA + z1 * cosA
    const scale = 1 / (4.9 + z2)
    const p = PYRAMID_PROJ[k]
    p.x = halfW + x1 * 58 * scale
    p.y = halfH - y2 * 82 * scale
    p.z = -z2
  }

  const horizonY = Math.floor(DOT_ROWS * 0.8)
  for (let x = 4; x < DOT_COLS - 4; x += 3) {
    plotDot(x, horizonY, 0, -5, bits, tones, zBuf)
  }

  for (let edgeIdx = 0; edgeIdx < PYRAMID_EDGES.length; edgeIdx++) {
    const [u, v] = PYRAMID_EDGES[edgeIdx]
    const pulse = edgeIdx < 4 ? (tick * 0.02 + edgeIdx * 0.25) % 1 : null
    drawBrailleLine(PYRAMID_PROJ[u], PYRAMID_PROJ[v], bits, tones, zBuf, pulse, 1)
  }

  for (let idxNode = 0; idxNode < PYRAMID_PROJ.length; idxNode++) {
    const p = PYRAMID_PROJ[idxNode]
    const isApex = idxNode === 0
    const tone = isApex ? 3 : 2
    const zBoost = p.z + 1.5
    plotDot(p.x, p.y, tone, zBoost, bits, tones, zBuf)
    plotDot(p.x - 1, p.y, tone, zBoost, bits, tones, zBuf)
    plotDot(p.x + 1, p.y, tone, zBoost, bits, tones, zBuf)
    plotDot(p.x, p.y - 1, tone, zBoost, bits, tones, zBuf)
    if (isApex) {
      plotDot(p.x, p.y + 1, 3, zBoost + 1, bits, tones, zBuf)
    }
  }
}

function computeTorus(A, B, bits, tones, zBuf) {
  bits.fill(0)
  tones.fill(0)
  zBuf.fill(-99)
  const cosA = Math.cos(A)
  const sinA = Math.sin(A)
  const cosB = Math.cos(B)
  const sinB = Math.sin(B)
  const halfW = DOT_COLS / 2
  const halfH = DOT_ROWS / 2

  for (let ji = 0; ji < TORUS_J_STEPS.length; ji++) {
    const { cosJ, sinJ, h } = TORUS_J_STEPS[ji]
    const sinJCosA = sinJ * cosA
    const sinJSinA = sinJ * sinA
    const cosJCosA = cosJ * cosA
    const cosJSinA = cosJ * sinA
    const baseD = sinJCosA + 5.2

    for (let ii = 0; ii < TORUS_I_STEPS.length; ii++) {
      const { cosI, sinI } = TORUS_I_STEPS[ii]
      const sinIH = sinI * h
      const D = 1 / (sinIH * sinA + baseD)
      const t = sinIH * cosA - sinJSinA
      const cosIH = cosI * h
      const px = halfW + 39 * D * (cosIH * cosB - t * sinB)
      const py = halfH + 56 * D * (cosIH * sinB + t * cosB)
      const lum = 8 * ((sinJSinA - sinI * cosJCosA) * cosB - sinI * cosJSinA - sinJCosA - cosI * cosJ * sinB)
      if (lum < -2) continue
      const shadeIdx = Math.max(0, Math.min(11, Math.floor(lum)))
      const tone = shadeIdx > 8 ? 3 : shadeIdx > 5 ? 2 : shadeIdx > 2 ? 1 : 0
      plotDot(px, py, tone, D, bits, tones, zBuf)
    }
  }
}

const MODES = [
  { id: "neural", label: "--lattice" },
  { id: "giza", label: "--giza" },
  { id: "torus", label: "--donut" },
]

/**
 * High-resolution 2x4 Unicode Braille 3D <canvas> renderer with drag inertia.
 * Pre-bakes a 32x32 HiDPI dot-pattern sprite atlas (256 Braille masks x 4 theme tones)
 * and caches dimensions via ResizeObserver so animation runs with zero layout reads or allocations.
 */
export default function TerminalArt({ active }) {
  const [mode, setMode] = useState("neural")
  const [paused, setPaused] = useState(false)
  const canvasRef = useRef(null)
  const drawRef = useRef(null)
  const stateRef = useRef({
    a: 0.72,
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

    const bits = new Uint8Array(COLS * ROWS)
    const tones = new Uint8Array(COLS * ROWS)
    const zBuf = new Float32Array(COLS * ROWS)

    let palette = ["#7a7a8c", "#7e9cd8", "#7aa89f", "#e6c384"]
    const size = { width: 0, height: 0, dpr: 1, cellW: 0, cellH: 0 }

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
      const tileW = Math.ceil(size.cellW) + 2
      const tileH = Math.ceil(size.cellH) + 2
      const spriteW = Math.max(2, Math.round(tileW * size.dpr))
      const spriteH = Math.max(4, Math.round(tileH * size.dpr))

      // 32x32 grid of 1024 tiles (4 tones x 256 Braille masks) stays comfortably under mobile GPU limits
      atlasCanvas.width = 32 * spriteW
      atlasCanvas.height = 32 * spriteH
      atlasCtx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0)
      atlasCtx.clearRect(0, 0, 32 * tileW, 32 * tileH)

      const padX = (tileW - size.cellW) * 0.5
      const padY = (tileH - size.cellH) * 0.5
      const colX = [padX + size.cellW * 0.28, padX + size.cellW * 0.72]
      const rowY = [
        padY + size.cellH * 0.14,
        padY + size.cellH * 0.38,
        padY + size.cellH * 0.62,
        padY + size.cellH * 0.86,
      ]
      const radius = Math.max(0.85, Math.min(size.cellW * 0.145, size.cellH * 0.088))

      for (let tone = 0; tone < 4; tone++) {
        atlasCtx.fillStyle = palette[tone] || palette[0]
        atlasCtx.beginPath()
        for (let mask = 1; mask < 256; mask++) {
          const id = (tone << 8) | mask
          const ox = (id & 31) * tileW
          const oy = (id >> 5) * tileH
          for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 2; c++) {
              if (mask & DOT_BITS[r][c]) {
                const cx = ox + colX[c]
                const cy = oy + rowY[r]
                atlasCtx.moveTo(cx + radius, cy)
                atlasCtx.arc(cx, cy, radius, 0, Math.PI * 2)
              }
            }
          }
        }
        atlasCtx.fill()
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
      if (mode === "neural") computeLattice(s.a, s.b, s.tick, bits, tones, zBuf)
      else if (mode === "giza") computeGiza(s.a, s.b, s.tick, bits, tones, zBuf)
      else computeTorus(s.a, s.b, bits, tones, zBuf)

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
            const mask = bits[idx]
            if (!mask) continue
            const id = (tones[idx] << 8) | mask
            const dx = Math.round((x + 0.5) * stepX - halfSpriteW)
            ctx.drawImage(
              atlasCanvas,
              (id & 31) * spriteW,
              (id >> 5) * spriteH,
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

      // Direct dot fallback when offscreen canvas context is unavailable
      ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0)
      ctx.clearRect(0, 0, size.width, size.height)
      const radius = Math.max(0.85, Math.min(size.cellW * 0.145, size.cellH * 0.088))
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const idx = x + y * COLS
          const mask = bits[idx]
          if (!mask) continue
          ctx.fillStyle = palette[tones[idx]] || palette[0]
          const ox = x * size.cellW
          const oy = y * size.cellH
          ctx.beginPath()
          for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 2; c++) {
              if (mask & DOT_BITS[r][c]) {
                const cx = ox + size.cellW * (c === 0 ? 0.28 : 0.72)
                const cy = oy + size.cellH * (0.14 + r * 0.24)
                ctx.moveTo(cx + radius, cy)
                ctx.arc(cx, cy, radius, 0, Math.PI * 2)
              }
            }
          }
          ctx.fill()
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
    let resizeRafId = 0
    const onWindowResize = () => {
      if (syncSize(canvas.clientWidth, canvas.clientHeight)) drawFrame()
    }
    if (typeof ResizeObserver === "function") {
      resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[entries.length - 1]
        if (!entry) return
        const { width, height } = entry.contentRect
        if (resizeRafId) window.cancelAnimationFrame(resizeRafId)
        resizeRafId = window.requestAnimationFrame(() => {
          resizeRafId = 0
          if (syncSize(width, height)) drawFrame()
        })
      })
      resizeObserver.observe(canvas)
    } else {
      window.addEventListener("resize", onWindowResize)
    }

    drawFrame()

    if (!active || paused) {
      return () => {
        drawRef.current = null
        if (resizeRafId) window.cancelAnimationFrame(resizeRafId)
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
        const autoA = mode === "torus" ? 0.85 : mode === "neural" ? 0.42 : 0.25
        const autoB = mode === "torus" ? 0.52 : mode === "neural" ? 0.65 : 0.62
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
      drawRef.current = null
      if (resizeRafId) window.cancelAnimationFrame(resizeRafId)
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
