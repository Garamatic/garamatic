import { CheckCircle, Clock, Tray, XCircle, Dot } from '@phosphor-icons/react'

const statusConfig = {
  submitted: {
    label: 'Soumise',
    icon: Dot,
    className: 'bg-accent-subtle text-text-secondary',
  },
  received: {
    label: 'Reçue',
    icon: Tray,
    className: 'bg-primary/10 text-primary',
  },
  in_progress: {
    label: 'En cours',
    icon: Clock,
    className: 'bg-warning-bg text-warning',
  },
  resolved: {
    label: 'Résolue',
    icon: CheckCircle,
    className: 'bg-success-bg text-success',
  },
  rejected: {
    label: 'Rejetée',
    icon: XCircle,
    className: 'bg-error-bg text-error',
  },
  // Backend status mappings
  pending: {
    label: 'Reçue',
    icon: Tray,
    className: 'bg-primary/10 text-primary',
  },
  assigned: {
    label: 'En cours',
    icon: Clock,
    className: 'bg-warning-bg text-warning',
  },
  inprogress: {
    label: 'En cours',
    icon: Clock,
    className: 'bg-warning-bg text-warning',
  },
  completed: {
    label: 'Résolue',
    icon: CheckCircle,
    className: 'bg-success-bg text-success',
  },
  failed: {
    label: 'Rejetée',
    icon: XCircle,
    className: 'bg-error-bg text-error',
  },
  cancelled: {
    label: 'Rejetée',
    icon: XCircle,
    className: 'bg-error-bg text-error',
  },
} as const

export type StatusKey = keyof typeof statusConfig

interface StatusBadgeProps {
  status: StatusKey
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-0.5 text-xs gap-1'
    : 'px-3 py-1 text-sm gap-1.5'

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${config.className} ${sizeClasses}`}>
      <Icon size={size === 'sm' ? 12 : 14} weight="fill" />
      {config.label}
    </span>
  )
}
