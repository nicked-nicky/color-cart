import { createPersistedSettingsStore } from '@renderer/lib/createPersistedSettingsStore'

export interface GeneralSettings {
  /** Max CIE2000 delta-E between a newly picked color and an existing
   *  swatch before it's treated as a duplicate and skipped. Lower = pickier. */
  duplicateDeltaE: number
  /** How much the press-and-hold magnifier loupe zooms in on the image. */
  loupeMagnification: number
  /** Hold time, in ms, before the magnifier loupe appears. */
  loupeDelayMs: number
  /** Cap on the offscreen sampling canvas's longest side, in px — keeps
   *  very large source photos from being rasterized at full resolution
   *  just to read a pixel color back out. */
  maxSamplingDimension: number
}

export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  duplicateDeltaE: 1,
  loupeMagnification: 4,
  loupeDelayMs: 100,
  maxSamplingDimension: 2048
}

export const useGeneralSettingsStore = createPersistedSettingsStore<GeneralSettings>(
  'general-settings',
  DEFAULT_GENERAL_SETTINGS
)
