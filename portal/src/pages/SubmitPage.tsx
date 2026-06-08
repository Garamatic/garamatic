import { useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PaperPlaneRight, FilePdf, X, Warning, User, FileText, Stamp, ArrowLeft, Clock, MapPin, ArrowClockwise } from '@phosphor-icons/react'
import { useToast } from '../components/useToast'
import { SERVICE_TYPES, QUARTIERS, getServiceByValue } from '../config/municipality'

interface FormData {
  customerName: string
  customerEmail: string
  customerPhone: string
  requestType: string
  quartier: string
  localisation: string
  typeProbleme: string
  surface: string
  typeTravaux: string
  description: string
  attachment: File | null
  declaration: boolean
}

interface FormErrors {
  [key: string]: string
}

// Portal API endpoint for direct ticket creation
const API_ENDPOINT = '/api/portal/submit'

const problemTypes = [
  { value: '', label: '-- Sélectionnez --' },
  { value: 'NID_POULE', label: 'Nid-de-poule' },
  { value: 'LAMPADAIRE', label: 'Éclairage public' },
  { value: 'TROTTOIR', label: 'Trottoir endommagé' },
  { value: 'SIGNALISATION', label: 'Signalisation routière' },
  { value: 'AUTRE', label: 'Autre' },
]

const travauxTypes = [
  { value: '', label: '-- Sélectionnez --' },
  { value: 'EXTENSION', label: 'Extension' },
  { value: 'NOUVELLE_CONSTRUCTION', label: 'Nouvelle construction' },
  { value: 'RENOVATION', label: 'Rénovation' },
  { value: 'TERRASSE', label: 'Terrasse / Véranda' },
  { value: 'AUTRE', label: 'Autre' },
]

function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, '')
}

