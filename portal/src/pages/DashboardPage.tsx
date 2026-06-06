import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  FileText, Clock, CheckCircle, MagnifyingGlass,
  ArrowRight, CaretDown, X, DownloadSimple,
  Calendar, MapPin, Hash, Warning, ArrowClockwise,
  EnvelopeSimple
} from '@phosphor-icons/react'
import { StatusBadge, type StatusKey } from '../components/StatusBadge'
import { StatusTimeline } from '../components/StatusTimeline'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

// ── Types ─────────────────────────────────────────────────────────────
interface ApiTicket {
  id: string
  number: string
  type: string
  title: string
  description: string
  status: string
  priority: string
  date: string
  updatedAt: string
  tags?: string
  hasAttachment: boolean
}

interface TicketViewModel {
  id: string
  number: string
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

function mapApiTicket(t: ApiTicket): TicketViewModel {
  // Extract quartier from tags like "Quartier:Centre-Ville"
  const quartierMatch = t.tags?.match(/Quartier:([^,]+)/)
  const quartier = quartierMatch ? quartierMatch[1] : 'Non spécifié'

  // Map backend status to frontend StatusKey
  const statusMap: Record<string, StatusKey> = {
    pending: 'pending',
    assigned: 'assigned',
    inprogress: 'inprogress',
    completed: 'completed',
    rejected: 'rejected',
    failed: 'rejected',
    cancelled: 'rejected',
  }

  return {
    id: t.number,
    number: t.number,
    type: t.type,
    quartier,
    description: t.description,
    status: statusMap[t.status.toLowerCase()] ?? 'pending',
    priority: t.priority,
    date: t.date,
    updatedAt: t.updatedAt,
    hasAttachment: t.hasAttachment,
  }
}

// ── Dashboard ─────────────────────────────────────────────────────────
export function DashboardPage() {
  const [email, setEmail] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [tickets, setTickets] = useState<TicketViewModel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusKey | 'all'>('all')
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)

  // Load email from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('portalEmail')
    if (saved) {
      setEmail(saved)
      setSubmittedEmail(saved)
    }
  }, [])

  const fetchTickets = useCallback(async (lookupEmail: string) => {
    if (!lookupEmail.trim()) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/api/portal/tickets?email=${encodeURIComponent(lookupEmail)}`)
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`)
      }
      const data: ApiTicket[] = await response.json()
      setTickets(data.map(mapApiTicket))
      sessionStorage.setItem('portalEmail', lookupEmail)
    } catch (err) {
      setError('Impossible de charger les demandes. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (submittedEmail) {
      fetchTickets(submittedEmail)
    }
  }, [submittedEmail, fetchTickets])

  const selected = tickets.find((r) => r.id === selectedId)

  const filtered = useMemo(() => {
    let list = [...tickets]
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
  }, [statusFilter, searchQuery, tickets])

  const stats = useMemo(() => {
    const total = tickets.length
    const pending = tickets.filter(
      (r) => r.status === 'pending' || r.status === 'assigned' || r.status === 'inprogress'
    ).length
    const resolved = tickets.filter((r) => r.status === 'completed').length
    const rejected = tickets.filter((r) => r.status === 'rejected').length
    return { total, pending, resolved, rejected }
  }, [tickets])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setMobileDetailOpen(true)
  }

  const timelineFor = (req: TicketViewModel) => {
    const steps: { status: StatusKey; label: string; description: string; date?: string; active: boolean; completed: boolean }[] = [
      { status: 'submitted', label: 'Soumise', description: 'Votre demande a été enregistrée.', date: req.date, active: false, completed: true },
      { status: 'received', label: 'Reçue', description: 'Le service a pris connaissance de votre demande.', date: req.date, active: false, completed: true },
    ]
    if (req.status === 'assigned' || req.status === 'inprogress') {
      steps.push({ status: 'in_progress', label: 'En cours', description: 'Votre demande est en cours de traitement.', date: req.updatedAt, active: true, completed: false })
    } else if (req.status === 'completed') {
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

      {/* Email lookup */}
      <div className="card p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow max-w-md">
            <EnvelopeSimple size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="email"
              placeholder="Votre adresse email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSubmittedEmail(email)
                }
              }}
              className="input pl-10"
            />
          </div>
          <button
            onClick={() => setSubmittedEmail(email)}
            className="btn btn-primary px-6 py-2.5"
            disabled={loading}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <MagnifyingGlass size={18} />
            )}
            Rechercher
          </button>
        </div>
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
            <option value="pending">Reçues</option>
            <option value="completed">Résolues</option>
            <option value="rejected">Rejetées</option>
          </select>
          <CaretDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-error-bg border border-error rounded-md mb-6">
          <p className="error-text flex items-center gap-1">
            <Warning size={14} /> {error}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className={`lg:col-span-2 space-y-3 ${selectedId ? 'hidden lg:block' : ''}`}>
          {!submittedEmail && !loading && (
            <div className="card p-12 text-center">
              <EnvelopeSimple size={40} className="mx-auto mb-4 text-text-muted" />
              <p className="text-text-secondary mb-2">Entrez votre adresse email pour voir vos demandes.</p>
              <p className="text-sm text-text-muted">Les demandes soumises via le portail seront affichées ici.</p>
            </div>
          )}

          {submittedEmail && !loading && filtered.length === 0 && (
            <div className="card p-12 text-center">
              <FileText size={40} className="mx-auto mb-4 text-text-muted" />
              <p className="text-text-secondary mb-4">Aucune demande trouvée pour cet email.</p>
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
          )}

          {loading && (
            <div className="card p-12 text-center">
              <span className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto block mb-4" />
              <p className="text-text-secondary">Chargement des demandes...</p>
            </div>
          )}

          {!loading && filtered.map((req) => (
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
          ))}
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

function DetailContent({ req, timeline }: { req: TicketViewModel; timeline: Parameters<typeof StatusTimeline>[0]['steps'] }) {
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
    </div>
  )
}
