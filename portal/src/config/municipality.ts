// ── Municipal Identity ─────────────────────────────────────────────
// Desgoffe — Commune wallonne du Luxembourg belge
// Fondée en 1147 par le chevalier Gérard de Goffe sur les rives de la Semois
// Devise : « Fidélité et Patience » (loyauté envers les citoyens, patience dans l'administration)

export const MUNICIPALITY = {
  name: 'Desgoffe',
  fullName: 'Desgoffe-sur-Semois',
  article: 'la Commune de',
  language: 'fr' as const,

  // Heraldic identity
  motto: 'Fidélité et Patience',
  mottoLatin: 'Fidelitas et Patientia',
  founded: 1147,
  bourgmestre: {
    name: 'M. Philippe Martin',
    title: 'Bourgmestre',
    email: 'bourgmestre@desgoffe.be',
  },

  // Contact
  phone: '+32 61 46 52 00',
  email: 'contact@desgoffe.be',
  fax: '+32 61 46 52 09',

  // Address
  address: {
    street: 'Rue de la Gare 42',
    locality: 'Desgoffe',
    postcode: '6830',
    province: 'Luxembourg',
    region: 'Wallonie',
    country: 'Belgique',
  },

  // Office hours
  hours: {
    monday: '08:30 – 12:30',
    tuesday: '08:30 – 12:30',
    wednesday: '08:30 – 12:30 / 13:30 – 16:00 (sur rendez-vous)',
    thursday: '08:30 – 12:30',
    friday: '08:30 – 12:30',
    saturday: 'Fermé',
    sunday: 'Fermé',
  },

  // Legal
  enterpriseNumber: '0421.456.789',
  rpm: 'Neufchâteau',
  dpo: {
    name: 'M. Laurent Dupont',
    email: 'dpo@desgoffe.be',
    phone: '+32 61 46 52 15',
  },

  // Coordinates
  coordinates: {
    lat: 49.8333,
    lng: 5.0667,
  },

  // Emergency
  emergency: {
    phone: '+32 61 46 52 99',
    description: 'Pour les urgences municipales en dehors des heures de guichet (voirie, éclairage, propreté).',
  },

  // Police
  police: {
    name: 'Police Locale du Val de Semois',
    phone: '101',
    address: 'Rue de la Gare 42, 6830 Desgoffe',
  },

  // CPAS
  cpas: {
    name: 'CPAS de Desgoffe',
    phone: '+32 61 46 52 30',
    email: 'cpas@desgoffe.be',
    address: 'Rue de la Gare 42, 6830 Desgoffe',
    hours: 'Lun–Ven : 08:30 – 12:30',
  },

  // État civil
  etatCivil: {
    phone: '+32 61 46 52 10',
    email: 'etatcivil@desgoffe.be',
    hours: 'Lun–Ven : 08:30 – 12:30 (sur rendez-vous l\'après-midi)',
  },
} as const

// ── Service Catalog ─────────────────────────────────────────────────
export interface ServiceType {
  value: string
  label: string
  description: string
  icon: string
  slaDays: number
  department: string
  departmentPhone: string
  requiredFields?: string[]
  isUrgent?: boolean
}

export const SERVICE_TYPES: ServiceType[] = [
  {
    value: 'VOIRIE',
    label: 'Voirie',
    description: 'Nid-de-poule, éclairage public, trottoirs, signalisation routière.',
    icon: 'RoadHorizon',
    slaDays: 5,
    department: 'Service Voirie',
    departmentPhone: '+32 61 46 52 21',
    requiredFields: ['localisation', 'typeProbleme'],
  },
  {
    value: 'NUISANCE',
    label: 'Nuisance',
    description: 'Nuisances sonores, odeurs, travaux en dehors des horaires autorisés.',
    icon: 'SpeakerHigh',
    slaDays: 2,
    department: 'Service Environnement',
    departmentPhone: '+32 61 46 52 22',
    isUrgent: true,
  },
  {
    value: 'PERMIS',
    label: 'Urbanisme',
    description: 'Permis d\'urbanisme, certificat d\'urbanisme, déclaration de travaux.',
    icon: 'Blueprint',
    slaDays: 30,
    department: 'Service Urbanisme',
    departmentPhone: '+32 61 46 52 23',
    requiredFields: ['surface', 'typeTravaux'],
  },
  {
    value: 'PROPRETE',
    label: 'Propreté',
    description: 'Collecte des déchets, encombrants, dépôts sauvages, salubrité.',
    icon: 'Trash',
    slaDays: 10,
    department: 'Service Propreté',
    departmentPhone: '+32 61 46 52 24',
  },
  {
    value: 'ENVIRONNEMENT',
    label: 'Environnement',
    description: 'Espaces verts, arbres, cours d\'eau, protection de la nature.',
    icon: 'Tree',
    slaDays: 10,
    department: 'Service Environnement',
    departmentPhone: '+32 61 46 52 22',
  },
  {
    value: 'DEMANDE',
    label: 'Demande générale',
    description: 'Toute autre demande relative aux services municipaux.',
    icon: 'FileText',
    slaDays: 10,
    department: 'Services Généraux',
    departmentPhone: '+32 61 46 52 00',
  },
]

export const typeLabels: Record<string, string> = Object.fromEntries(
  SERVICE_TYPES.map((s) => [s.value, s.label])
)

export function getServiceByValue(value: string): ServiceType | undefined {
  return SERVICE_TYPES.find((s) => s.value === value)
}

// ── Direct Services (not ticket-based) ─────────────────────────────
export interface DirectService {
  value: string
  label: string
  description: string
  icon: string
  page: string
  department: string
  departmentPhone: string
}

