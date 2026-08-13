import { create } from 'zustand'
import {
  DEFAULT_PALETTE_EXPORT_OPTIONS,
  type PaletteExportOptions
} from '@renderer/lib/exportPalette'

interface ExportSettingsState {
  options: PaletteExportOptions
  update: (patch: Partial<PaletteExportOptions>) => void
  reset: () => void
}

export const useExportSettingsStore = create<ExportSettingsState>((set) => ({
  options: DEFAULT_PALETTE_EXPORT_OPTIONS,
  update: (patch) => set((state) => ({ options: { ...state.options, ...patch } })),
  reset: () => set({ options: DEFAULT_PALETTE_EXPORT_OPTIONS })
}))
