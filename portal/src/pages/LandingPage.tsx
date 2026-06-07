import { useNavigate } from 'react-router-dom'
import { SpeakerHigh, House, Scroll } from '@phosphor-icons/react'

const services = [
  {
    icon: SpeakerHigh,
    title: 'Nuisance Sonore',
    description: 'Signalez un bruit excessif ou une nuisance de voisinage.',
  },
  {
    icon: Scroll,
    title: 'Permis & Autorisations',
    description: 'Demandez un permis de construction ou une autorisation.',
  },
  {
    icon: House,
    title: 'Demande Générale',
    description: 'Toute autre demande relative aux services municipaux.',
  },
]

const steps = [
  {
    number: '1',
    title: 'Remplissez le formulaire',
    description: 'Décrivez votre demande et fournissez vos coordonnées en quelques minutes.',
  },
  {
    number: '2',
    title: 'Suivez le traitement',
    description: 'Recevez un numéro de ticket et suivez l\'avancement de votre dossier.',
  },
  {
    number: '3',
    title: 'Obtenez une réponse',
    description: 'Le service compétent vous contactera avec une réponse officielle.',
  },
]

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div>
      {/* Services */}
      <section className="container-page py-12 md:py-16">
        <h2 className="text-xl font-heading font-semibold text-primary mb-8 text-center uppercase tracking-[0.05em] text-balance">
          Types de demandes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((service) => (
            <button
              key={service.title}
              className="card card-lift p-6 text-left group"
              onClick={() => navigate('/submit')}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-150">
                <service.icon size={20} weight="bold" />
              </div>
              <h3 className="font-heading font-semibold text-text-primary mb-2 text-balance">
                {service.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed text-pretty">
                {service.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface border-y border-border">
        <div className="container-page py-12 md:py-16">
          <h2 className="text-xl font-heading font-semibold text-primary mb-10 text-center uppercase tracking-[0.05em] text-balance">
            Comment ça marche
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-heading font-bold text-sm shrink-0">
                    {step.number}
                  </span>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block w-px h-full bg-border -mt-1" aria-hidden="true" />
                  )}
                </div>
                <div className="pb-2">
                  <h3 className="font-heading font-semibold text-text-primary mb-1 text-balance">
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed text-pretty">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
