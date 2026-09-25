import {
  DEFAULT_PALETTE_EXPORT_OPTIONS,
  sanitizeExportOptions,
  type PaletteExportOptions
} from '@/lib/exportPalette'
import { createPersistedSettingsStore } from '@/lib/createPersistedSettingsStore'

export const useExportSettingsStore = createPersistedSettingsStore<PaletteExportOptions>(
  'export-settings',
  DEFAULT_PALETTE_EXPORT_OPTIONS,
  sanitizeExportOptions
)
