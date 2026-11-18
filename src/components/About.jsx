import { sections } from "../content/site.js"
import GitHubMonitor from "./GitHubMonitor.jsx"
import TerminalSection from "./TerminalSection.jsx"

export default function About({ onReady, onNavigate }) {
  return (
    <TerminalSection section={sections.about} roomy onReady={onReady} onNavigate={onNavigate}>
      <GitHubMonitor />
    </TerminalSection>
  )
}
