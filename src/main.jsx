import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"
import App from "./App.jsx"
import { scrollWindowTopInstant } from "./lib/scrollInstant.js"
import "./styles/global.css"

// Refresh keeps the selected terminal view and always starts at its top.
window.history.scrollRestoration = "manual"
if (performance.getEntriesByType("navigation")[0]?.type === "reload") {
  scrollWindowTopInstant()
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
