import { Route, Routes } from "react-router"
import SessionTransition from "./components/SessionTransition.jsx"
import HomePage from "./pages/HomePage.jsx"
import NotFoundPage from "./pages/NotFoundPage.jsx"
import ProjectPage from "./pages/ProjectPage.jsx"
import PortfolioSession from "./components/PortfolioSession.jsx"

/** A single terminal surface; navigation clears one view before revealing another. */
export default function App() {
  return (
    <PortfolioSession>
    <SessionTransition>
      {(location) => (
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects/:slug" element={<ProjectPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      )}
    </SessionTransition>
    </PortfolioSession>
  )
}
