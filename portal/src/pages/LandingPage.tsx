import { useNavigate } from 'react-router-dom'
import { FilePlus, List, ArrowRight, SpeakerHigh, House, Scroll } from '@phosphor-icons/react'

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
    number: '01',
    title: 'Remplissez le formulaire',
    description: 'Décrivez votre demande et fournissez vos coordonnées en quelques minutes.',
  },
  {
    number: '02',
    title: 'Suivez le traitement',
    description: 'Recevez un numéro de ticket et suivez l\'avancement de votre dossier.',
  },
  {
    number: '03',
    title: 'Obtenez une réponse',
    description: 'Le service compétent vous contactera avec une réponse officielle.',
  },
]

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div>
      {/* Hero — Desgoffe municipal character */}
      <section className="bg-primary text-white">
        <div className="container-page py-12 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            {/* City Logo */}
            <div className="inline-block p-4 rounded-full bg-white/10 mb-6 border-2 border-white/30">
              <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center overflow-hidden">
                <img
                  src="/desgoffe.png"
                  alt="Ville de Desgoffe"
                  className="h-16 w-auto"
                />
              </div>
            </div>

            {/* Title — municipal uppercase style */}
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3 uppercase tracking-widest">
              Guichet Citoyen
            </h1>

            {/* Subtitle — serif italic with border */}
            <p className="text-lg text-white/90 font-serif italic border-t border-b border-white/30 inline-block py-2 px-8 mb-8">
              Ville de Desgoffe — Services Municipaux
            </p>

            <p className="text-white/80 leading-relaxed mb-8 max-w-lg mx-auto">
              Soumettez vos demandes municipales en ligne. Un service rapide, transparent et accessible à tous les citoyens.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/submit')}
                className="btn bg-white text-primary hover:bg-white/90 px-6 py-3 text-base"
              >
                <FilePlus size={20} weight="bold" />
                Faire une demande
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/requests')}
                className="btn bg-white/10 text-white border border-white/30 hover:bg-white/20 px-6 py-3 text-base"
              >
                <List size={20} />
                Suivre mes demandes
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container-page py-12 md:py-16">
        <h2 className="text-xl font-heading font-semibold text-primary mb-6 text-center uppercase tracking-wider">
          Types de demandes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.title}
              className="card p-6 hover:shadow-lg transition-shadow cursor-pointer group border-l-4 border-l-primary"
              onClick={() => navigate('/submit')}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <service.icon size={20} weight="bold" />
              </div>
              <h3 className="font-heading font-semibold text-text-primary mb-2">{service.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface border-y border-border">
        <div className="container-page py-12 md:py-16">
          <h2 className="text-xl font-heading font-semibold text-primary mb-8 text-center uppercase tracking-wider">
            Comment ça marche
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4">
                <span className="text-2xl font-heading font-bold text-primary shrink-0 leading-none">
                  {step.number}
                </span>
                <div>
                  <h3 className="font-heading font-semibold text-text-primary mb-1">{step.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
