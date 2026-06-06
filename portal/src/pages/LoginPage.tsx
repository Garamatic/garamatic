import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { SignIn, ArrowRight } from '@phosphor-icons/react'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  // Where to redirect after login (default: dashboard)
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

    // Store email in sessionStorage for demo
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
              alt="Ville de Desgoffe"
              className="h-10 w-auto rounded-full"
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
              placeholder="citoyen@example.be"
              autoComplete="email"
              autoFocus
            />
            {error && (
              <p className="error-text mt-2">{error}</p>
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
          <p className="text-xs text-text-secondary text-center">
            <strong>Mode démonstration</strong> — Aucun mot de passe requis.
            <br />
            Saisissez simplement l'email utilisé lors de votre demande.
          </p>
        </div>
      </div>
    </div>
  )
}
