import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { SignIn, ArrowRight, Info } from '@phosphor-icons/react'
import { MUNICIPALITY } from '../config/municipality'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const from = (location.state as { from?: string })?.from || '/requests'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Veuillez entrer une adresse email valide.')
      return
    }

    sessionStorage.setItem('portalEmail', email)
    navigate(from, { replace: true })
  }

  return (
    <div className="container-narrow py-16 md:py-24">
      <div className="bg-surface border-2 border-border p-8 md:p-12 shadow-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center mx-auto mb-4 border border-border shadow-sm">
            <img
              src="/desgoffe.png"
              alt="Commune de Desgoffe"
              className="h-10 w-auto rounded-full"
              loading="lazy"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-2 uppercase tracking-wider">
            Connexion
          </h1>
          <p className="text-text-secondary italic">
            Entrez votre email pour consulter vos demandes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label" htmlFor="email">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`input ${error ? 'input-error' : ''}`}
              placeholder="citoyen@desgoffe.be"
              autoComplete="email"
              autoFocus
              aria-invalid={!!error}
              aria-describedby={error ? 'email-error' : undefined}
            />
            {error && (
              <p id="email-error" className="error-text mt-2" aria-live="polite">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full py-3 text-base"
          >
            <SignIn size={18} weight="bold" />
            Connexion
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 p-4 bg-accent-subtle rounded-md border border-border">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-text-secondary space-y-1">
              <p className="font-medium text-text-primary">Identification</p>
              <p>
                Pour consulter vos demandes, saisissez l'adresse email utilisée lors de la soumission.
                L'identification via eID ou itsme sera progressivement déployée.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-xs text-text-muted">
            En cas de difficulté, contactez le Service Informatique au{' '}
            <a href={`tel:${MUNICIPALITY.phone}`} className="text-primary hover:underline">
              {MUNICIPALITY.phone}
            </a>.
          </p>
        </div>
      </div>
    </div>
  )
}
