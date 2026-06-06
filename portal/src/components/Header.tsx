import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { House, FilePlus, List, X, List as MenuIcon, SignIn, SignOut, User } from '@phosphor-icons/react'

const navItems = [
  { path: '/', label: 'Accueil', icon: House },
  { path: '/submit', label: 'Nouvelle Demande', icon: FilePlus },
  { path: '/requests', label: 'Mes Demandes', icon: List },
]

function getPendingCount() {
  const tickets = JSON.parse(sessionStorage.getItem('submittedTickets') || '[]')
  const email = sessionStorage.getItem('portalEmail')
  if (!email) return 0
  return tickets.filter((t: any) => 
    t.email === email && 
    ['submitted', 'received', 'in_progress'].includes(t.status)
  ).length
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const email = sessionStorage.getItem('portalEmail')
  const pendingCount = getPendingCount()
  const isDemoMode = !import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_BASE === ''

  const handleLogout = () => {
    sessionStorage.removeItem('portalEmail')
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-primary border-b border-primary-hover shadow-md">
      {isDemoMode && (
        <div className="bg-secondary text-white text-center py-1 text-xs font-medium">
          🏛️ Mode Démonstration — Les données sont fictives
        </div>
      )}
      <div className="container-page">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-md bg-surface flex items-center justify-center border border-white/30 overflow-hidden">
              <img
                src="/desgoffe.png"
                alt="Ville de Desgoffe"
                className="h-8 w-auto"
              />
            </div>
            <div className="hidden sm:block">
              <span className="font-semibold text-white leading-tight block font-heading">Guichet Citoyen</span>
              <span className="text-xs text-white/70 leading-tight block">Ville de Desgoffe</span>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary bg-white/90'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <item.icon size={18} weight="regular" />
                {item.label}
                {item.path === '/requests' && pendingCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-secondary rounded-full">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-2">
            {email ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/80 flex items-center gap-1">
                  <User size={14} />
                  {email}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn bg-white/10 text-white hover:bg-white/20 px-3 py-1.5 text-sm"
                >
                  <SignOut size={16} />
                  Déconnexion
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="btn bg-white text-primary hover:bg-white/90 px-3 py-1.5 text-sm"
              >
                <SignIn size={16} />
                Connexion
              </NavLink>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {menuOpen && (
        <div className="md:hidden border-t border-primary-hover bg-primary">
          <nav className="container-page py-2 flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary bg-white/90'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <item.icon size={20} weight="regular" />
                {item.label}
                {item.path === '/requests' && pendingCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-secondary rounded-full">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            ))}
            {email ? (
              <button
                onClick={() => { handleLogout(); setMenuOpen(false) }}
                className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <SignOut size={20} />
                Déconnexion ({email})
              </button>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-white hover:bg-white/20 transition-colors"
              >
                <SignIn size={20} />
                Connexion
              </NavLink>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
