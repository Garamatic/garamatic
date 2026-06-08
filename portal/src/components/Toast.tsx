import { useState, useCallback, useEffect } from 'react'
import { X, CheckCircle, Warning, Info } from '@phosphor-icons/react'
import { ToastContext, type Toast, type ToastContextValue } from './ToastContext'

export type { Toast, ToastContextValue }
export { ToastContext }

/* ── Provider ──────────────────────────────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback(
    (message: string, type: Toast['type'], duration = 4000) => {
      const id = Math.random().toString(36).slice(2, 9)
      setToasts((prev) => [...prev, { id, message, type, duration }])
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

/* ── Container ─────────────────────────────────────────────────── */
function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[]
  removeToast: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  )
}

/* ── Toast Item ────────────────────────────────────────────────── */
function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast
  onClose: (id: string) => void
}) {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => onClose(toast.id), toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, onClose])

  const icons = {
    success: <CheckCircle size={20} weight="fill" className="text-success" />,
    error: <Warning size={20} weight="fill" className="text-error" />,
    info: <Info size={20} weight="fill" className="text-primary" />,
  }

  const bgColors = {
    success: 'bg-success-bg border-success/30',
    error: 'bg-error-bg border-error/30',
    info: 'bg-surface border-border',
  }

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-md toast-enter ${bgColors[toast.type]}`}
      role="alert"
    >
      <span className="shrink-0 mt-0.5">{icons[toast.type]}</span>
      <p className="text-sm text-text-primary flex-grow">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="shrink-0 p-1 rounded hover:bg-black/5 text-text-muted hover:text-text-primary transition-colors"
        aria-label="Fermer"
      >
        <X size={16} />
      </button>
    </div>
  )
}
