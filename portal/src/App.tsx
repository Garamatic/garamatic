import { Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { LandingPage } from './pages/LandingPage'
import { SubmitPage } from './pages/SubmitPage'
import { SuccessPage } from './pages/SuccessPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'

function App() {
  return (
    <div className="min-h-dvh flex flex-col bg-canvas text-text-primary font-sans">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/success/:ticketId?" element={<SuccessPage />} />
          <Route path="/requests" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
