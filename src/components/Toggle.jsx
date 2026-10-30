import "./Toggle.css"

/** A checkbox-looking button: "[x] all" when active, "[ ] all" when not. */
export default function Toggle({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={active ? "toggle toggle--active" : "toggle"}
    >
      <span aria-hidden="true" className="toggle__box">
        {active ? "[x] " : "[ ] "}
      </span>
      {children}
    </button>
  )
}
