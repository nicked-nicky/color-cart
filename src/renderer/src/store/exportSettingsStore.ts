import { DEFAULT_PALETTE_EXPORT_OPTIONS, type PaletteExportOptions } from '@renderer/lib/exportPalette'
import { createPersistedSettingsStore } from '@renderer/lib/createPersistedSettingsStore'

export const useExportSettingsStore = createPersistedSettingsStore<PaletteExportOptions>(
  'export-settings',
  DEFAULT_PALETTE_EXPORT_OPTIONS
)
