import { Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Breadcrumb } from './components/Breadcrumb'
import { LandingPage } from './pages/LandingPage'
import { SubmitPage } from './pages/SubmitPage'
import { SuccessPage } from './pages/SuccessPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { TermsPage } from './pages/TermsPage'
import { AccessibilityPage } from './pages/AccessibilityPage'
import { DemarchesPage } from './pages/DemarchesPage'
import { EtatCivilPage } from './pages/EtatCivilPage'
import { CpasPage } from './pages/CpasPage'
import { PlanDuSitePage } from './pages/PlanDuSitePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { EmergencyBanner } from './components/EmergencyBanner'

function App() {
  return (
    <div className="min-h-dvh flex flex-col bg-canvas text-text-primary font-sans">
      <Header />
      <EmergencyBanner />
      <Breadcrumb />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/success/:ticketId?" element={<SuccessPage />} />
          <Route path="/requests" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/demarches" element={<DemarchesPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/accessibility" element={<AccessibilityPage />} />
          <Route path="/etat-civil" element={<EtatCivilPage />} />
          <Route path="/cpas" element={<CpasPage />} />
          <Route path="/plan-du-site" element={<PlanDuSitePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
