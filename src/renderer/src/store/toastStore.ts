import { create } from 'zustand'

export type ToastTone = 'error' | 'info'

export interface Toast {
  id: string
  message: string
  tone: ToastTone
}

interface ToastState {
  toasts: Toast[]
  pushToast: (message: string, tone?: ToastTone) => void
  dismissToast: (id: string) => void
}

const TOAST_DURATION_MS = 3200

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  pushToast: (message, tone = 'error') => {
    const id = crypto.randomUUID()
    set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }))
    window.setTimeout(() => get().dismissToast(id), TOAST_DURATION_MS)
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
}))
