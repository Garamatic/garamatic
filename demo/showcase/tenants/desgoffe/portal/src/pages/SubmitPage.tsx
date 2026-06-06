import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PaperPlaneRight, FilePdf, X, Warning } from '@phosphor-icons/react'

interface FormData {
  customerName: string
  customerEmail: string
  customerPhone: string
  requestType: string
  quartier: string
  priority: string
  description: string
  attachment: File | null
  declaration: boolean
}

interface FormErrors {
  [key: string]: string
}

const API_BASE = import.meta.env.VITE_API_BASE ?? ''
const API_ENDPOINT = `${API_BASE}/api/portal/submit`

const requestTypes = [
  { value: '', label: '-- Sélectionnez un type --' },
  { value: 'NUISANCE', label: 'Nuisance Sonore' },
  { value: 'PERMIS', label: 'Demande de Permis' },
  { value: 'PLAINTE', label: 'Plainte' },
  { value: 'DEMANDE', label: 'Demande Générale' },
]

const quartiers = [
  { value: '', label: '-- Sélectionnez un quartier --' },
  { value: 'Centre-Ville', label: 'Centre-Ville' },
  { value: 'Faubourg Nord', label: 'Faubourg Nord' },
  { value: 'Quartier Est', label: 'Quartier Est' },
  { value: 'Zone Industrielle', label: 'Zone Industrielle' },
]

const priorities = [
  { value: '5', label: 'Standard' },
  { value: '10', label: 'Urgent' },
  { value: '15', label: 'Très Urgent' },
]

function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, '')
}

