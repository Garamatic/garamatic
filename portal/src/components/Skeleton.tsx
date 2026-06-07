/* Skeleton loading component with shimmer animation */

interface SkeletonProps {
  className?: string
  count?: number
}

export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`skeleton ${className}`}
          aria-hidden="true"
        />
      ))}
    </>
  )
}

export function TicketCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 w-20 rounded-full bg-border" />
            <div className="h-4 w-16 rounded bg-border" />
          </div>
          <div className="h-4 w-3/4 rounded bg-border mb-2" />
          <div className="h-3 w-full rounded bg-border mb-1" />
          <div className="h-3 w-2/3 rounded bg-border" />
          <div className="flex items-center gap-4 mt-3">
            <div className="h-3 w-24 rounded bg-border" />
            <div className="h-3 w-20 rounded bg-border" />
          </div>
        </div>
        <div className="h-5 w-5 rounded bg-border" />
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-16 rounded bg-border" />
        <div className="h-5 w-5 rounded bg-border" />
      </div>
      <div className="h-8 w-12 rounded bg-border" />
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-24 rounded-full bg-border" />
          <div className="h-4 w-16 rounded bg-border" />
        </div>
        <div className="h-6 w-48 rounded bg-border mb-2" />
        <div className="h-4 w-full rounded bg-border" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-4 w-32 rounded bg-border" />
        <div className="h-4 w-28 rounded bg-border" />
        <div className="h-4 w-36 rounded bg-border" />
        <div className="h-4 w-32 rounded bg-border" />
      </div>
      <div className="border-t border-border pt-6">
        <div className="space-y-4">
          <div className="h-4 w-32 rounded bg-border" />
          <div className="h-3 w-full rounded bg-border" />
          <div className="h-3 w-3/4 rounded bg-border" />
        </div>
      </div>
    </div>
  )
}
