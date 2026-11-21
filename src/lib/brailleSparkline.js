/**
 * Render numeric series into btop-style Unicode braille columns (two data points per glyph).
 */
const BRAILLE_BASE = 0x2800
const LEFT_BITS = [0x00, 0x40, 0x44, 0x46, 0x47]
const RIGHT_BITS = [0x00, 0x80, 0xa0, 0xb0, 0xb8]

export function toBrailleSparkline(values, { min, max } = {}) {
  if (!Array.isArray(values) || values.length === 0) return ""
  const finite = values.map((v) => (Number.isFinite(v) ? v : 0))
  const lo = min ?? Math.min(...finite)
  const hi = max ?? Math.max(...finite)
  const span = hi - lo

  const level = (val) => {
    if (val <= 0 && lo === 0 && span === 0) return 0
    if (span <= 0) return 2
    const norm = (val - lo) / span
    if (norm <= 0) return val > 0 ? 1 : 0
    return Math.max(1, Math.min(4, Math.ceil(norm * 4)))
  }

  let out = ""
  for (let i = 0; i < finite.length; i += 2) {
    const l = LEFT_BITS[level(finite[i])]
    const r = i + 1 < finite.length ? RIGHT_BITS[level(finite[i + 1])] : 0
    out += String.fromCharCode(BRAILLE_BASE | l | r)
  }
  return out
}
