import { useNavigate } from 'react-router-dom'
import { Heart, Phone, Envelope, Clock, MapPin, ArrowRight, Users, HandHeart, House, Stethoscope, Coins, BookOpen } from '@phosphor-icons/react'
import { MUNICIPALITY } from '../config/municipality'

const services = [
  {
    icon: HandHeart,
    title: 'Revenu d\'Intégration (RIS)',
    description: 'Demande d\'aide financière pour les personnes sans ressources suffisantes.',
  },
  {
    icon: House,
    title: 'Logement social',
    description: 'Aide au logement, mise à disposition de logements sociaux, hébergement d\'urgence.',
  },
  {
    icon: Stethoscope,
    title: 'Aide médicale',
    description: 'Aide médicale urgente, remboursement de soins de santé, aide à la mobilité.',
  },
  {
    icon: Coins,
    title: 'Médiation de dettes',
    description: 'Accompagnement dans la gestion des dettes, négociation avec les créanciers.',
  },
  {
    icon: Users,
    title: 'Aide aux personnes âgées',
    description: 'Aide à domicile, accompagnement, repas à domicile, assistance aux courses.',
  },
  {
    icon: BookOpen,
    title: 'Aide scolaire',
    description: 'Aide aux fournitures scolaires, bourses d\'étude, accompagnement des jeunes.',
  },
]

export function CpasPage() {
  const navigate = useNavigate()

  return (
    <div className="container-page py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 pb-4 border-b border-border">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2 font-heading uppercase tracking-wider">
          CPAS
        </h1>
        <p className="text-text-secondary italic">
          Centre Public d'Action Sociale — {MUNICIPALITY.article} {MUNICIPALITY.name}
        </p>
      </div>

      {/* Contact Info */}
      <div className="bg-accent-subtle border border-border rounded-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <Phone size={18} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-primary">Téléphone</p>
              <a href={`tel:${MUNICIPALITY.cpas.phone}`} className="text-sm text-text-secondary hover:text-primary">
                {MUNICIPALITY.cpas.phone}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Envelope size={18} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-primary">Email</p>
              <a href={`mailto:${MUNICIPALITY.cpas.email}`} className="text-sm text-text-secondary hover:text-primary">
                {MUNICIPALITY.cpas.email}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock size={18} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-primary">Horaires</p>
              <p className="text-sm text-text-secondary">{MUNICIPALITY.cpas.hours}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="bg-primary/5 border border-primary/20 rounded-md p-4 mb-8">
        <div className="flex items-start gap-3">
          <Heart size={18} className="text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-text-secondary">
            <p className="font-medium text-text-primary mb-1">Accompagnement social</p>
            <p>
              Le CPAS est là pour vous aider. Toutes les demandes sont traitées en toute confidentialité.
              Prenez rendez-vous par téléphone ou directement au guichet du CPAS.
            </p>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {services.map((service) => {
          const Icon = service.icon
          return (
            <div key={service.title} className="card p-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Icon size={20} weight="bold" />
              </div>
              <h3 className="font-heading font-semibold text-text-primary mb-2">
                {service.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {service.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Address */}
      <div className="card p-6">
        <h3 className="font-heading font-semibold text-primary mb-4 uppercase tracking-wider text-sm">
          Adresse du CPAS
        </h3>
        <div className="flex items-start gap-3">
          <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-text-secondary">
            <p className="text-text-primary font-medium">{MUNICIPALITY.cpas.name}</p>
            <p>{MUNICIPALITY.cpas.address}</p>
            <p className="mt-2">
              Guichet ouvert : <span className="text-text-primary">{MUNICIPALITY.cpas.hours}</span>
            </p>
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
