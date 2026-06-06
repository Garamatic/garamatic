import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Copy, ArrowLeft, List, ArrowClockwise } from '@phosphor-icons/react'

interface SubmissionResult {
  success: boolean
  ticketId?: string
  queue?: string
  message?: string
}

export function SuccessPage() {
  const { ticketId: urlTicketId } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState<SubmissionResult | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('submissionResult')
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SubmissionResult
        setResult(parsed)
        sessionStorage.removeItem('submissionResult')
      } catch {
        // Fallback
        setResult({
          success: true,
          ticketId: urlTicketId,
          queue: 'Services Municipaux',
        })
      }
    } else {
      // If no session data, use URL param or fallback
      setResult({
        success: true,
        ticketId: urlTicketId,
        queue: 'Services Municipaux',
      })
    }
  }, [urlTicketId])

  const displayTicketId = result?.ticketId || '---'
  const displayQueue = result?.queue || 'Services Municipaux'

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(displayTicketId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
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

        {/* Queue info */}
        <div className="text-sm text-text-secondary mb-8">
          <p>File d'attente : <span className="font-medium text-primary">{displayQueue}</span></p>
          <p className="mt-1">Délai de traitement estimé : <span className="font-medium text-primary">5 jours ouvrables</span></p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
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

        <button
          onClick={() => navigate('/')}
          className="btn btn-ghost mt-4 text-sm"
        >
          <ArrowLeft size={16} />
          Retour à l'accueil
        </button>
      </div>
    </div>
  )
}
