import { createPersistedSettingsStore } from '@/lib/createPersistedSettingsStore'

export interface NavigatorSettings {
  /** Zoom percent past which the minimap navigator appears. */
  appearThresholdPercent: number
  /** Longest side of the minimap, in px. */
  size: number
}

export const DEFAULT_NAVIGATOR_SETTINGS: NavigatorSettings = {
  appearThresholdPercent: 500,
  size: 130
}

export const useNavigatorSettingsStore = createPersistedSettingsStore<NavigatorSettings>(
  'navigator-settings',
  DEFAULT_NAVIGATOR_SETTINGS
)
