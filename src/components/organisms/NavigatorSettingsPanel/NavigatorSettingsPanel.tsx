import type { JSX } from 'react'
import { useNavigatorSettingsStore } from '@/store/navigatorSettingsStore'
import { SettingsGroup } from '@/components/molecules/SettingsGroup'
import { SliderSetting } from '@/components/molecules/SliderSetting'
import { SettingsPage } from '@/components/organisms/SettingsPage'

export function NavigatorSettingsPanel(): JSX.Element {
  const values = useNavigatorSettingsStore((state) => state.values)
  const update = useNavigatorSettingsStore((state) => state.update)
  const reset = useNavigatorSettingsStore((state) => state.reset)

  return (
    <SettingsPage
      title="Navigator"
      description="The minimap that appears in the corner of the reference image once you're zoomed in far."
      onReset={reset}
    >
      <SettingsGroup>
        <SliderSetting
          label="Appears above zoom (%)"
          value={values.appearThresholdPercent}
          min={100}
          max={1000}
          step={50}
          onValueChange={(appearThresholdPercent) => update({ appearThresholdPercent })}
        />
        <SliderSetting
          label="Size (px)"
          value={values.size}
          min={60}
          max={300}
          step={10}
          onValueChange={(size) => update({ size })}
        />
      </SettingsGroup>
    </SettingsPage>
  )
}

NavigatorSettingsPanel.displayName = 'NavigatorSettingsPanel'
