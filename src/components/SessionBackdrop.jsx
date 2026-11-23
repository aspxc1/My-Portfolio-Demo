import { memo, useEffect, useLayoutEffect, useRef } from "react"

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

const BAYER_THRESHOLDS = Float32Array.from(
  [
    0, 8, 2, 10,
    12, 4, 14, 6,
    3, 11, 1, 9,
    15, 7, 13, 5,
  ],
  (v) => (v + 0.5) / 16,
)

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

function mixChannel(a, b, t) {
  const k = t < 0 ? 0 : t > 1 ? 1 : t
  return Math.round(a + (b - a) * k)
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

  const minorT = isLight ? 0.55 : 0.48
  const minorR = mixChannel(cBack[0], cBorder[0], minorT)
  const minorG = mixChannel(cBack[1], cBorder[1], minorT)
  const minorB = mixChannel(cBack[2], cBorder[2], minorT)

  const majorR = mixChannel(cBorder[0], cPrimary[0], 0.28)
  const majorG = mixChannel(cBorder[1], cPrimary[1], 0.28)
  const majorB = mixChannel(cBorder[2], cPrimary[2], 0.28)

  const pal = new Uint8Array([
    cBack[0], cBack[1], cBack[2],
    mixChannel(cBack[0], cMantle[0], 0.85), mixChannel(cBack[1], cMantle[1], 0.85), mixChannel(cBack[2], cMantle[2], 0.85),
    mixChannel(cBack[0], cBg[0], 0.72), mixChannel(cBack[1], cBg[1], 0.72), mixChannel(cBack[2], cBg[2], 0.72),
    mixChannel(cMantle[0], cSurface[0], 0.55), mixChannel(cMantle[1], cSurface[1], 0.55), mixChannel(cMantle[2], cSurface[2], 0.55),
  ])

  // Precompute separable 1D factors along X so the inner loop uses pure arithmetic.
  const ex1 = new Float32Array(w)
  const dex1 = new Float32Array(w)
  const ex2 = new Float32Array(w)
  const dex2 = new Float32Array(w)
  const ex3 = new Float32Array(w)
  const dex3 = new Float32Array(w)
  const s1x = new Float32Array(w)
  const c1x = new Float32Array(w)
  const s2x = new Float32Array(w)
  const c2x = new Float32Array(w)

  const invW = 1 / w
  const invH = 1 / h
  for (let x = 0; x < w; x++) {
    const nx = x * invW
    const u1 = nx - 0.22
    const u2 = nx - 0.82
    const u3 = nx - 0.58

    const g1x = 1.05 * Math.exp(-8.20125 * u1 * u1)
    ex1[x] = g1x
    dex1[x] = g1x * (-16.4025 * u1)

    const g2x = 0.95 * Math.exp(-5.625 * u2 * u2)
    ex2[x] = g2x
    dex2[x] = g2x * (-11.25 * u2)

    const g3x = 0.55 * Math.exp(-7.26 * u3 * u3)
    ex3[x] = g3x
    dex3[x] = g3x * (-14.52 * u3)

    const a1 = 5.2 * nx
    s1x[x] = Math.sin(a1)
    c1x[x] = Math.cos(a1)

    const a2 = 2.7 * nx
    s2x[x] = Math.sin(a2)
    c2x[x] = Math.cos(a2)
  }

  const img = ctx.createImageData(w, h)
  const data = img.data
  const bands = 11
  const maxDim = Math.max(w, h)
  const scaleNorm = maxDim / bands
  const invRange = 3 / 1.75

  for (let y = 0; y < h; y++) {
    const ny = y * invH
    const byOffset = (((y >> 1) & 3) << 2)
    const v1 = ny - 0.28
    const v2 = ny - 0.74
    const v3 = ny - 0.16

    const ey1 = Math.exp(-4.5 * v1 * v1)
    const dey1 = ey1 * (-9.0 * v1)
    const ey2 = Math.exp(-3.6 * v2 * v2)
    const dey2 = ey2 * (-7.2 * v2)
    const ey3 = Math.exp(-6.0 * v3 * v3)
    const dey3 = ey3 * (-12.0 * v3)

    const s1y = Math.sin(2.4 * ny)
    const c1y = Math.cos(2.4 * ny)
    const s2y = Math.sin(4.8 * ny)
    const c2y = Math.cos(4.8 * ny)

    let idx = y * w * 4
    for (let x = 0; x < w; x++) {
      const gx1 = ex1[x]
      const gx2 = ex2[x]
      const gx3 = ex3[x]
      const sx1 = s1x[x]
      const cx1 = c1x[x]
      const sx2 = s2x[x]
      const cx2 = c2x[x]

      const sin1 = sx1 * c1y + cx1 * s1y
      const cos1 = cx1 * c1y - sx1 * s1y
      const cos2 = cx2 * c2y + sx2 * s2y
      const sin2 = sx2 * c2y - cx2 * s2y

      const h0 =
        gx1 * ey1 +
        gx2 * ey2 +
        gx3 * ey3 +
        0.2 * sin1 +
        0.12 * cos2

      const dhdx =
        dex1[x] * ey1 +
        dex2[x] * ey2 +
        dex3[x] * ey3 +
        1.04 * cos1 -
        0.324 * sin2

      const dhdy =
        gx1 * dey1 +
        gx2 * dey2 +
        gx3 * dey3 +
        0.48 * cos1 +
        0.576 * sin2

      const grad = Math.sqrt(dhdx * dhdx + dhdy * dhdy)

      const scaled = (h0 + 0.5) * bands
      const bandIdx = Math.floor(scaled)
      const frac = scaled - bandIdx
      const distToEdge = frac < 0.5 ? frac : 1 - frac
      const denom = grad > 0.05 / bands ? grad : 0.05 / bands
      const screenDist = (distToEdge / denom) * scaleNorm
      const isMajor = ((bandIdx % 3) + 3) % 3 === 0
      const lineWidth = isMajor ? 1.15 : 0.75

      const normH = Math.max(0, Math.min(2.999, (h0 + 0.3) * invRange))
      const lo = normH | 0
      const hi = lo < 3 ? lo + 1 : 3
      const thresh = BAYER_THRESHOLDS[byOffset | ((x >> 1) & 3)]
      const pOff = (normH - lo > thresh ? hi : lo) * 3

      let r = pal[pOff]
      let g = pal[pOff + 1]
      let b = pal[pOff + 2]

      if (screenDist < lineWidth) {
        const lineAlpha = (1 - screenDist / lineWidth) * (isMajor ? 0.62 : 0.28)
        const tr = isMajor ? majorR : minorR
        const tg = isMajor ? majorG : minorG
        const tb = isMajor ? majorB : minorB
        r = Math.round(r + (tr - r) * lineAlpha)
        g = Math.round(g + (tg - g) * lineAlpha)
        b = Math.round(b + (tb - b) * lineAlpha)
      }

      data[idx] = r
      data[idx + 1] = g
      data[idx + 2] = b
      data[idx + 3] = 255
      idx += 4
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

/** Static one-shot Bayer-dithered topographic contour desktop wallpaper rendered before first paint. */
function SessionBackdrop({ themeId, accentId }) {
  const canvasRef = useRef(null)
  const sizeRef = useRef({ w: 0, h: 0 })

  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement
    if (themeId && root.dataset.theme !== themeId) root.dataset.theme = themeId
    if (accentId && root.dataset.accent !== accentId) root.dataset.accent = accentId

    sizeRef.current = { w: window.innerWidth, h: window.innerHeight }
    drawHybridBackdrop(canvasRef.current)

    let rafId = 0
    let resizeTimer = 0

    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        const dw = Math.abs(window.innerWidth - sizeRef.current.w)
        const dh = Math.abs(window.innerHeight - sizeRef.current.h)
        if (dw > 48 || dh > 48) {
          if (rafId) window.cancelAnimationFrame(rafId)
          rafId = window.requestAnimationFrame(() => {
            rafId = 0
            sizeRef.current = { w: window.innerWidth, h: window.innerHeight }
            drawHybridBackdrop(canvasRef.current)
          })
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
