import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { House, FilePlus, List, X, List as MenuIcon, SignIn, SignOut, User, FileText } from '@phosphor-icons/react'

const navItems = [
  { path: '/', label: 'Accueil', icon: House },
  { path: '/demarches', label: 'Démarches', icon: FileText },
  { path: '/submit', label: 'Nouvelle Demande', icon: FilePlus },
  { path: '/requests', label: 'Mes Demandes', icon: List },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const email = sessionStorage.getItem('portalEmail')
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const handleLogout = () => {
    sessionStorage.removeItem('portalEmail')
    navigate('/')
  }

  // Focus trap for mobile menu
  useEffect(() => {
    if (!menuOpen) return

    const menu = mobileMenuRef.current
    if (!menu) return

    const focusable = menu.querySelectorAll<HTMLElement>(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
        return
      }
      if (e.key !== 'Tab') return

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Focus first item when menu opens
    first?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-50 bg-primary border-b border-primary-hover shadow-md">
      <div className="container-page">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-full bg-white flex items-center justify-center shadow-lg shadow-black/20 overflow-hidden ring-2 ring-white/50">
              <div
                className="h-9 w-9 bg-primary"
                style={{
                  maskImage: 'url(/desgoffe_transparent.png)',
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskImage: 'url(/desgoffe_transparent.png)',
                  WebkitMaskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                }}
                aria-label="Commune de Desgoffe"
                role="img"
              />
            </div>
            <div className="hidden sm:block">
              <span className="font-semibold text-white leading-tight block font-heading">Guichet Citoyen</span>
              <span className="text-xs text-white/70 leading-tight block">Commune de Desgoffe</span>
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
            ref={menuButtonRef}
            className="md:hidden p-2.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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
        <div ref={mobileMenuRef} className="md:hidden border-t border-primary-hover bg-primary">
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
