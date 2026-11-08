import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"
import App from "./App.jsx"
import "./styles/global.css"

// Refresh starts at the top; ordinary section links still keep their anchors.
window.history.scrollRestoration = "manual"
if (performance.getEntriesByType("navigation")[0]?.type === "reload") {
  window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search)
  window.scrollTo({ top: 0, left: 0, behavior: "instant" })
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
