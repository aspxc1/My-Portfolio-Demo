/**
 * Opt-in synthesized Web Audio terminal clicks & BEL tone (strictly silent until enabled).
 */
let audioCtx = null

function getContext() {
  if (typeof window === "undefined") return null
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null
  if (!audioCtx) audioCtx = new Ctx()
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {})
  return audioCtx
}

export function playKeyTick(enabled) {
  if (!enabled) return
  const ctx = getContext()
  if (!ctx) return
  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "triangle"
    osc.frequency.setValueAtTime(1450, now)
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.018)
    gain.gain.setValueAtTime(0.028, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.022)
  } catch {
    // Ignore audio errors when blocked by autoplay policy.
  }
}

export function playTerminalBell(enabled) {
  if (!enabled) return
  const ctx = getContext()
  if (!ctx) return
  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(520, now)
    gain.gain.setValueAtTime(0.032, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.09)
  } catch {
    // Ignore audio errors.
  }
}
