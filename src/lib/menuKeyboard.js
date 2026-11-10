/** Numbers are global; reading keys belong to the menu only while it has focus. */
export function getMenuKeyAction(event, context) {
  const { selectedIndex, count, insideMenu, interactive, editing } = context
  const index = insideMenu && context.focusedIndex >= 0 ? context.focusedIndex : selectedIndex
  if (!count || editing || (interactive && !insideMenu) || event.defaultPrevented
    || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing) return null

  if (insideMenu && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
    return { type: "select", index: (index + (event.key === "ArrowDown" ? 1 : -1) + count) % count }
  }
  if (insideMenu && (event.key === "Home" || event.key === "End")) {
    return { type: "select", index: event.key === "Home" ? 0 : count - 1 }
  }
  if (event.repeat) return null
  if (insideMenu && event.key === "Enter") return { type: "open", index }
  if (/^[1-9]$/.test(event.key) && Number(event.key) <= count) {
    return { type: "open", index: Number(event.key) - 1 }
  }
  return null
}
