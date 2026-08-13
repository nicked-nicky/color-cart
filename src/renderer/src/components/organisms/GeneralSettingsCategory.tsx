import { JSX } from 'react'
import { RotateCcw } from 'lucide-react'
import { useGeneralSettingsStore } from '@renderer/store/generalSettingsStore'
import NumberField from '../atoms/NumberField'
import Button from '../atoms/Button'

function GeneralSettingsCategory(): JSX.Element {
  const values = useGeneralSettingsStore((state) => state.values)
  const update = useGeneralSettingsStore((state) => state.update)
  const reset = useGeneralSettingsStore((state) => state.reset)

  return (
    <div className="flex-1 overflow-y-auto pr-1">
      <h3 className="mb-1 text-sm font-medium text-ink">General</h3>
      <p className="mb-4 text-xs text-ink-faint">Picking behavior and performance tuning.</p>

      <div className="divide-y divide-border/60">
        <NumberField
          label="Duplicate sensitivity (ΔE)"
          value={values.duplicateDeltaE}
          onChange={(duplicateDeltaE) => update({ duplicateDeltaE })}
          min={0}
          max={20}
          step={0.5}
        />
        <NumberField
          label="Loupe magnification"
          value={values.loupeMagnification}
          onChange={(loupeMagnification) => update({ loupeMagnification })}
          min={2}
          max={10}
          suffix="x"
        />
        <NumberField
          label="Loupe hold delay"
          value={values.loupeDelayMs}
          onChange={(loupeDelayMs) => update({ loupeDelayMs })}
          min={0}
          max={1000}
          step={50}
          suffix="ms"
        />
        <NumberField
          label="Max sampling resolution"
          value={values.maxSamplingDimension}
          onChange={(maxSamplingDimension) => update({ maxSamplingDimension })}
          min={512}
          max={4096}
          step={256}
          suffix="px"
        />
      </div>

      <div className="mb-1 mt-4 text-xs font-medium text-ink-faint">Scroll behavior</div>
      <p className="mb-2 text-[11px] text-ink-faint">
        Wheel-zoom speeds up on a fast flick, on top of this base rate.
      </p>
      <div className="divide-y divide-border/60">
        <NumberField
          label="Base zoom rate"
          value={values.zoomBaseRate}
          onChange={(zoomBaseRate) => update({ zoomBaseRate })}
          min={0.02}
          max={0.5}
          step={0.01}
        />
        <NumberField
          label="Scroll speed sensitivity"
          value={values.zoomSensitivity}
          onChange={(zoomSensitivity) => update({ zoomSensitivity })}
          min={0}
          max={5}
          step={0.25}
        />
      </div>

      <Button variant="outline" onClick={reset} icon={<RotateCcw size={13} />} className="mt-4">
        Reset to defaults
      </Button>
    </div>
  )
}

export default GeneralSettingsCategory
