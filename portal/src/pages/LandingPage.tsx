import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  SpeakerHigh, House, RoadHorizon, Trash, Tree, FileText,
  ArrowRight, Clock, MapPin, Phone, Envelope, Calendar,
  MagnifyingGlass, Heart, Certificate
} from '@phosphor-icons/react'
import { MUNICIPALITY, SERVICE_TYPES, DIRECT_SERVICES, ACTUALITES } from '../config/municipality'

const serviceIcons: Record<string, React.ElementType> = {
  SpeakerHigh,
  House,
  RoadHorizon,
  Trash,
  Tree,
  FileText,
  Certificate,
  Heart,
}

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
  const [trackQuery, setTrackQuery] = useState('')

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (trackQuery.trim()) {
      navigate('/requests')
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white">
        <div className="container-page py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: Welcome & CTA */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-md bg-white/10 flex items-center justify-center border border-white/20">
                  <img
                    src="/desgoffe.png"
                    alt="Commune de Desgoffe"
                    className="h-10 w-auto"
                  />
                </div>
                <div>
                  <span className="text-sm text-white/70 uppercase tracking-wider font-heading">{MUNICIPALITY.name}</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-heading uppercase tracking-wider mb-4 text-balance leading-tight">
                Guichet Citoyen
              </h1>
              <p className="text-white/80 text-lg leading-relaxed mb-6 max-w-lg">
                Bienvenue sur le portail de demandes en ligne de {MUNICIPALITY.article} {MUNICIPALITY.name}.
                Déposez une demande, suivez votre dossier ou consultez les démarches administratives.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/submit')}
                  className="btn bg-white text-primary hover:bg-white/90 px-6 py-3"
                >
                  <FileText size={18} />
                  Nouvelle Demande
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate('/demarches')}
                  className="btn bg-white/10 text-white hover:bg-white/20 border border-white/20 px-6 py-3"
                >
                  <Calendar size={18} />
                  Consulter les démarches
                </button>
              </div>
            </div>

            {/* Right: Track + Office Hours */}
            <div className="space-y-6">
              {/* Track Ticket */}
              <div className="bg-white/10 border border-white/20 rounded-md p-5">
                <h3 className="text-sm font-heading font-semibold uppercase tracking-wider mb-3 text-white/90">
                  Suivre un dossier
                </h3>
                <form onSubmit={handleTrack} className="flex gap-2">
                  <div className="relative flex-grow">
                    <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
                    <input
                      type="text"
                      value={trackQuery}
                      onChange={(e) => setTrackQuery(e.target.value)}
                      placeholder="Numéro de ticket ou email"
                      className="w-full bg-white/10 border border-white/20 rounded-md pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn bg-white/20 text-white hover:bg-white/30 px-4 py-2.5 text-sm"
                  >
                    <ArrowRight size={16} />
                    <span className="sr-only">Rechercher</span>
                  </button>
                </form>
                <p className="text-xs text-white/70 mt-2">
                  Connectez-vous pour consulter l'historique de vos demandes.
                </p>
              </div>

              {/* Office Hours */}
              <div className="bg-white/10 border border-white/20 rounded-md p-5">
                <h3 className="text-sm font-heading font-semibold uppercase tracking-wider mb-3 text-white/90 flex items-center gap-2">
                  <Clock size={16} />
                  Horaires du Guichet
                </h3>
                <div className="space-y-1 text-sm text-white/80">
                  <div className="flex justify-between">
                    <span>Lundi</span>
                    <span>{MUNICIPALITY.hours.monday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mardi</span>
                    <span>{MUNICIPALITY.hours.tuesday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mercredi</span>
                    <span className="text-right">{MUNICIPALITY.hours.wednesday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jeudi</span>
                    <span>{MUNICIPALITY.hours.thursday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vendredi</span>
                    <span>{MUNICIPALITY.hours.friday}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Samedi – Dimanche</span>
                    <span>Fermé</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/20 text-xs text-white/70 space-y-1">
                  <p className="flex items-center gap-1">
                    <MapPin size={12} />
                    {MUNICIPALITY.address.street}, {MUNICIPALITY.address.postcode} {MUNICIPALITY.address.locality}
                  </p>
                  <p className="flex items-center gap-1">
                    <Phone size={12} />
                    <a href={`tel:${MUNICIPALITY.phone}`} className="hover:text-white underline">{MUNICIPALITY.phone}</a>
                  </p>
                  <p className="flex items-center gap-1">
                    <Envelope size={12} />
                    <a href={`mailto:${MUNICIPALITY.email}`} className="hover:text-white underline">{MUNICIPALITY.email}</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container-page py-12 md:py-16">
        <h2 className="text-xl font-heading font-semibold text-primary mb-2 text-center uppercase tracking-[0.05em] text-balance">
          Services municipaux
        </h2>
        <p className="text-sm text-text-secondary text-center mb-8 max-w-lg mx-auto">
          Sélectionnez un service pour déposer une demande. Chaque service est géré par le département compétent.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICE_TYPES.map((service) => {
            const Icon = serviceIcons[service.icon] || FileText
            return (
              <button
                key={service.value}
                className="card card-lift p-6 text-left group"
                onClick={() => navigate(`/submit?type=${service.value}`)}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-150">
                  <Icon size={20} weight="bold" />
                </div>
                <h3 className="font-heading font-semibold text-text-primary mb-2 text-balance">
                  {service.label}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed text-pretty mb-3">
                  {service.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Clock size={12} />
                  <span>Délai : {service.slaDays} jours ouvrables</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
                  <Phone size={12} />
                  <span>{service.departmentPhone}</span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Direct Services (État civil, CPAS) */}
      <section className="bg-surface border-y border-border">
        <div className="container-page py-12 md:py-16">
          <h2 className="text-xl font-heading font-semibold text-primary mb-2 text-center uppercase tracking-[0.05em] text-balance">
            Autres services
          </h2>
          <p className="text-sm text-text-secondary text-center mb-8 max-w-lg mx-auto">
            Ces services nécessitent une présence en personne ou un contact direct avec le service compétent.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {DIRECT_SERVICES.map((service) => {
              const Icon = serviceIcons[service.icon] || FileText
              return (
                <button
                  key={service.value}
                  className="card card-lift p-6 text-left group"
                  onClick={() => navigate(service.page)}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-150">
                    <Icon size={20} weight="bold" />
                  </div>
                  <h3 className="font-heading font-semibold text-text-primary mb-2 text-balance">
                    {service.label}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed text-pretty mb-3">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Phone size={12} />
                    <span>{service.departmentPhone}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Actualités */}
      <section className="bg-surface border-y border-border">
        <div className="container-page py-12 md:py-16">
          <h2 className="text-xl font-heading font-semibold text-primary mb-8 text-center uppercase tracking-[0.05em] text-balance">
            Actualités municipales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ACTUALITES.map((news) => (
              <div key={news.id} className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">
                    {news.category}
                  </span>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Calendar size={12} />
                    {news.date}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-text-primary mb-2 text-balance">
                  {news.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed text-pretty">
                  {news.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-12 md:py-16">
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
      </section>
    </div>
  )
}
