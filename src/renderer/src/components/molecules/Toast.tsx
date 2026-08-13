import { JSX, useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { AlertTriangle, Info, X } from 'lucide-react'
import type { Toast as ToastData } from '@renderer/store/toastStore'

interface ToastProps {
  toast: ToastData
  onDismiss: (id: string) => void
}

function Toast({ toast, onDismiss }: ToastProps): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!rootRef.current) return
    animate(rootRef.current, {
      translateY: [-10, 0],
      opacity: [0, 1],
      duration: 220,
      ease: 'outQuad'
    })
  }, [])

  return (
    <div
      ref={rootRef}
      className="flex items-center gap-2.5 rounded-full border border-border bg-surface py-2 pl-4 pr-2 text-xs text-ink shadow-lg shadow-black/30"
    >
      {toast.tone === 'error' ? (
        <AlertTriangle size={14} className="shrink-0 text-red-400" />
      ) : (
        <Info size={14} className="shrink-0 text-ink-faint" />
      )}
      <span>{toast.message}</span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => onDismiss(toast.id)}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-surface-hover hover:text-ink"
      >
        <X size={12} />
      </button>
    </div>
  )
}

export default Toast
