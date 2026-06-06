import { Clock, Warning, CheckCircle } from '@phosphor-icons/react'

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
  const deadline = new Date(created)
  deadline.setDate(deadline.getDate() + slaDays)

  const now = new Date()
  const diffMs = deadline.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  let color: string
  let bgColor: string
  let icon: React.ReactNode
  let label: string

  if (diffDays < 0) {
    color = 'text-error'
    bgColor = 'bg-error-bg'
    icon = <Warning size={16} weight="fill" />
    label = `En retard (${Math.abs(diffDays)}j)`
  } else if (diffDays <= 2) {
    color = 'text-amber-600'
    bgColor = 'bg-warning-bg'
    icon = <Clock size={16} />
    label = `${diffDays}j restant${diffDays > 1 ? 's' : ''}`
  } else {
    color = 'text-success'
    bgColor = 'bg-success-bg'
    icon = <Clock size={16} />
    label = `${diffDays}j restant${diffDays > 1 ? 's' : ''}`
  }

  return (
    <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-md ${bgColor}`}>
      <span className={color}>{icon}</span>
      <span className={`font-medium ${color}`}>{label}</span>
    </div>
  )
}

export function SLAInfo({ createdAt, slaDays = 7 }: { createdAt: string; slaDays?: number }) {
  const created = new Date(createdAt)
  const deadline = new Date(created)
  deadline.setDate(deadline.getDate() + slaDays)

  const now = new Date()
  const diffMs = deadline.getTime() - now.getTime()
  const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))

  return (
    <div className="text-xs text-text-muted">
      Délai de réponse : {deadline.toLocaleDateString('fr-BE')} ({diffDays}j)
    </div>
  )
}
