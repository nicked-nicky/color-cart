import { create } from 'zustand'

export type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
}

function applyThemeClass(theme: Theme): void {
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(theme)
}

const initialTheme: Theme = 'dark'
if (typeof document !== 'undefined') applyThemeClass(initialTheme)

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    applyThemeClass(next)
    set({ theme: next })
  }
}))
