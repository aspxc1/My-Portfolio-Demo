import { memo, useEffect, useRef } from "react"

const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

function parseCssColor(value, fallback) {
  if (!value) return fallback
  const trimmed = value.trim()
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1)
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ]
    }
    if (hex.length >= 6) {
      const n = parseInt(hex.slice(0, 6), 16)
      if (!Number.isNaN(n)) return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    }
  }
  const rgbMatch = trimmed.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i)
  if (rgbMatch) {
    return [
      Math.round(Number(rgbMatch[1])),
      Math.round(Number(rgbMatch[2])),
      Math.round(Number(rgbMatch[3])),
    ]
  }
  return fallback
}

function mixRgb(a, b, t) {
  const k = Math.max(0, Math.min(1, t))
  return [
    Math.round(a[0] + (b[0] - a[0]) * k),
    Math.round(a[1] + (b[1] - a[1]) * k),
    Math.round(a[2] + (b[2] - a[2]) * k),
  ]
}

function elevation(nx, ny) {
  const d1 = Math.hypot((nx - 0.22) * 1.35, ny - 0.28)
  const d2 = Math.hypot((nx - 0.82) * 1.25, ny - 0.74)
  const d3 = Math.hypot((nx - 0.58) * 1.1, ny - 0.16)
  return (
    Math.exp(-d1 * d1 * 4.5) * 1.05 +
    Math.exp(-d2 * d2 * 3.6) * 0.95 +
    Math.exp(-d3 * d3 * 6.0) * 0.55 +
    0.2 * Math.sin(nx * 5.2 + ny * 2.4) +
    0.12 * Math.cos(nx * 2.7 - ny * 4.8)
  )
}

function drawHybridBackdrop(canvas) {
  if (!canvas || typeof window === "undefined") return
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const vw = window.innerWidth || 1280
  const vh = window.innerHeight || 800
  const w = Math.min(Math.max(320, Math.round(vw)), 1280)
  const h = Math.min(Math.max(200, Math.round(vh)), 800)

  canvas.width = w
  canvas.height = h

  const styles = getComputedStyle(document.documentElement)
  const cBack = parseCssColor(styles.getPropertyValue("--backdrop"), [22, 22, 29])
  const cMantle = parseCssColor(styles.getPropertyValue("--mantle"), [25, 25, 34])
  const cBg = parseCssColor(styles.getPropertyValue("--background"), [31, 31, 40])
  const cSurface = parseCssColor(styles.getPropertyValue("--surface"), [37, 37, 48])
  const cBorder = parseCssColor(styles.getPropertyValue("--border"), [58, 58, 76])
  const cMuted = parseCssColor(styles.getPropertyValue("--muted-foreground"), [154, 150, 133])
  const cPrimary = parseCssColor(styles.getPropertyValue("--primary"), [230, 195, 132])

  const luma = 0.299 * cBack[0] + 0.587 * cBack[1] + 0.114 * cBack[2]
  const isLight = styles.colorScheme === "light" || luma > 145

  const img = ctx.createImageData(w, h)
  const data = img.data
  const bands = 11
  const maxDim = Math.max(w, h)
  const eps = 1 / maxDim
  const minorLine = mixRgb(cBack, cBorder, isLight ? 0.55 : 0.48)
  const majorLine = mixRgb(cBorder, cPrimary, 0.28)
  const ditherPal = [
    cBack,
    mixRgb(cBack, cMantle, 0.85),
    mixRgb(cBack, cBg, 0.72),
    mixRgb(cMantle, cSurface, 0.55),
  ]

  for (let y = 0; y < h; y++) {
    const ny = y / h
    const by = ((y / 2) | 0) & 3
    for (let x = 0; x < w; x++) {
      const nx = x / w
      const bx = ((x / 2) | 0) & 3

      const h0 = elevation(nx, ny)
      const hx = elevation(nx + eps, ny)
      const hy = elevation(nx, ny + eps)
      const grad = Math.hypot(hx - h0, hy - h0) / eps

      const scaled = (h0 + 0.5) * bands
      const bandIdx = Math.floor(scaled)
      const frac = scaled - bandIdx
      const distToEdge = Math.min(frac, 1 - frac)
      const screenDist = (distToEdge / Math.max(0.05, grad * bands)) * maxDim
      const isMajor = ((bandIdx % 3) + 3) % 3 === 0
      const lineWidth = isMajor ? 1.15 : 0.75

      const normH = Math.max(0, Math.min(0.999, (h0 + 0.3) / 1.75)) * (ditherPal.length - 1)
      const lo = Math.floor(normH)
      const hi = Math.min(ditherPal.length - 1, lo + 1)
      const thresh = (BAYER_4X4[by][bx] + 0.5) / 16
      const baseCol = normH - lo > thresh ? ditherPal[hi] : ditherPal[lo]

      let finalCol = baseCol
      if (screenDist < lineWidth) {
        const lineAlpha = (1 - screenDist / lineWidth) * (isMajor ? 0.62 : 0.28)
        finalCol = mixRgb(baseCol, isMajor ? majorLine : minorLine, lineAlpha)
      }

      const idx = (y * w + x) * 4
      data[idx] = finalCol[0]
      data[idx + 1] = finalCol[1]
      data[idx + 2] = finalCol[2]
      data[idx + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)

  ctx.strokeStyle = `rgba(${cMuted[0]}, ${cMuted[1]}, ${cMuted[2]}, 0.32)`
  ctx.lineWidth = 1
  const marks = [
    [18, 18],
    [w - 18, 18],
    [18, h - 18],
    [w - 18, h - 18],
  ]
  for (const [mx, my] of marks) {
    ctx.beginPath()
    ctx.moveTo(mx - 6, my)
    ctx.lineTo(mx + 6, my)
    ctx.moveTo(mx, my - 6)
    ctx.lineTo(mx, my + 6)
    ctx.stroke()
  }
}

/** Static one-shot Bayer-dithered topographic contour desktop wallpaper for the hybrid surface. */
function SessionBackdrop({ themeId, accentId }) {
  const canvasRef = useRef(null)
  const sizeRef = useRef({ w: 0, h: 0 })

  useEffect(() => {
    let rafId = 0
    let resizeTimer = 0

    const scheduleRender = () => {
      if (rafId) window.cancelAnimationFrame(rafId)
      rafId = window.requestAnimationFrame(() => {
        rafId = 0
        sizeRef.current = { w: window.innerWidth, h: window.innerHeight }
        drawHybridBackdrop(canvasRef.current)
      })
    }

    scheduleRender()

    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        const dw = Math.abs(window.innerWidth - sizeRef.current.w)
        const dh = Math.abs(window.innerHeight - sizeRef.current.h)
        if (dw > 48 || dh > 48) {
          scheduleRender()
        }
      }, 180)
    }

    window.addEventListener("resize", onResize, { passive: true })
    return () => {
      window.removeEventListener("resize", onResize)
      window.clearTimeout(resizeTimer)
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [themeId, accentId])

  return (
    <div className="session__backdrop" aria-hidden="true">
      <canvas ref={canvasRef} className="session__backdrop-canvas" />
      <span className="session__backdrop-datum session__backdrop-datum--tl">30°02&apos;40&quot;N 31°14&apos;09&quot;E</span>
      <span className="session__backdrop-datum session__backdrop-datum--br">ELEV 142M // WGS84</span>
    </div>
  )
}

export default memo(SessionBackdrop)
