import { Clock, Warning, CheckCircle } from '@phosphor-icons/react'
import { addBusinessDays, getBusinessDaysBetween } from '../config/municipality'

interface SLACountdownProps {
  createdAt: string
  slaDays?: number
  status: string
}

export function SLACountdown({ createdAt, slaDays = 7, status }: SLACountdownProps) {
  if (status === 'resolved' || status === 'rejected') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <CheckCircle size={16} className="text-success" weight="fill" />
        <span className="text-success font-medium">Traitée</span>
      </div>
    )
  }

  const created = new Date(createdAt)
  const deadline = addBusinessDays(created, slaDays)

  const now = new Date()
  const businessDaysRemaining = getBusinessDaysBetween(now, deadline)

  let color: string
  let bgColor: string
  let icon: React.ReactNode
  let label: string

  if (businessDaysRemaining < 0) {
    color = 'text-error'
    bgColor = 'bg-error-bg'
    icon = <Warning size={16} weight="fill" />
    label = `En retard (${Math.abs(businessDaysRemaining)}j)`
  } else if (businessDaysRemaining <= 2) {
    color = 'text-warning'
    bgColor = 'bg-warning-bg'
    icon = <Clock size={16} />
    label = `${businessDaysRemaining}j ouvrable${businessDaysRemaining > 1 ? 's' : ''} restant${businessDaysRemaining > 1 ? 's' : ''}`
  } else {
    color = 'text-success'
    bgColor = 'bg-success-bg'
    icon = <Clock size={16} />
    label = `${businessDaysRemaining}j ouvrables restants`
  }

  return (
    <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-md ${bgColor}`}>
      <span className={color}>{icon}</span>
      <span className={`font-medium ${color}`}>{label}</span>
      <span className="text-xs text-text-muted ml-1">(jusqu'au {deadline.toLocaleDateString('fr-BE')})</span>
    </div>
  )
}

export function SLAInfo({ createdAt, slaDays = 7 }: { createdAt: string; slaDays?: number }) {
  const created = new Date(createdAt)
  const deadline = addBusinessDays(created, slaDays)
  const now = new Date()
  const diffDays = getBusinessDaysBetween(now, deadline)

  return (
    <div className="text-xs text-text-muted">
      Délai de réponse : {deadline.toLocaleDateString('fr-BE')} ({diffDays}j ouvrables)
    </div>
  )
}
