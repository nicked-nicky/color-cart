import { create } from 'zustand'
import { DEFAULT_PALETTE_EXPORT_OPTIONS, type PaletteExportOptions } from '@renderer/lib/exportPalette'

interface ExportSettingsState {
  options: PaletteExportOptions
  update: (patch: Partial<PaletteExportOptions>) => void
  reset: () => void
}

const PERSIST_DEBOUNCE_MS = 300

function mergeWithDefaults(raw: unknown): PaletteExportOptions {
  if (!raw || typeof raw !== 'object') return DEFAULT_PALETTE_EXPORT_OPTIONS
  return { ...DEFAULT_PALETTE_EXPORT_OPTIONS, ...(raw as Partial<PaletteExportOptions>) }
}

let persistTimer: number | null = null

/** Debounced so rapid stepper clicks don't hammer the disk with one write per click. */
function persist(options: PaletteExportOptions): void {
  if (!window.api) return
  if (persistTimer !== null) window.clearTimeout(persistTimer)
  persistTimer = window.setTimeout(() => {
    void window.api?.saveExportSettings(options)
  }, PERSIST_DEBOUNCE_MS)
}

export const useExportSettingsStore = create<ExportSettingsState>((set) => {
  // Fire-and-forget hydration from disk — the store still initializes
  // synchronously with defaults so the settings UI never has to handle a
  // "loading" state; it just gets patched a moment later if a saved file
  // exists.
  void window.api
    ?.loadExportSettings()
    .then((raw) => {
      if (raw) set({ options: mergeWithDefaults(raw) })
    })
    .catch(() => undefined)

  return {
    options: DEFAULT_PALETTE_EXPORT_OPTIONS,
    update: (patch) =>
      set((state) => {
        const options = { ...state.options, ...patch }
        persist(options)
        return { options }
      }),
    reset: () => {
      persist(DEFAULT_PALETTE_EXPORT_OPTIONS)
      set({ options: DEFAULT_PALETTE_EXPORT_OPTIONS })
    }
  }
})
