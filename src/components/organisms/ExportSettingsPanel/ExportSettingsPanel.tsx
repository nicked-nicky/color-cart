import type { JSX } from 'react'
import { ArrowDownFromLine, ArrowRightFromLine } from 'lucide-react'
import { Icon, Switch } from '@stella-componente/terra'
import type { PaletteExportOrientation } from '@/lib/exportPalette'
import { usePaletteStore } from '@/store/paletteStore'
import { useExportSettingsStore } from '@/store/exportSettingsStore'
import { ChoiceIsland, type ChoiceOption } from '@/components/molecules/ChoiceIsland'
import { ColorField } from '@/components/molecules/ColorField'
import { SettingRow } from '@/components/molecules/SettingRow'
import { SettingsGroup } from '@/components/molecules/SettingsGroup'
import { ShapePicker } from '@/components/molecules/ShapePicker'
import { SliderSetting } from '@/components/molecules/SliderSetting'
import { ExportPreview } from '@/components/organisms/ExportPreview'
import { SettingsPage } from '@/components/organisms/SettingsPage'

const ORIENTATION_OPTIONS: ChoiceOption<PaletteExportOrientation>[] = [
  {
    value: 'vertical',
    label: 'Columns',
    icon: (
      <Icon size="sm">
        <ArrowDownFromLine />
      </Icon>
    )
  },
  {
    value: 'horizontal',
    label: 'Rows',
    icon: (
      <Icon size="sm">
        <ArrowRightFromLine />
      </Icon>
    )
  }
]

export function ExportSettingsPanel(): JSX.Element {
  const colors = usePaletteStore((state) => state.colors)
  const options = useExportSettingsStore((state) => state.values)
  const update = useExportSettingsStore((state) => state.update)
  const reset = useExportSettingsStore((state) => state.reset)
  const lineNoun = options.orientation === 'vertical' ? 'column' : 'row'

  return (
    <SettingsPage
      title="Export image"
      description="How the palette is laid out when it's exported or copied as an image."
      onReset={reset}
    >
      <ExportPreview colors={colors} options={options} />

      <SettingsGroup title="Layout">
        <SettingRow label="Fill direction" description={`Items fill each ${lineNoun} before wrapping.`}>
          {(labelId) => (
            <ChoiceIsland
              aria-labelledby={labelId}
              options={ORIENTATION_OPTIONS}
              value={options.orientation}
              onValueChange={(orientation) => update({ orientation })}
              parentGrade="default"
            />
          )}
        </SettingRow>
        <SettingRow label="Shape">
          {(labelId) => (
            <ShapePicker
              aria-labelledby={labelId}
              value={options.shape}
              onValueChange={(shape) => update({ shape })}
              parentGrade="default"
            />
          )}
        </SettingRow>
        <SliderSetting
          label={`Items per ${lineNoun}`}
          value={options.groupSize}
          min={1}
          max={50}
          onValueChange={(groupSize) => update({ groupSize })}
        />
      </SettingsGroup>

      <SettingsGroup title="Size" description="Circles use the smaller of width and height.">
        <SliderSetting
          label="Width (px)"
          value={options.ovalWidth}
          min={10}
          max={400}
          onValueChange={(ovalWidth) => update({ ovalWidth })}
        />
        <SliderSetting
          label="Height (px)"
          value={options.ovalHeight}
          min={10}
          max={400}
          onValueChange={(ovalHeight) => update({ ovalHeight })}
        />
        <SliderSetting
          label="Rotation (°)"
          value={options.rotationDeg}
          min={-180}
          max={180}
          step={5}
          onValueChange={(rotationDeg) => update({ rotationDeg })}
        />
        <SliderSetting
          label="Skew (°)"
          value={options.skewDeg}
          min={-60}
          max={60}
          step={5}
          onValueChange={(skewDeg) => update({ skewDeg })}
        />
      </SettingsGroup>

      <SettingsGroup title="Spacing" description="Measured center to center.">
        <SliderSetting
          label="Item gap (px)"
          value={options.itemGap}
          min={10}
          max={600}
          onValueChange={(itemGap) => update({ itemGap })}
        />
        <SliderSetting
          label={`Gap between ${lineNoun}s (px)`}
          value={options.lineGap}
          min={10}
          max={600}
          onValueChange={(lineGap) => update({ lineGap })}
        />
      </SettingsGroup>

      <SettingsGroup title="Outline">
        <SettingRow label="Color">
          {(labelId) => (
            <ColorField
              aria-labelledby={labelId}
              value={options.strokeColor}
              onValueChange={(strokeColor) => update({ strokeColor })}
            />
          )}
        </SettingRow>
        <SliderSetting
          label="Opacity (%)"
          value={options.strokeOpacity}
          min={0}
          max={100}
          step={5}
          onValueChange={(strokeOpacity) => update({ strokeOpacity })}
        />
        <SliderSetting
          label="Width (px)"
          value={options.strokeWidth}
          min={0}
          max={20}
          onValueChange={(strokeWidth) => update({ strokeWidth })}
        />
      </SettingsGroup>

      <SettingsGroup title="Background">
        <SettingRow
          label="Transparent"
          description="JPEG exports always use the background color."
        >
          {(labelId) => (
            <Switch
              aria-labelledby={labelId}
              checked={options.transparentBackground}
              onCheckedChange={(transparentBackground) => update({ transparentBackground })}
            />
          )}
        </SettingRow>
        <SettingRow label="Color">
          {(labelId) => (
            <ColorField
              aria-labelledby={labelId}
              value={options.backgroundColor}
              onValueChange={(backgroundColor) => update({ backgroundColor })}
            />
          )}
        </SettingRow>
      </SettingsGroup>
    </SettingsPage>
  )
}

ExportSettingsPanel.displayName = 'ExportSettingsPanel'
