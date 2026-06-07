import { CheckCircle, Circle, Clock } from '@phosphor-icons/react'
import type { StatusKey } from './StatusBadge'

interface TimelineStep {
  status: StatusKey
  label: string
  description: string
  date?: string
  active: boolean
  completed: boolean
}

interface StatusTimelineProps {
  steps: TimelineStep[]
}

export function StatusTimeline({ steps }: StatusTimelineProps) {
  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        return (
          <div key={step.status} className="flex gap-4">
            {/* Line + Icon */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                step.completed
                  ? 'bg-success text-white'
                  : step.active
                  ? 'bg-accent text-white'
                  : 'bg-surface-hover text-muted'
              }`}>
                {step.completed ? (
                  <CheckCircle size={16} weight="fill" />
                ) : step.active ? (
                  <Clock size={16} weight="fill" />
                ) : (
                  <Circle size={16} />
                )}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-grow min-h-[2rem] ${
                  step.completed ? 'bg-success' : 'bg-border'
                }`} />
              )}
            </div>

            {/* Content */}
            <div className={`pb-6 ${isLast ? '' : ''}`}>
              <p className={`text-sm font-medium ${
                step.active || step.completed ? 'text-text-primary' : 'text-text-muted'
              }`}>
                {step.label}
              </p>
              <p className={`text-sm mt-0.5 ${
                step.active || step.completed ? 'text-text-secondary' : 'text-text-muted'
              }`}>
                {step.description}
              </p>
              {step.date && (
                <p className="text-xs text-text-muted mt-1">
                  {step.date}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
