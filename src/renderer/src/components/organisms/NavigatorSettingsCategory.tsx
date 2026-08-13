import { JSX } from 'react'
import { RotateCcw } from 'lucide-react'
import { useNavigatorSettingsStore } from '@renderer/store/navigatorSettingsStore'
import NumberField from '../atoms/NumberField'
import Button from '../atoms/Button'

function NavigatorSettingsCategory(): JSX.Element {
  const values = useNavigatorSettingsStore((state) => state.values)
  const update = useNavigatorSettingsStore((state) => state.update)
  const reset = useNavigatorSettingsStore((state) => state.reset)

  return (
    <div className="flex-1 overflow-y-auto pr-1">
      <h3 className="mb-1 text-sm font-medium text-ink">Navigator</h3>
      <p className="mb-4 text-xs text-ink-faint">
        The minimap that appears in the corner of the reference image once you're zoomed in far.
      </p>

      <div className="divide-y divide-border/60">
        <NumberField
          label="Appearance threshold"
          value={values.appearThresholdPercent}
          onChange={(appearThresholdPercent) => update({ appearThresholdPercent })}
          min={100}
          max={1000}
          step={50}
          suffix="%"
        />
        <NumberField
          label="Size"
          value={values.size}
          onChange={(size) => update({ size })}
          min={60}
          max={300}
          step={10}
          suffix="px"
        />
      </div>

      <Button variant="outline" onClick={reset} icon={<RotateCcw size={13} />} className="mt-4">
        Reset to defaults
      </Button>
    </div>
  )
}

export default NavigatorSettingsCategory
