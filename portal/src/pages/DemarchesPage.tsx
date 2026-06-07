import { useNavigate } from 'react-router-dom'
import { FilePlus, ArrowRight, Clock, CheckCircle } from '@phosphor-icons/react'
import { DEMARCHES, MUNICIPALITY } from '../config/municipality'

export function DemarchesPage() {
  const navigate = useNavigate()

  return (
    <div className="container-page py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 pb-4 border-b border-border">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2 font-heading uppercase tracking-wider">
          Démarches
        </h1>
        <p className="text-text-secondary italic">
          Guide des procédures administratives de {MUNICIPALITY.article} {MUNICIPALITY.name}
        </p>
      </div>

      {/* Intro */}
      <div className="bg-accent-subtle border border-border rounded-md p-6 mb-8">
        <p className="text-sm text-text-secondary leading-relaxed">
          Retrouvez ci-dessous les principales démarches administratives proposées par la commune.
          Chaque démarche indique les documents requis, le délai de traitement et le service compétent.
          Pour toute question, contactez le guichet au <a href={`tel:${MUNICIPALITY.phone}`} className="text-primary hover:underline font-medium">{MUNICIPALITY.phone}</a>.
        </p>
      </div>

      {/* Demarches List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DEMARCHES.map((demarche) => (
          <div key={demarche.id} className="card card-lift p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                {demarche.category}
              </span>
              <span className="text-xs text-text-muted">•</span>
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Clock size={12} />
                {demarche.slaDays} jours ouvrables
              </span>
            </div>

            <h3 className="font-heading font-semibold text-text-primary mb-2 text-lg">
              {demarche.title}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-4 flex-grow">
              {demarche.description}
            </p>

            {/* Required Documents */}
            <div className="mb-4">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                Documents requis
              </p>
              <ul className="space-y-1">
                {demarche.requiredDocuments.map((doc, i) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                    <CheckCircle size={14} className="text-success shrink-0 mt-0.5" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cost & Action */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              {demarche.cost && (
                <span className="text-sm font-medium text-success">
                  {demarche.cost}
                </span>
              )}
              <button
                onClick={() => navigate('/submit')}
                className="btn btn-primary text-sm ml-auto"
              >
                <FilePlus size={16} />
                Déposer une demande
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
