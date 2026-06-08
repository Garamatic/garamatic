import { Link } from 'react-router-dom'
import { TreeStructure, ArrowRight } from '@phosphor-icons/react'

const sections = [
  {
    title: 'Guichet Citoyen',
    links: [
      { label: 'Accueil', path: '/' },
      { label: 'Nouvelle Demande', path: '/submit' },
      { label: 'Mes Demandes', path: '/requests' },
      { label: 'Connexion', path: '/login' },
    ],
  },
  {
    title: 'Démarches',
    links: [
      { label: 'Guide des démarches', path: '/demarches' },
      { label: 'État civil', path: '/etat-civil' },
      { label: 'CPAS', path: '/cpas' },
    ],
  },
  {
    title: 'Informations légales',
    links: [
      { label: 'Politique de confidentialité', path: '/privacy' },
      { label: "Conditions d'utilisation", path: '/terms' },
      { label: 'Accessibilité', path: '/accessibility' },
    ],
  },
]

export function PlanDuSitePage() {
  return (
    <div className="container-page py-8 md:py-12">
      <div className="mb-8 pb-4 border-b border-border">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2 font-heading uppercase tracking-wider">
          Plan du Site
        </h1>
        <p className="text-text-secondary italic">
          Retrouvez toutes les pages du Guichet Citoyen
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="font-heading font-semibold text-primary mb-4 uppercase tracking-wider text-sm">
              {section.title}
            </h2>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <ArrowRight size={12} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-accent-subtle border border-border rounded-md">
        <div className="flex items-start gap-3">
          <TreeStructure size={18} className="text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-text-secondary">
            <p className="font-medium text-text-primary mb-1">
              Une page manquante ?
            </p>
            <p>
              Si vous ne trouvez pas l'information recherchée, contactez le Service Municipal
              au numéro indiqué en bas de page.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
