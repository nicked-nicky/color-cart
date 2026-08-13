import { JSX } from 'react'
import { useToastStore } from '@renderer/store/toastStore'
import Toast from '../molecules/Toast'

function ToastStack(): JSX.Element {
  const toasts = useToastStore((state) => state.toasts)
  const dismissToast = useToastStore((state) => state.dismissToast)

  return (
    <div className="pointer-events-none fixed inset-x-0 top-14 z-[70] flex flex-col items-center gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={dismissToast} />
        </div>
      ))}
    </div>
  )
}

export default ToastStack
