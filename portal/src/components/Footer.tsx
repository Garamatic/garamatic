import { Phone, Envelope, MapPin } from '@phosphor-icons/react'

export function Footer() {
  return (
    <footer className="bg-primary text-white border-t border-primary-hover">
      <div className="container-page py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-primary font-bold text-sm font-heading">
                D
              </div>
              <span className="font-semibold text-white font-heading">Ville de Desgoffe</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Guichet Citoyen — Services municipaux en ligne pour les citoyens de Desgoffe.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 font-heading uppercase tracking-wider">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-white/80">
                <Phone size={16} />
                <span>+32 2 555 01 01</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/80">
                <Envelope size={16} />
                <span>contact@desgoffe.be</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/80">
                <MapPin size={16} />
                <span>Grand-Place 1, 1000 Desgoffe</span>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 font-heading uppercase tracking-wider">Liens utiles</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-white/80 hover:text-white transition-colors">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-white/80 hover:text-white transition-colors">
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-white/80 hover:text-white transition-colors">
                  Accessibilité
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/20 text-center">
          <p className="text-sm font-bold text-white tracking-widest uppercase">
            &copy; {new Date().getFullYear()} Ville de Desgoffe
          </p>
          <p className="text-xs text-white/60 mt-1">
            Pour toute question, contactez le Service Municipal au +32 2 555 01 01
          </p>
        </div>
      </div>
    </footer>
  )
}