export function SubmitPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedType = searchParams.get('type') || ''

  const { addToast } = useToast()
  const [formData, setFormData] = useState<FormData>(() => ({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    requestType: preselectedType,
    quartier: '',
    localisation: '',
    typeProbleme: '',
    surface: '',
    typeTravaux: '',
    description: '',
    attachment: null,
    declaration: false,
  }))
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const selectedService = getServiceByValue(formData.requestType)

  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

    // Service-specific validation
    if (formData.requestType === 'VOIRIE' && !formData.typeProbleme) {
      newErrors.typeProbleme = 'Le type de problème est requis.'
    }
    if (formData.requestType === 'PERMIS' && !formData.typeTravaux) {
      newErrors.typeTravaux = 'Le type de travaux est requis.'
    }
    if (formData.requestType === 'PERMIS' && !formData.surface.trim()) {
      newErrors.surface = 'La surface est requise.'
    }

    // Clear previous submit error on re-validation
    delete newErrors.submit

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)

    try {
      // Build tags string with all service-specific data
      const tags = [
        `Quartier:${sanitize(formData.quartier)}`,
        `Type:${sanitize(formData.requestType)}`,
        ...(formData.localisation ? [`Localisation:${sanitize(formData.localisation)}`] : []),
        ...(formData.typeProbleme ? [`Probleme:${sanitize(formData.typeProbleme)}`] : []),
        ...(formData.surface ? [`Surface:${sanitize(formData.surface)}`] : []),
        ...(formData.typeTravaux ? [`Travaux:${sanitize(formData.typeTravaux)}`] : []),
      ].join(',')

      const formPayload = new FormData()
      formPayload.append('Description', sanitize(formData.description))
      formPayload.append('CustomerEmail', sanitize(formData.customerEmail))
      formPayload.append('CustomerName', sanitize(formData.customerName))
      if (formData.customerPhone) {
        formPayload.append('CustomerPhone', sanitize(formData.customerPhone))
      }
      formPayload.append('PriorityScore', selectedService?.isUrgent ? '10' : '5')
      formPayload.append('Tags', tags)
      if (formData.attachment) {
        formPayload.append('Attachment', formData.attachment)
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formPayload,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        const ticketGuid = result.ticketGuid ?? ''
        const ticketId = ticketGuid ? ticketGuid.slice(0, 8).toUpperCase() : 'UNKNOWN'

        // Store for success page
        sessionStorage.setItem('submissionResult', JSON.stringify({
          ...result,
          ticketId,
          ticketGuid,
          serviceType: formData.requestType,
          slaDays: selectedService?.slaDays ?? 10,
        }))
        sessionStorage.setItem('portalEmail', formData.customerEmail)

        addToast('Votre demande a été enregistrée avec succès.', 'success')
        navigate(`/success/${ticketId}`)
      } else {
        throw new Error(result.message || 'Submission failed')
      }
    } catch (err) {
      console.error('Submission error:', err)
      if (err instanceof Error && err.name === 'AbortError') {
        addToast('La requête a expiré. Veuillez réessayer.', 'error')
        setErrors({ submit: 'La requête a expiré. Veuillez réessayer.' })
      } else {
        addToast('Une erreur est survenue lors de la soumission. Veuillez réessayer.', 'error')
        setErrors({ submit: 'Une erreur est survenue lors de la soumission. Veuillez réessayer.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, attachment: 'Le fichier dépasse 10 Mo.' }))
        return
      }
      updateField('attachment', file)
      if (errors.attachment) {
        setErrors((prev) => { const next = { ...prev }; delete next.attachment; return next })
      }
    }
  }

  return (
    <div className="container-narrow py-8 md:py-12">
      {/* Back link */}
      <button
        onClick={() => navigate('/demarches')}
        className="btn btn-ghost text-sm mb-6"
      >
        <ArrowLeft size={16} />
        Retour aux démarches
      </button>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2 font-heading uppercase tracking-wider">
          Nouvelle Demande
        </h1>
        <p className="text-text-secondary">
          Remplissez le formulaire ci-dessous. Les champs marqués d'un * sont obligatoires.
        </p>
        {selectedService && (
          <div className="mt-3 flex items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded font-medium">
              {selectedService.label}
            </span>
            <span className="text-text-muted flex items-center gap-1">
              <Clock size={14} />
              Délai : {selectedService.slaDays} jours ouvrables
            </span>
            <span className="text-text-muted flex items-center gap-1">
              <MapPin size={14} />
              {selectedService.department}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Citizen Info */}
        <div className="form-section">
          <h2 className="section-title">
            <User size={20} className="text-muted" weight="regular" /> Informations du Citoyen
          </h2>

          <div className="space-y-5">
            <div>
              <label className="label" htmlFor="customerName">
                Nom complet <span className="text-secondary">*</span>
              </label>
              <input
                id="customerName"
                type="text"
                value={formData.customerName}
                onChange={(e) => updateField('customerName', e.target.value)}
                className={`input ${errors.customerName ? 'input-error' : ''}`}
                placeholder="Prénom Nom"
                autoComplete="name"
                aria-invalid={!!errors.customerName}
                aria-describedby={errors.customerName ? 'customerName-error' : undefined}
              />
              {errors.customerName && (
                <p id="customerName-error" className="error-text flex items-center gap-1" aria-live="polite">
                  <Warning size={14} /> {errors.customerName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label" htmlFor="customerEmail">
                  Adresse email <span className="text-secondary">*</span>
                </label>
                <input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => updateField('customerEmail', e.target.value)}
                  className={`input ${errors.customerEmail ? 'input-error' : ''}`}
                  placeholder="citoyen@desgoffe.be"
                  autoComplete="email"
                  aria-invalid={!!errors.customerEmail}
                  aria-describedby={errors.customerEmail ? 'customerEmail-error' : undefined}
                />
                {errors.customerEmail && (
                  <p id="customerEmail-error" className="error-text flex items-center gap-1" aria-live="polite">
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
                  placeholder="+32 61 46 52 00"
                  autoComplete="tel"
                  aria-describedby="customerPhone-hint"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Request Details */}
        <div className="form-section">
          <h2 className="section-title">
            <FileText size={20} className="text-muted" weight="regular" /> Détails de la Demande
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label" htmlFor="requestType">
                  Type de demande <span className="text-secondary">*</span>
                </label>
                <select
                  id="requestType"
                  value={formData.requestType}
                  onChange={(e) => updateField('requestType', e.target.value)}
                  className={`input ${errors.requestType ? 'input-error' : ''}`}
                  aria-invalid={!!errors.requestType}
                  aria-describedby={errors.requestType ? 'requestType-error' : undefined}
                >
                  <option value="">-- Sélectionnez un type --</option>
                  {SERVICE_TYPES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                {errors.requestType && (
                  <p id="requestType-error" className="error-text flex items-center gap-1" aria-live="polite">
                    <Warning size={14} /> {errors.requestType}
                  </p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="quartier">
                  Quartier <span className="text-secondary">*</span>
                </label>
                <select
                  id="quartier"
                  value={formData.quartier}
                  onChange={(e) => updateField('quartier', e.target.value)}
                  className={`input ${errors.quartier ? 'input-error' : ''}`}
                  aria-invalid={!!errors.quartier}
                  aria-describedby={errors.quartier ? 'quartier-error' : undefined}
                >
                  {QUARTIERS.map((q) => (
                    <option key={q.value} value={q.value}>{q.label}</option>
                  ))}
                </select>
                {errors.quartier && (
                  <p id="quartier-error" className="error-text flex items-center gap-1" aria-live="polite">
                    <Warning size={14} /> {errors.quartier}
                  </p>
                )}
              </div>
            </div>

            {/* Localisation */}
            <div>
              <label className="label" htmlFor="localisation">
                Adresse ou localisation exacte
              </label>
              <input
                id="localisation"
                type="text"
                value={formData.localisation}
                onChange={(e) => updateField('localisation', e.target.value)}
                className="input"
                placeholder="Rue des Fleurs 15, 6830 Desgoffe"
                autoComplete="street-address"
                aria-describedby="localisation-hint"
              />
              <p id="localisation-hint" className="helper-text">
                Précisez l'adresse exacte concernée par la demande.
              </p>
            </div>

            {/* Service-specific fields */}
            {formData.requestType === 'VOIRIE' && (
              <div>
                <label className="label" htmlFor="typeProbleme">
                  Type de problème <span className="text-secondary">*</span>
                </label>
                <select
                  id="typeProbleme"
                  value={formData.typeProbleme}
                  onChange={(e) => updateField('typeProbleme', e.target.value)}
                  className={`input ${errors.typeProbleme ? 'input-error' : ''}`}
                  aria-invalid={!!errors.typeProbleme}
                  aria-describedby={errors.typeProbleme ? 'typeProbleme-error' : undefined}
                >
                  {problemTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {errors.typeProbleme && (
                  <p id="typeProbleme-error" className="error-text flex items-center gap-1" aria-live="polite">
                    <Warning size={14} /> {errors.typeProbleme}
                  </p>
                )}
              </div>
            )}

            {formData.requestType === 'PERMIS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label" htmlFor="typeTravaux">
                    Type de travaux <span className="text-secondary">*</span>
                  </label>
                  <select
                    id="typeTravaux"
                    value={formData.typeTravaux}
                    onChange={(e) => updateField('typeTravaux', e.target.value)}
                    className={`input ${errors.typeTravaux ? 'input-error' : ''}`}
                    aria-invalid={!!errors.typeTravaux}
                    aria-describedby={errors.typeTravaux ? 'typeTravaux-error' : undefined}
                  >
                    {travauxTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  {errors.typeTravaux && (
                    <p id="typeTravaux-error" className="error-text flex items-center gap-1" aria-live="polite">
                      <Warning size={14} /> {errors.typeTravaux}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label" htmlFor="surface">
                    Surface (m²) <span className="text-secondary">*</span>
                  </label>
                  <input
                    id="surface"
                    type="text"
                    value={formData.surface}
                    onChange={(e) => updateField('surface', e.target.value)}
                    className={`input ${errors.surface ? 'input-error' : ''}`}
                    placeholder="Ex: 25"
                    aria-invalid={!!errors.surface}
                    aria-describedby={errors.surface ? 'surface-error' : undefined}
                  />
                  {errors.surface && (
                    <p id="surface-error" className="error-text flex items-center gap-1" aria-live="polite">
                      <Warning size={14} /> {errors.surface}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="label" htmlFor="description">
                Description <span className="text-secondary">*</span>
              </label>
              <textarea
                id="description"
                rows={6}
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                className={`input resize-y ${errors.description ? 'input-error' : ''}`}
                placeholder="Veuillez décrire votre demande en détail. Soyez aussi précis que possible."
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? 'description-error' : undefined}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="helper-text">
                  {formData.description.length >= 10
                    ? `${formData.description.length} caractères`
                    : `Minimum 10 caractères (${formData.description.length} / 10)`}
                </p>
                {errors.description && (
                  <p id="description-error" className="error-text flex items-center gap-1" aria-live="polite">
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
                  dragOver ? 'border-primary bg-accent-subtle' : 'border-border hover:border-primary hover:bg-surface-hover'
                }`}
              >
                <FilePdf size={32} className="mx-auto mb-2 text-text-muted" />
                <p className="text-sm text-text-secondary mb-1">
                  Glissez-déposez un fichier PDF, ou
                </p>
                <label className="text-primary font-medium cursor-pointer hover:text-primary-hover transition-colors">
                  parcourez vos fichiers
                  <input
                    type="file"
                    accept=".pdf"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          setErrors((prev) => ({ ...prev, attachment: 'Le fichier dépasse 10 Mo.' }))
                          return
                        }
                        if (file.type === 'application/pdf') {
                          updateField('attachment', file)
                          if (errors.attachment) {
                            setErrors((prev) => { const next = { ...prev }; delete next.attachment; return next })
                          }
                        }
                      }
                    }}
                  />
                </label>
                <p className="text-xs text-text-muted mt-2">PDF uniquement, max 10 Mo</p>
              </div>

              {errors.attachment && (
                <p id="attachment-error" className="error-text flex items-center gap-1 mt-2" aria-live="polite">
                  <Warning size={14} /> {errors.attachment}
                </p>
              )}

              {formData.attachment && (
                <div className="flex items-center gap-3 mt-3 p-3 bg-surface-hover rounded-md border border-border">
                  <FilePdf size={20} className="text-primary" />
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
        <div className="form-section">
          <h2 className="section-title">
            <Stamp size={20} className="text-muted" weight="regular" /> Soumission
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 bg-accent-subtle rounded-md border border-border">
              <input
                id="declaration"
                type="checkbox"
                checked={formData.declaration}
                onChange={(e) => updateField('declaration', e.target.checked)}
                className={`mt-1 w-5 h-5 rounded border-2 cursor-pointer accent-primary ${
                  errors.declaration ? 'border-error' : 'border-border'
                }`}
                aria-invalid={!!errors.declaration}
                aria-describedby={errors.declaration ? 'declaration-error' : undefined}
              />
              <label htmlFor="declaration" className="text-sm text-text-secondary leading-relaxed cursor-pointer">
                Je certifie que les informations fournies sont exactes et conformes à la réalité.
                Je comprends que toute fausse déclaration peut entraîner le rejet de ma demande.
                J'ai lu et j'accepte la{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  politique de confidentialité
                </a>.
              </label>
            </div>
            {errors.declaration && (
              <p id="declaration-error" className="error-text flex items-center gap-1" aria-live="polite">
                <Warning size={14} /> {errors.declaration}
              </p>
            )}

            {errors.submit && (
              <p className="error-text flex items-center gap-1" aria-live="polite">
                <Warning size={14} /> {errors.submit}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    customerName: '',
                    customerEmail: '',
                    customerPhone: '',
                    requestType: preselectedType,
                    quartier: '',
                    localisation: '',
                    typeProbleme: '',
                    surface: '',
                    typeTravaux: '',
                    description: '',
                    attachment: null,
                    declaration: false,
                  })
                  setErrors({})
                }}
                className="btn btn-secondary px-6 py-3"
                disabled={submitting}
              >
                <ArrowClockwise size={16} />
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
