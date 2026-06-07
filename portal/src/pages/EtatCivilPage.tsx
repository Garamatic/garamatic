import { useNavigate } from 'react-router-dom'
import { Certificate, Phone, Envelope, Clock, MapPin, ArrowRight, Calendar, Users, Baby, HeartBreak, Globe, CheckCircle } from '@phosphor-icons/react'
import { MUNICIPALITY } from '../config/municipality'

const actes = [
  {
    icon: Baby,
    title: 'Acte de naissance',
    description: 'Demande d\'acte de naissance, copie intégrale ou extrait.',
    delai: 'Immédiat (sur place)',
  },
  {
    icon: Users,
    title: 'Acte de mariage',
    description: 'Acte de mariage, transcription de mariage à l\'étranger.',
    delai: 'Immédiat (sur place)',
  },
  {
    icon: HeartBreak,
    title: 'Acte de décès',
    description: 'Acte de décès, copie intégrale ou extrait.',
    delai: 'Immédiat (sur place)',
  },
  {
    icon: Globe,
    title: 'Nationalité',
    description: 'Déclaration de nationalité, certificat de nationalité belge.',
    delai: '5 jours ouvrables',
  },
  {
    icon: Calendar,
    title: 'Domiciliation',
    description: 'Changement d\'adresse, déclaration de changement de domicile.',
    delai: 'Immédiat (sur place)',
  },
  {
    icon: Certificate,
    title: 'Changement de nom',
    description: 'Demande de changement de nom, ajout d\'un prénom.',
    delai: '30 jours (décision du Ministre)',
  },
]

export function EtatCivilPage() {
  const navigate = useNavigate()

  return (
    <div className="container-page py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 pb-4 border-b border-border">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2 font-heading uppercase tracking-wider">
          État Civil
        </h1>
        <p className="text-text-secondary italic">
          Actes de naissance, mariage, décès, nationalité et domiciliation — {MUNICIPALITY.article} {MUNICIPALITY.name}
        </p>
      </div>

      {/* Contact Info */}
      <div className="bg-accent-subtle border border-border rounded-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <Phone size={18} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-primary">Téléphone</p>
              <a href={`tel:${MUNICIPALITY.etatCivil.phone}`} className="text-sm text-text-secondary hover:text-primary">
                {MUNICIPALITY.etatCivil.phone}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Envelope size={18} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-primary">Email</p>
              <a href={`mailto:${MUNICIPALITY.etatCivil.email}`} className="text-sm text-text-secondary hover:text-primary">
                {MUNICIPALITY.etatCivil.email}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock size={18} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-primary">Horaires</p>
              <p className="text-sm text-text-secondary">{MUNICIPALITY.etatCivil.hours}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="bg-warning-bg border border-warning rounded-md p-4 mb-8">
        <div className="flex items-start gap-3">
          <CheckCircle size={18} className="text-warning shrink-0 mt-0.5" />
          <div className="text-sm text-text-secondary">
            <p className="font-medium text-text-primary mb-1">Présence obligatoire</p>
            <p>
              Les services d\'état civil nécessitent une présence en personne à la Maison Communale,
              munie d\'une pièce d\'identité valide. Les demandes en ligne ne sont pas possibles pour ces démarches.
            </p>
          </div>
        </div>
      </div>

      {/* Actes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {actes.map((acte) => {
          const Icon = acte.icon
          return (
            <div key={acte.title} className="card p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Icon size={20} weight="bold" />
              </div>
              <h3 className="font-heading font-semibold text-text-primary mb-2">
                {acte.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-3">
                {acte.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Clock size={12} />
                <span>Délai : {acte.delai}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Address */}
      <div className="card p-6">
        <h3 className="font-heading font-semibold text-primary mb-4 uppercase tracking-wider text-sm">
          Adresse du Service État Civil
        </h3>
        <div className="flex items-start gap-3">
          <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-text-secondary">
            <p className="text-text-primary font-medium">Maison Communale</p>
            <p>{MUNICIPALITY.address.street}</p>
            <p>{MUNICIPALITY.address.postcode} {MUNICIPALITY.address.locality}</p>
            <p className="mt-2">
              Guichet ouvert : <span className="text-text-primary">{MUNICIPALITY.hours.monday}</span>
            </p>
            <p>Service État Civil : sur rendez-vous l'après-midi</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/demarches')}
          className="btn btn-ghost text-sm"
        >
          <ArrowRight size={16} />
          Voir toutes les démarches
        </button>
      </div>
    </div>
  )
}