export const DIRECT_SERVICES: DirectService[] = [
  {
    value: 'ETAT_CIVIL',
    label: 'État civil',
    description: 'Actes de naissance, mariage, décès, nationalité, changement de nom.',
    icon: 'Certificate',
    page: '/etat-civil',
    department: 'Service État Civil',
    departmentPhone: '+32 61 46 52 10',
  },
  {
    value: 'CPAS',
    label: 'CPAS',
    description: 'Aide sociale, revenu d\'intégration, médiation de dettes, aide aux personnes âgées.',
    icon: 'Heart',
    page: '/cpas',
    department: 'CPAS',
    departmentPhone: '+32 61 46 52 30',
  },
]

// ── Quartiers ───────────────────────────────────────────────────────
export const QUARTIERS = [
  { value: '', label: '-- Sélectionnez un quartier --' },
  { value: 'Centre', label: 'Centre' },
  { value: 'Belle-Vue', label: 'Belle-Vue' },
  { value: 'La Forêt', label: 'La Forêt' },
  { value: 'Les Rochettes', label: 'Les Rochettes' },
  { value: 'Pont-Moulin', label: 'Pont-Moulin' },
  { value: 'Vieille Gare', label: 'Vieille Gare' },
  { value: 'Zone Industrielle', label: 'Zone Industrielle' },
]

// ── Actualités ──────────────────────────────────────────────────────
export interface Actualite {
  id: string
  date: string
  category: string
  title: string
  summary: string
}

export const ACTUALITES: Actualite[] = [
  {
    id: 'act-001',
    date: '2025-06-05',
    category: 'Voirie',
    title: 'Travaux de voirie rue des Rochettes',
    summary: 'Des travaux de réfection de la chaussée sont prévus du 10 au 20 juin 2025. Circulation alternée à prévoir.',
  },
  {
    id: 'act-002',
    date: '2025-06-02',
    category: 'Propreté',
    title: 'Nouveau calendrier de collecte des encombrants',
    summary: 'Le calendrier de collecte des encombrants pour la période juillet-décembre 2025 est disponible.',
  },
  {
    id: 'act-003',
    date: '2025-05-28',
    category: 'Urbanisme',
    title: 'Réunion du Conseil Communal',
    summary: 'La prochaine réunion du Conseil Communal se tiendra le 20 juin 2025 à 19h30 à la Maison Communale.',
  },
]

// ── Démarches ─────────────────────────────────────────────────────
export interface Demarche {
  id: string
  title: string
  category: string
  description: string
  requiredDocuments: string[]
  slaDays: number
  cost?: string
  link?: string
}

export const DEMARCHES: Demarche[] = [
  {
    id: 'dem-001',
    title: 'Signaler un problème de voirie',
    category: 'Voirie',
    description: 'Signalez un nid-de-poule, un lampadaire défectueux, un trottoir endommagé ou un problème de signalisation.',
    requiredDocuments: ['Photo du problème (facultatif)'],
    slaDays: 5,
  },
  {
    id: 'dem-002',
    title: 'Demande de permis d\'urbanisme',
    category: 'Urbanisme',
    description: 'Déposez une demande de permis d\'urbanisme pour une construction, une extension ou une modification.',
    requiredDocuments: [
      'Plan de situation',
      'Plans d\'exécution',
      'Attestation d\'assurance décennale',
      'Déclaration sur l\'honneur',
    ],
    slaDays: 30,
    cost: 'Gratuit',
  },
  {
    id: 'dem-003',
    title: 'Signaler une nuisance',
    category: 'Environnement',
    description: 'Signalez une nuisance sonore, des odeurs désagréables ou des travaux en dehors des horaires autorisés.',
    requiredDocuments: ['Photo ou enregistrement (facultatif)'],
    slaDays: 2,
  },
  {
    id: 'dem-004',
    title: 'Demande de collecte d\'encombrants',
    category: 'Propreté',
    description: 'Demandez la collecte d\'objets encombrants (mobilier, gros électroménager, etc.).',
    requiredDocuments: ['Liste des objets à collecter'],
    slaDays: 10,
    cost: 'Gratuit',
  },
  {
    id: 'dem-005',
    title: 'Demande de taille d\'arbre',
    category: 'Environnement',
    description: 'Demandez la taille, l\'abattage ou la plantation d\'un arbre sur le domaine public.',
    requiredDocuments: [
      'Photo de l\'arbre',
      'Autorisation du propriétaire (si arbre sur propriété privée)',
    ],
    slaDays: 10,
  },
]

// ── SLA Utilities ─────────────────────────────────────────────────
export function addBusinessDays(start: Date, days: number): Date {
  const result = new Date(start)
  let added = 0
  while (added < days) {
    result.setDate(result.getDate() + 1)
    const day = result.getDay()
    if (day !== 0 && day !== 6) {
      added++
    }
  }
  return result
}

export function getBusinessDaysBetween(start: Date, end: Date): number {
  let count = 0
  const startTime = start.getTime()
  const endTime = end.getTime()
  const current = new Date(Math.min(startTime, endTime))
  const deadline = new Date(Math.max(startTime, endTime))

  while (current < deadline) {
    current.setDate(current.getDate() + 1)
    const day = current.getDay()
    if (day !== 0 && day !== 6) {
      count++
    }
  }

  return startTime <= endTime ? count : -count
}

export function getBusinessDaysRemaining(start: Date, deadline: Date): number {
  return getBusinessDaysBetween(start, deadline)
}
