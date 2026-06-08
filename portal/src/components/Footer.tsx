import { Phone, Envelope, MapPin, Clock } from '@phosphor-icons/react'
import { NavLink } from 'react-router-dom'
import { MUNICIPALITY } from '../config/municipality'

export function Footer() {
  return (
    <footer className="bg-primary text-white border-t border-primary-hover">
      <div className="container-page py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center overflow-hidden ring-1 ring-white/40">
                <img
                  src="/desgoffe.png"
                  alt={MUNICIPALITY.name}
                  className="h-6 w-auto"
                  loading="lazy"
                />
              </div>
              <span className="font-semibold text-white font-heading">{MUNICIPALITY.name}</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed mb-4">
              Guichet Citoyen — Services municipaux en ligne pour les citoyens de {MUNICIPALITY.name}.
            </p>
            <div className="space-y-1 text-sm text-white/70">
              <p>RPM : {MUNICIPALITY.rpm}</p>
              <p>N° d'entreprise : {MUNICIPALITY.enterpriseNumber}</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 font-heading uppercase tracking-wider">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-white/80">
                <Phone size={16} />
                <a href={`tel:${MUNICIPALITY.phone}`} className="hover:text-white transition-colors">{MUNICIPALITY.phone}</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/80">
                <Envelope size={16} />
                <a href={`mailto:${MUNICIPALITY.email}`} className="hover:text-white transition-colors">{MUNICIPALITY.email}</a>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/80">
                <MapPin size={16} className="shrink-0 mt-0.5" />
                <span>
                  {MUNICIPALITY.address.street}<br />
                  {MUNICIPALITY.address.postcode} {MUNICIPALITY.address.locality}
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/80">
                <Clock size={16} className="shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed">
                  Lun–Ven : {MUNICIPALITY.hours.monday}<br />
                  Mercredi après-midi : sur rendez-vous
                </span>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 font-heading uppercase tracking-wider">Liens utiles</h3>
            <ul className="space-y-2">
              <li>
                <NavLink to="/privacy" className="text-sm text-white/80 hover:text-white transition-colors">
                  Politique de confidentialité
                </NavLink>
              </li>
              <li>
                <NavLink to="/terms" className="text-sm text-white/80 hover:text-white transition-colors">
                  Conditions d'utilisation
                </NavLink>
              </li>
              <li>
                <NavLink to="/accessibility" className="text-sm text-white/80 hover:text-white transition-colors">
                  Accessibilité
                </NavLink>
              </li>
              <li>
                <NavLink to="/demarches" className="text-sm text-white/80 hover:text-white transition-colors">
                  Démarches administratives
                </NavLink>
              </li>
              <li>
                <NavLink to="/plan-du-site" className="text-sm text-white/80 hover:text-white transition-colors">
                  Plan du site
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/20 text-center">
          <p className="text-sm font-bold text-white tracking-widest uppercase">
            &copy; {new Date().getFullYear()} {MUNICIPALITY.name}
          </p>
          <p className="text-xs text-white/60 mt-1">
            Délégué à la Protection des Données : {MUNICIPALITY.dpo.name} —{' '}
            <a href={`mailto:${MUNICIPALITY.dpo.email}`} className="underline hover:text-white">{MUNICIPALITY.dpo.email}</a>
          </p>
          <p className="text-xs text-white/60 mt-1">
            Pour toute question, contactez le Service Municipal au {MUNICIPALITY.phone}
          </p>
        </div>
      </div>
    </footer>
  )
}
