import { House, CaretRight } from '@phosphor-icons/react'
import { Link, useLocation } from 'react-router-dom'

const routeLabels: Record<string, string> = {
  '/': 'Accueil',
  '/submit': 'Nouvelle Demande',
  '/requests': 'Mes Demandes',
  '/login': 'Connexion',
  '/demarches': 'Démarches',
  '/privacy': 'Politique de Confidentialité',
  '/terms': 'Conditions d\'Utilisation',
  '/accessibility': 'Accessibilité',
  '/etat-civil': 'État Civil',
  '/cpas': 'CPAS',
  '/plan-du-site': 'Plan du Site',
}

export function Breadcrumb() {
  const location = useLocation()
  const pathname = location.pathname

  // Don't show on home page
  if (pathname === '/') return null

  // Remove trailing slashes and split
  const segments = pathname.split('/').filter(Boolean)
  const crumbs = [{ path: '/', label: 'Accueil' }]

  // Build up path segments
  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`
    const label = routeLabels[currentPath] || segment
    crumbs.push({ path: currentPath, label })
  }

  return (
    <nav aria-label="Fil d'Ariane" className="container-page py-3">
      <ol className="flex items-center gap-2 text-sm text-text-muted flex-wrap">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <li key={crumb.path} className="flex items-center gap-2">
              {index === 0 ? (
                <Link
                  to="/"
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <House size={14} />
                  <span className="sr-only">Accueil</span>
                </Link>
              ) : (
                <>
                  <CaretRight size={12} className="text-text-muted shrink-0" />
                  {isLast ? (
                    <span className="text-text-primary font-medium" aria-current="page">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="hover:text-primary transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
