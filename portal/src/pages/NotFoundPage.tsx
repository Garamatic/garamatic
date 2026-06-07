import { useNavigate } from 'react-router-dom'
import { MagnifyingGlass, House } from '@phosphor-icons/react'
import { MUNICIPALITY } from '../config/municipality'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="container-narrow py-16 md:py-24">
      <div className="bg-surface border-2 border-border p-8 md:p-12 text-center shadow-md">
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-6 border-2 border-border">
          <MagnifyingGlass size={32} className="text-primary" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-3 font-heading uppercase tracking-wider">
          Page introuvable
        </h1>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary px-6 py-3"
          >
            <House size={18} />
            Retour à l'accueil
          </button>
        </div>

        <div className="p-4 bg-accent-subtle rounded-md border border-border max-w-md mx-auto">
          <p className="text-xs text-text-secondary">
            Pour toute question, contactez le Service Informatique au{' '}
            <a href={`tel:${MUNICIPALITY.phone}`} className="text-primary hover:underline">
              {MUNICIPALITY.phone}
            </a>
            {' '}ou par email à{' '}
            <a href={`mailto:${MUNICIPALITY.email}`} className="text-primary hover:underline">
              {MUNICIPALITY.email}
            </a>.
          </p>
        </div>
      </div>
    </div>
  )
}
