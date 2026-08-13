import { create } from 'zustand'

export type Theme = 'light' | 'dark'
export type AccentMode = 'system' | 'custom'

/** Matches the violet accent the app used before this became configurable. */
const DEFAULT_ACCENT_COLOR = '#a78bfa'
const SETTINGS_KEY = 'theme-settings'
const PERSIST_DEBOUNCE_MS = 300

interface ThemeSettings {
  theme: Theme
  accentMode: AccentMode
  customAccentColor: string
}

interface ThemeState extends ThemeSettings {
  systemAccentColor: string | null
  toggleTheme: () => void
  setAccentMode: (mode: AccentMode) => void
  setCustomAccentColor: (color: string) => void
  refreshSystemAccentColor: () => Promise<void>
}

const DEFAULTS: ThemeSettings = {
  theme: 'dark',
  accentMode: 'custom',
  customAccentColor: DEFAULT_ACCENT_COLOR
}

function applyThemeClass(theme: Theme): void {
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(theme)
}

function applyAccentColor(color: string): void {
  document.documentElement.style.setProperty('--ui-accent', color)
}

function mergeWithDefaults(raw: unknown): ThemeSettings {
  if (!raw || typeof raw !== 'object') return DEFAULTS
  const partial = raw as Partial<ThemeSettings>
  return {
    theme: partial.theme === 'light' ? 'light' : DEFAULTS.theme,
    accentMode: partial.accentMode === 'system' ? 'system' : 'custom',
    customAccentColor:
      typeof partial.customAccentColor === 'string' ? partial.customAccentColor : DEFAULTS.customAccentColor
  }
}

let persistTimer: number | null = null
function persist(settings: ThemeSettings): void {
  if (!window.api) return
  if (persistTimer !== null) window.clearTimeout(persistTimer)
  persistTimer = window.setTimeout(() => {
    void window.api?.saveSettings(SETTINGS_KEY, settings)
  }, PERSIST_DEBOUNCE_MS)
}

// Applied immediately, synchronously, so there's no flash before the
// store's async hydration (below) resolves.
if (typeof document !== 'undefined') {
  applyThemeClass(DEFAULTS.theme)
  applyAccentColor(DEFAULTS.customAccentColor)
}

export const useThemeStore = create<ThemeState>((set, get) => {
  void window.api
    ?.loadSettings(SETTINGS_KEY)
    .then((raw) => {
      if (!raw) return
      const settings = mergeWithDefaults(raw)
      applyThemeClass(settings.theme)
      set(settings)
      if (settings.accentMode === 'system') void get().refreshSystemAccentColor()
      else applyAccentColor(settings.customAccentColor)
    })
    .catch(() => undefined)

  return {
    ...DEFAULTS,
    systemAccentColor: null,

    toggleTheme: () => {
      const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
      applyThemeClass(next)
      set({ theme: next })
      persist({ theme: next, accentMode: get().accentMode, customAccentColor: get().customAccentColor })
    },

    setAccentMode: (mode) => {
      set({ accentMode: mode })
      if (mode === 'system') void get().refreshSystemAccentColor()
      else applyAccentColor(get().customAccentColor)
      persist({ theme: get().theme, accentMode: mode, customAccentColor: get().customAccentColor })
    },

    setCustomAccentColor: (color) => {
      set({ customAccentColor: color })
      if (get().accentMode === 'custom') applyAccentColor(color)
      persist({ theme: get().theme, accentMode: get().accentMode, customAccentColor: color })
    },

    refreshSystemAccentColor: async () => {
      const color = (await window.api?.getSystemAccentColor()) ?? null
      set({ systemAccentColor: color })
      applyAccentColor(color ?? get().customAccentColor)
    }
  }
})