export function SubmitPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    requestType: '',
    quartier: '',
    priority: '5',
    description: '',
    attachment: null,
    declaration: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }, [errors])

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Le nom est requis.'
    }
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'L\'email est requis.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Veuillez entrer une adresse email valide.'
    }
    if (!formData.requestType) {
      newErrors.requestType = 'Le type de demande est requis.'
    }
    if (!formData.quartier) {
      newErrors.quartier = 'Le quartier est requis.'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise.'
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'La description doit contenir au moins 10 caractères.'
    }
    if (!formData.declaration) {
      newErrors.declaration = 'Vous devez certifier l\'exactitude des informations.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)

    try {
      const fd = new FormData()
      fd.append('CustomerName', sanitize(formData.customerName))
      fd.append('CustomerEmail', sanitize(formData.customerEmail))
      if (formData.customerPhone) fd.append('CustomerPhone', sanitize(formData.customerPhone))
      fd.append('Description', sanitize(formData.description))
      fd.append('WorkItemType', sanitize(formData.requestType))
      fd.append('PriorityScore', formData.priority)
      fd.append('Tenant', 'desgoffe')
      fd.append('Tags', `Quartier:${sanitize(formData.quartier)}`)
      if (formData.attachment) fd.append('Attachment', formData.attachment)

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: fd,
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        sessionStorage.setItem('submissionResult', JSON.stringify(result))
        navigate(`/success/${result.ticketId || ''}`)
      } else {
        throw new Error(result.message || 'Submission failed')
      }
    } catch (err) {
      console.error('Submission error:', err)
      setErrors({ submit: 'Une erreur est survenue lors de la soumission. Veuillez réessayer.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      updateField('attachment', file)
    }
  }

  return (
    <div className="container-narrow py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
          Nouvelle Demande
        </h1>
        <p className="text-text-secondary">
          Remplissez le formulaire ci-dessous. Les champs marqués d'un * sont obligatoires.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        {/* Citizen Info */}
        <div className="card p-6 md:p-8">
          <h2 className="text-lg font-semibold text-text-primary mb-6 pb-3 border-b border-border">
            Informations du Citoyen
          </h2>

          <div className="space-y-5">
            <div>
              <label className="label" htmlFor="customerName">
                Nom complet <span className="text-error">*</span>
              </label>
              <input
                id="customerName"
                type="text"
                value={formData.customerName}
                onChange={(e) => updateField('customerName', e.target.value)}
                className={`input ${errors.customerName ? 'input-error' : ''}`}
                placeholder="Prénom Nom"
                autoComplete="name"
              />
              {errors.customerName && (
                <p className="error-text flex items-center gap-1">
                  <Warning size={14} /> {errors.customerName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label" htmlFor="customerEmail">
                  Adresse email <span className="text-error">*</span>
                </label>
                <input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => updateField('customerEmail', e.target.value)}
                  className={`input ${errors.customerEmail ? 'input-error' : ''}`}
                  placeholder="citoyen@example.be"
                  autoComplete="email"
                />
                {errors.customerEmail && (
                  <p className="error-text flex items-center gap-1">
                    <Warning size={14} /> {errors.customerEmail}
                  </p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="customerPhone">
                  Téléphone
                </label>
                <input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => updateField('customerPhone', e.target.value)}
                  className="input"
                  placeholder="+32 2 555 00 00"
                  autoComplete="tel"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Request Details */}
        <div className="card p-6 md:p-8">
          <h2 className="text-lg font-semibold text-text-primary mb-6 pb-3 border-b border-border">
            Détails de la Demande
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label" htmlFor="requestType">
                  Type de demande <span className="text-error">*</span>
                </label>
                <select
                  id="requestType"
                  value={formData.requestType}
                  onChange={(e) => updateField('requestType', e.target.value)}
                  className={`input ${errors.requestType ? 'input-error' : ''}`}
                >
                  {requestTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {errors.requestType && (
                  <p className="error-text flex items-center gap-1">
                    <Warning size={14} /> {errors.requestType}
                  </p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="quartier">
                  Quartier <span className="text-error">*</span>
                </label>
                <select
                  id="quartier"
                  value={formData.quartier}
                  onChange={(e) => updateField('quartier', e.target.value)}
                  className={`input ${errors.quartier ? 'input-error' : ''}`}
                >
                  {quartiers.map((q) => (
                    <option key={q.value} value={q.value}>{q.label}</option>
                  ))}
                </select>
                {errors.quartier && (
                  <p className="error-text flex items-center gap-1">
                    <Warning size={14} /> {errors.quartier}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="priority">
                Priorité
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => updateField('priority', e.target.value)}
                className="input"
              >
                {priorities.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="description">
                Description <span className="text-error">*</span>
              </label>
              <textarea
                id="description"
                rows={6}
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                className={`input resize-y ${errors.description ? 'input-error' : ''}`}
                placeholder="Veuillez décrire votre demande en détail. Soyez aussi précis que possible."
              />
              <div className="flex justify-between items-center mt-1">
                <p className="helper-text">
                  {formData.description.length >= 10
                    ? `${formData.description.length} caractères`
                    : `Minimum 10 caractères (${formData.description.length} / 10)`}
                </p>
                {errors.description && (
                  <p className="error-text flex items-center gap-1">
                    <Warning size={14} /> {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="label" htmlFor="attachment">
                Document justificatif (PDF)
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
                  dragOver ? 'border-accent bg-accent-subtle' : 'border-border hover:border-accent hover:bg-surface-hover'
                }`}
              >
                <FilePdf size={32} className="mx-auto mb-2 text-text-muted" />
                <p className="text-sm text-text-secondary mb-1">
                  Glissez-déposez un fichier PDF, ou
                </p>
                <label className="text-accent font-medium cursor-pointer hover:text-accent-hover transition-colors">
                  parcourez vos fichiers
                  <input
                    type="file"
                    accept=".pdf"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file && file.type === 'application/pdf') {
                        updateField('attachment', file)
                      }
                    }}
                  />
                </label>
                <p className="text-xs text-text-muted mt-2">PDF uniquement, max 10 Mo</p>
              </div>

              {formData.attachment && (
                <div className="flex items-center gap-3 mt-3 p-3 bg-surface-hover rounded-md border border-border">
                  <FilePdf size={20} className="text-accent" />
                  <span className="text-sm text-text-primary flex-grow truncate">{formData.attachment.name}</span>
                  <span className="text-xs text-text-muted">
                    {(formData.attachment.size / 1024 / 1024).toFixed(1)} Mo
                  </span>
                  <button
                    type="button"
                    onClick={() => updateField('attachment', null)}
                    className="p-1 rounded hover:bg-error-bg text-text-muted hover:text-error transition-colors"
                    aria-label="Supprimer le fichier"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Declaration & Submit */}
        <div className="card p-6 md:p-8">
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <input
                id="declaration"
                type="checkbox"
                checked={formData.declaration}
                onChange={(e) => updateField('declaration', e.target.checked)}
                className={`mt-1 w-5 h-5 rounded border-2 cursor-pointer accent-accent ${
                  errors.declaration ? 'border-error' : 'border-border'
                }`}
              />
              <label htmlFor="declaration" className="text-sm text-text-secondary leading-relaxed cursor-pointer">
                Je certifie que les informations fournies sont exactes et conformes à la réalité.
                Je comprends que toute fausse déclaration peut entraîner le rejet de ma demande.
              </label>
            </div>
            {errors.declaration && (
              <p className="error-text flex items-center gap-1">
                <Warning size={14} /> {errors.declaration}
              </p>
            )}

            {errors.submit && (
              <div className="p-4 bg-error-bg border border-error rounded-md">
                <p className="error-text flex items-center gap-1">
                  <Warning size={14} /> {errors.submit}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    customerName: '',
                    customerEmail: '',
                    customerPhone: '',
                    requestType: '',
                    quartier: '',
                    priority: '5',
                    description: '',
                    attachment: null,
                    declaration: false,
                  })
                  setErrors({})
                }}
                className="btn btn-secondary px-6 py-3"
                disabled={submitting}
              >
                Réinitialiser
              </button>
              <button
                type="submit"
                className="btn btn-primary px-6 py-3"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <PaperPlaneRight size={18} weight="bold" />
                    Soumettre la demande
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
