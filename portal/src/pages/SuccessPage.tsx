import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Copy, ArrowLeft, List, ArrowClockwise, Clock, Phone, Printer, Envelope } from '@phosphor-icons/react'
import { MUNICIPALITY, typeLabels, getServiceByValue } from '../config/municipality'

interface SubmissionResult {
  success: boolean
  ticketId?: string
  queue?: string
  message?: string
  serviceType?: string
  slaDays?: number
}

export function SuccessPage() {
  const { ticketId: urlTicketId } = useParams()
  const navigate = useNavigate()
  const result: SubmissionResult = (() => {
    const raw = sessionStorage.getItem('submissionResult')
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SubmissionResult
        sessionStorage.removeItem('submissionResult')
        return parsed
      } catch {
        return {
          success: true,
          ticketId: urlTicketId,
          queue: 'Services Municipaux',
        }
      }
    }
    return {
      success: true,
      ticketId: urlTicketId,
      queue: 'Services Municipaux',
    }
  })()
  const [copied, setCopied] = useState(false)

  const displayTicketId = result?.ticketId || '---'
  const serviceType = result?.serviceType || 'DEMANDE'
  const service = getServiceByValue(serviceType)
  const slaDays = service?.slaDays ?? 10
  const typeLabel = typeLabels[serviceType] || 'Demande'

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(displayTicketId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = displayTicketId
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="container-narrow py-12 md:py-20">
      <div className="bg-surface border-2 border-border p-8 md:p-12 text-center shadow-md">
        <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-6 border-2 border-success">
          <CheckCircle size={32} className="text-success" weight="fill" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-3 font-heading uppercase tracking-wider">
          Demande enregistrée
        </h1>
        <p className="text-text-secondary mb-8 max-w-md mx-auto italic">
          Votre dossier a été transmis aux services municipaux. Vous recevrez une confirmation par email.
        </p>

        {/* Ticket ID */}
        <div className="bg-canvas border-2 border-border p-4 mb-6 max-w-sm mx-auto">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2 font-heading">Numéro de ticket</p>
          <div className="flex items-center justify-center gap-3">
            <code className="text-xl font-mono font-bold text-primary">{displayTicketId}</code>
            <button
              onClick={copyToClipboard}
              className="p-2 rounded-md hover:bg-surface border border-border hover:border-primary text-text-muted hover:text-primary transition-colors"
              aria-label="Copier le numéro de ticket"
            >
              {copied ? <CheckCircle size={18} className="text-success" /> : <Copy size={18} />}
            </button>
          </div>
          {copied && (
            <p className="text-xs text-success mt-2">Copié dans le presse-papiers !</p>
          )}
        </div>

        {/* Service info */}
        <div className="text-sm text-text-secondary mb-6 max-w-md mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-text-muted">Type :</span>
            <span className="font-medium text-primary">{typeLabel}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-text-muted">Service :</span>
            <span className="font-medium text-primary">{service?.department || 'Services Municipaux'}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Clock size={14} className="text-text-muted" />
            <span className="text-text-muted">Délai de traitement estimé :</span>
            <span className="font-medium text-primary">{slaDays} jours ouvrables</span>
          </div>
        </div>

        {/* Next steps */}
        <div className="bg-accent-subtle border border-border rounded-md p-4 mb-8 max-w-md mx-auto text-left">
          <h3 className="text-sm font-heading font-semibold text-text-primary mb-2 uppercase tracking-wider">
            Prochaines étapes
          </h3>
          <ol className="text-sm text-text-secondary space-y-2 list-decimal list-inside">
            <li>Un email de confirmation a été envoyé à votre adresse.</li>
            <li>Le service compétent examinera votre demande dans les plus brefs délais.</li>
            <li>Vous pouvez suivre l'avancement via le numéro de ticket ci-dessus.</li>
          </ol>
        </div>

        {/* Contact */}
        <div className="text-sm text-text-secondary mb-8 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2">
            <Phone size={14} className="text-text-muted" />
            <span>En cas d'urgence, contactez le guichet au{' '}
              <a href={`tel:${MUNICIPALITY.phone}`} className="text-primary hover:underline font-medium">{MUNICIPALITY.phone}</a>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <button
            onClick={() => navigate('/requests')}
            className="btn btn-primary px-6 py-3"
          >
            <List size={18} />
            Voir mes demandes
          </button>
          <button
            onClick={() => navigate('/submit')}
            className="btn btn-secondary px-6 py-3"
          >
            <ArrowClockwise size={18} />
            Nouvelle demande
          </button>
        </div>

        {/* Print / Email */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <button
            onClick={() => window.print()}
            className="btn btn-ghost px-4 py-2 text-sm"
          >
            <Printer size={16} />
            Imprimer
          </button>
          <button
            onClick={async () => {
              const subject = `Confirmation de demande - ${displayTicketId}`
              const body = `Bonjour,%0D%0A%0D%0AVeuillez trouver ci-joint la confirmation de ma demande déposée sur le Guichet Citoyen de ${MUNICIPALITY.name}.%0D%0A%0D%0ANuméro de ticket : ${displayTicketId}%0D%0AType : ${typeLabel}%0D%0ADélai : ${slaDays} jours ouvrables%0D%0A%0D%0ACordialement,`
              window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`
            }}
            className="btn btn-ghost px-4 py-2 text-sm"
          >
            <Envelope size={16} />
            Envoyer par email
          </button>
        </div>

        <button
          onClick={() => navigate('/')}
          className="btn btn-ghost mt-2 text-sm"
        >
          <ArrowLeft size={16} />
          Retour à l'accueil
        </button>
      </div>
    </div>
  )
}
