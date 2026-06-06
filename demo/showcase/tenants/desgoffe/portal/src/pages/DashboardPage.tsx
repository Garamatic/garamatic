import { useState, useMemo } from 'react'
import {
  FileText, Clock, CheckCircle, MagnifyingGlass,
  ArrowRight, CaretDown, X, DownloadSimple,
  ChatText, Calendar, MapPin, Hash, Warning, ArrowClockwise
} from '@phosphor-icons/react'
import { StatusBadge, type StatusKey } from '../components/StatusBadge'
import { StatusTimeline } from '../components/StatusTimeline'

// ── Mock data ─────────────────────────────────────────────────────────
interface MockRequest {
  id: string
  type: string
  quartier: string
  description: string
  status: StatusKey
  priority: string
  date: string
  updatedAt: string
  hasAttachment: boolean
  comment?: string
}

const mockRequests: MockRequest[] = [
  {
    id: 'TM-2025-0042',
    type: 'NUISANCE',
    quartier: 'Centre-Ville',
    description: 'Bruit excessif venant du chantier de construction rue de la Loi, tous les jours de 6h à 22h.',
    status: 'in_progress',
    priority: '10',
    date: '2025-06-04',
    updatedAt: '2025-06-05',
    hasAttachment: true,
    comment: 'Un agent a été dépêché sur place. Le permis de travail est conforme, mais les horaires sont dépassés. Contact avec le responsable du chantier en cours.',
  },
  {
    id: 'TM-2025-0038',
    type: 'PERMIS',
    quartier: 'Faubourg Nord',
    description: 'Demande de permis pour une extension de terrasse de 15m² sur l\'arrière de la maison.',
    status: 'received',
    priority: '5',
    date: '2025-06-02',
    updatedAt: '2025-06-03',
    hasAttachment: true,
  },
  {
    id: 'TM-2025-0029',
    type: 'DEMANDE',
    quartier: 'Quartier Est',
    description: 'Demande de réparation d\'un lampadaire défectueux au coin de la rue des Fleurs et de l\'avenue Verte.',
    status: 'resolved',
    priority: '5',
    date: '2025-05-28',
    updatedAt: '2025-06-01',
    hasAttachment: false,
    comment: 'Lampadaire remplacé le 1er juin. Merci pour votre signalement.',
  },
  {
    id: 'TM-2025-0015',
    type: 'PLAINTE',
    quartier: 'Zone Industrielle',
    description: 'Odeurs nauséabondes provenant de l\'usine de recyclage.',
    status: 'resolved',
    priority: '15',
    date: '2025-05-20',
    updatedAt: '2025-05-25',
    hasAttachment: true,
    comment: 'Inspection réalisée. L\'usine a été mise en demeure de respecter les normes d\'émission. Suivi programmé dans 30 jours.',
  },
  {
    id: 'TM-2025-0007',
    type: 'NUISANCE',
    quartier: 'Centre-Ville',
    description: 'Stationnement sauvage récurrent devant l\'école primaire, bloquant l\'accès des piétons.',
    status: 'rejected',
    priority: '5',
    date: '2025-05-15',
    updatedAt: '2025-05-18',
    hasAttachment: false,
    comment: 'Après vérification, cette zone dispose d\'un stationnement réglementé. Les PV sont déjà émis régulièrement.',
  },
]

const typeLabels: Record<string, string> = {
  NUISANCE: 'Nuisance',
  PERMIS: 'Permis',
  PLAINTE: 'Plainte',
  DEMANDE: 'Demande',
}

const priorityLabels: Record<string, string> = {
  '5': 'Standard',
  '10': 'Urgent',
  '15': 'Très Urgent',
}

const priorityColors: Record<string, string> = {
  '5': 'text-gray-600',
  '10': 'text-amber-600',
  '15': 'text-red-600',
}

