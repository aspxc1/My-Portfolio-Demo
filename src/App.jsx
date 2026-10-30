import { Route, Routes } from "react-router"
import ScrollToHash from "./components/ScrollToHash.jsx"
import SiteFooter from "./components/SiteFooter.jsx"
import SiteHeader from "./components/SiteHeader.jsx"
import HomePage from "./pages/HomePage.jsx"
import NotFoundPage from "./pages/NotFoundPage.jsx"
import ProjectPage from "./pages/ProjectPage.jsx"

/** Every page shares the header and footer. Routes decide what goes in between. */
export default function App() {
  return (
    <>
      <ScrollToHash />
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <SiteFooter />
    </>
  )
}
