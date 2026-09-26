import type { JSX } from 'react'
import { useGeneralSettingsStore } from '@/store/generalSettingsStore'
import { SettingsGroup } from '@/components/molecules/SettingsGroup'
import { SliderSetting } from '@/components/molecules/SliderSetting'
import { SettingsPage } from '@/components/organisms/SettingsPage'

export function GeneralSettingsPanel(): JSX.Element {
  const values = useGeneralSettingsStore((state) => state.values)
  const update = useGeneralSettingsStore((state) => state.update)
  const reset = useGeneralSettingsStore((state) => state.reset)

  return (
    <SettingsPage title="General" description="Picking behavior and performance tuning." onReset={reset}>
      <SettingsGroup title="Picking">
        <SliderSetting
          label="Duplicate sensitivity (ΔE)"
          description="Colors closer than this to an existing swatch are skipped."
          value={values.duplicateDeltaE}
          min={0}
          max={20}
          step={0.5}
          onValueChange={(duplicateDeltaE) => update({ duplicateDeltaE })}
        />
        <SliderSetting
          label="Loupe magnification (×)"
          value={values.loupeMagnification}
          min={2}
          max={10}
          onValueChange={(loupeMagnification) => update({ loupeMagnification })}
        />
        <SliderSetting
          label="Loupe hold delay (ms)"
          value={values.loupeDelayMs}
          min={0}
          max={1000}
          step={50}
          onValueChange={(loupeDelayMs) => update({ loupeDelayMs })}
        />
        <SliderSetting
          label="Max sampling resolution (px)"
          description="Large images are sampled at this size to stay responsive."
          value={values.maxSamplingDimension}
          min={512}
          max={4096}
          step={256}
          onValueChange={(maxSamplingDimension) => update({ maxSamplingDimension })}
        />
      </SettingsGroup>

      <SettingsGroup
        title="Scroll zoom"
        description="Wheel zoom speeds up on a fast flick, on top of the base rate."
      >
        <SliderSetting
          label="Base zoom rate"
          value={values.zoomBaseRate}
          min={0.02}
          max={0.5}
          step={0.01}
          onValueChange={(zoomBaseRate) => update({ zoomBaseRate })}
        />
        <SliderSetting
          label="Scroll speed sensitivity"
          value={values.zoomSensitivity}
          min={0}
          max={5}
          step={0.25}
          onValueChange={(zoomSensitivity) => update({ zoomSensitivity })}
        />
      </SettingsGroup>
    </SettingsPage>
  )
}

GeneralSettingsPanel.displayName = 'GeneralSettingsPanel'
