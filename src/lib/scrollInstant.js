/** Scrolls the window to the top immediately, falling back cleanly when behavior: "instant" is unsupported. */
export function scrollWindowTopInstant() {
  try {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
  } catch {
    window.scrollTo(0, 0)
  }
}

/** Scrolls an element into view immediately, falling back to "auto" on engines that reject "instant". */
export function scrollElementInstant(element, block = "nearest") {
  if (!element) return
  try {
    element.scrollIntoView({ block, behavior: "instant" })
  } catch {
    element.scrollIntoView({ block, behavior: "auto" })
  }
}