// ── Dashboard ─────────────────────────────────────────────────────────
export function DashboardPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusKey | 'all'>('all')
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)

  const selected = mockRequests.find((r) => r.id === selectedId)

  const filtered = useMemo(() => {
    let list = [...mockRequests]
    if (statusFilter !== 'all') {
      list = list.filter((r) => r.status === statusFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          r.quartier.toLowerCase().includes(q)
      )
    }
    return list
  }, [statusFilter, searchQuery])

  const stats = useMemo(() => {
    const total = mockRequests.length
    const pending = mockRequests.filter(
      (r) => r.status === 'submitted' || r.status === 'received' || r.status === 'in_progress'
    ).length
    const resolved = mockRequests.filter((r) => r.status === 'resolved').length
    const rejected = mockRequests.filter((r) => r.status === 'rejected').length
    return { total, pending, resolved, rejected }
  }, [])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setMobileDetailOpen(true)
  }

  const timelineFor = (req: MockRequest) => {
    const steps: { status: StatusKey; label: string; description: string; date?: string; active: boolean; completed: boolean }[] = [
      { status: 'submitted', label: 'Soumise', description: 'Votre demande a été enregistrée.', date: req.date, active: false, completed: true },
      { status: 'received', label: 'Reçue', description: 'Le service a pris connaissance de votre demande.', date: req.date, active: false, completed: true },
    ]
    if (req.status === 'in_progress') {
      steps.push({ status: 'in_progress', label: 'En cours', description: 'Votre demande est en cours de traitement.', date: req.updatedAt, active: true, completed: false })
    } else if (req.status === 'resolved') {
      steps.push({ status: 'in_progress', label: 'En cours', description: 'Votre demande a été traitée.', date: req.updatedAt, active: false, completed: true })
      steps.push({ status: 'resolved', label: 'Résolue', description: 'Une réponse vous a été transmise.', date: req.updatedAt, active: true, completed: true })
    } else if (req.status === 'rejected') {
      steps.push({ status: 'rejected', label: 'Rejetée', description: 'Votre demande a été rejetée. Voir le commentaire.', date: req.updatedAt, active: true, completed: true })
    }
    return steps
  }

  return (
    <div className="container-page py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
          Mes Demandes
        </h1>
        <p className="text-text-secondary">
          Suivez l'avancement de vos demandes municipales.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total" value={stats.total} icon={FileText} color="text-text-primary" />
        <StatCard label="En cours" value={stats.pending} icon={Clock} color="text-amber-600" />
        <StatCard label="Résolues" value={stats.resolved} icon={CheckCircle} color="text-success" />
        <StatCard label="Rejetées" value={stats.rejected} icon={Warning} color="text-error" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-grow max-w-md">
          <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher une demande..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusKey | 'all')}
            className="input pr-10 appearance-none cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="in_progress">En cours</option>
            <option value="received">Reçues</option>
            <option value="resolved">Résolues</option>
            <option value="rejected">Rejetées</option>
          </select>
          <CaretDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className={`lg:col-span-2 space-y-3 ${selectedId ? 'hidden lg:block' : ''}`}>
          {filtered.length === 0 ? (
            <div className="card p-12 text-center">
              <FileText size={40} className="mx-auto mb-4 text-text-muted" />
              <p className="text-text-secondary mb-4">Aucune demande trouvée.</p>
              <button
                onClick={() => {
                  setStatusFilter('all')
                  setSearchQuery('')
                }}
                className="btn btn-ghost"
              >
                <ArrowClockwise size={16} />
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            filtered.map((req) => (
              <div
                key={req.id}
                onClick={() => handleSelect(req.id)}
                className={`card p-5 cursor-pointer transition-all hover:shadow-lg ${
                  selectedId === req.id ? 'ring-2 ring-accent ring-offset-2' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <StatusBadge status={req.status} />
                      <span className={`text-xs font-medium ${priorityColors[req.priority]}`}>
                        {priorityLabels[req.priority]}
                      </span>
                    </div>
                    <h3 className="font-medium text-text-primary mb-1 truncate">
                      {typeLabels[req.type] || req.type} — {req.quartier}
                    </h3>
                    <p className="text-sm text-text-secondary line-clamp-2">
                      {req.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Hash size={12} />
                        {req.id}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {req.date}
                      </span>
                      {req.hasAttachment && (
                        <span className="flex items-center gap-1 text-accent">
                          <DownloadSimple size={12} />
                          Pièce jointe
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-text-muted shrink-0 mt-1" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel (Desktop) */}
        <div className="hidden lg:block">
          {selected ? (
            <div className="card p-6 sticky top-24">
              <DetailContent req={selected} timeline={timelineFor(selected)} />
            </div>
          ) : (
            <div className="card p-8 text-center text-text-muted">
              <FileText size={40} className="mx-auto mb-4" />
              <p className="text-sm">Sélectionnez une demande pour voir les détails.</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Detail Modal */}
      {mobileDetailOpen && selected && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileDetailOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-text-primary">Détails</h2>
              <button
                onClick={() => setMobileDetailOpen(false)}
                className="p-2 rounded-md hover:bg-surface-hover"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <DetailContent req={selected} timeline={timelineFor(selected)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-secondary">{label}</span>
        <Icon size={20} className={color} />
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
    </div>
  )
}

function DetailContent({ req, timeline }: { req: MockRequest; timeline: Parameters<typeof StatusTimeline>[0]['steps'] }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <StatusBadge status={req.status} size="md" />
          <span className={`text-sm font-medium ${priorityColors[req.priority]}`}>
            {priorityLabels[req.priority]}
          </span>
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">
          {typeLabels[req.type] || req.type}
        </h2>
        <p className="text-sm text-text-secondary">{req.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-text-secondary">
          <Hash size={14} className="text-text-muted" />
          <span>{req.id}</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <MapPin size={14} className="text-text-muted" />
          <span>{req.quartier}</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <Calendar size={14} className="text-text-muted" />
          <span>Soumis le {req.date}</span>
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          <ArrowClockwise size={14} className="text-text-muted" />
          <span>Màj {req.updatedAt}</span>
        </div>
      </div>

      {req.hasAttachment && (
        <div className="p-3 bg-surface-hover rounded-md border border-border flex items-center gap-3">
          <DownloadSimple size={20} className="text-accent" />
          <span className="text-sm text-text-primary flex-grow">Document justificatif</span>
          <button className="text-sm text-accent hover:text-accent-hover font-medium">
            Télécharger
          </button>
        </div>
      )}

      <div className="border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Historique</h3>
        <StatusTimeline steps={timeline} />
      </div>

      {req.comment && (
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Commentaire du service</h3>
          <div className="bg-accent-subtle rounded-md p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white shrink-0">
                <ChatText size={14} />
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{req.comment}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
