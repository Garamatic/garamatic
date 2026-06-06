import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { House, FilePlus, List, X, List as MenuIcon, SignIn, SignOut, User } from '@phosphor-icons/react'

const navItems = [
  { path: '/', label: 'Accueil', icon: House },
  { path: '/submit', label: 'Nouvelle Demande', icon: FilePlus },
  { path: '/requests', label: 'Mes Demandes', icon: List },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const email = sessionStorage.getItem('portalEmail')

  const handleLogout = () => {
    sessionStorage.removeItem('portalEmail')
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container-page">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center text-white font-bold text-lg shrink-0">
              D
            </div>
            <div className="hidden sm:block">
              <span className="font-semibold text-text-primary leading-tight block">Guichet Citoyen</span>
              <span className="text-xs text-text-muted leading-tight block">Ville de Desgoffe</span>
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
                      ? 'text-accent bg-accent-subtle'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }`
                }
              >
                <item.icon size={18} weight="regular" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-2">
            {email ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary flex items-center gap-1">
                  <User size={14} />
                  {email}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-ghost px-3 py-1.5 text-sm"
                >
                  <SignOut size={16} />
                  Déconnexion
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="btn btn-primary px-3 py-1.5 text-sm"
              >
                <SignIn size={16} />
                Connexion
              </NavLink>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
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
        <div className="md:hidden border-t border-border bg-surface">
          <nav className="container-page py-2 flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-accent bg-accent-subtle'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }`
                }
              >
                <item.icon size={20} weight="regular" />
                {item.label}
              </NavLink>
            ))}
            {email ? (
              <button
                onClick={() => { handleLogout(); setMenuOpen(false) }}
                className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
              >
                <SignOut size={20} />
                Déconnexion ({email})
              </button>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-accent hover:bg-accent-subtle transition-colors"
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
