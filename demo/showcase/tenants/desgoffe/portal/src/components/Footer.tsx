import { Phone, Envelope, MapPin } from '@phosphor-icons/react'

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="container-page py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-white font-bold text-sm">
                D
              </div>
              <span className="font-semibold text-text-primary">Ville de Desgoffe</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Guichet Citoyen — Services municipaux en ligne pour les citoyens de Desgoffe.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-text-secondary">
                <Phone size={16} />
                <span>+32 2 555 01 01</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-text-secondary">
                <Envelope size={16} />
                <span>contact@desgoffe.be</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-text-secondary">
                <MapPin size={16} />
                <span>Grand-Place 1, 1000 Desgoffe</span>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Liens utiles</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-text-secondary hover:text-accent transition-colors">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-text-secondary hover:text-accent transition-colors">
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-text-secondary hover:text-accent transition-colors">
                  Accessibilité
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Ville de Desgoffe. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
