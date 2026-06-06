import { CheckCircle, Clock, Tray, XCircle, Dot } from '@phosphor-icons/react'

const statusConfig = {
  submitted: {
    label: 'Soumise',
    icon: Dot,
    className: 'bg-gray-100 text-gray-700',
  },
  received: {
    label: 'Reçue',
    icon: Tray,
    className: 'bg-blue-50 text-blue-700',
  },
  in_progress: {
    label: 'En cours',
    icon: Clock,
    className: 'bg-amber-50 text-amber-700',
  },
  resolved: {
    label: 'Résolue',
    icon: CheckCircle,
    className: 'bg-green-50 text-green-700',
  },
  rejected: {
    label: 'Rejetée',
    icon: XCircle,
    className: 'bg-red-50 text-red-700',
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
