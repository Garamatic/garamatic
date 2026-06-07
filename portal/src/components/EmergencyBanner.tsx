import { useState } from 'react'
import { X, Siren } from '@phosphor-icons/react'
import { MUNICIPALITY } from '../config/municipality'

export function EmergencyBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay() // 0 = Sunday, 6 = Saturday

  // Only show outside office hours (before 8:30, after 12:30, or weekends)
  const isWeekend = day === 0 || day === 6
  const isBeforeHours = hour < 8 || (hour === 8 && now.getMinutes() < 30)
  const isAfterHours = hour >= 12 && (hour > 12 || now.getMinutes() > 30)
  const isWednesdayAfternoon = day === 3 && hour >= 13

  const shouldShow = isWeekend || isBeforeHours || isAfterHours || isWednesdayAfternoon

  if (!shouldShow) return null

  return (
    <div className="bg-secondary border-b border-secondary/20">
      <div className="container-page py-2">
        <div className="flex items-start gap-3">
          <Siren size={18} className="text-white shrink-0 mt-0.5" weight="fill" />
          <div className="flex-grow">
            <p className="text-sm text-white font-medium">
              Urgence municipale en dehors des heures de guichet
            </p>
            <p className="text-xs text-white/80 mt-0.5">
              {MUNICIPALITY.emergency.description} —{' '}
              <a href={`tel:${MUNICIPALITY.emergency.phone}`} className="underline hover:text-white font-medium">
                {MUNICIPALITY.emergency.phone}
              </a>
            </p>
            <p className="text-xs text-white/60 mt-1">
              En cas de danger immédiat, appelez la police au <a href="tel:101" className="underline hover:text-white">101</a> ou les secours au <a href="tel:112" className="underline hover:text-white">112</a>.
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
