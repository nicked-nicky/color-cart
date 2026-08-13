import { JSX, useMemo } from 'react'
import { RotateCcw } from 'lucide-react'
import { usePaletteStore } from '@renderer/store/paletteStore'
import { useExportSettingsStore } from '@renderer/store/exportSettingsStore'
import {
  renderPaletteCanvas,
  canvasToPngDataUrl,
  type PaletteExportOrientation
} from '@renderer/lib/exportPalette'
import type { PaletteColor } from '@renderer/types'
import NumberField from '../atoms/NumberField'
import SegmentedControl from '../atoms/SegmentedControl'
import Button from '../atoms/Button'

const SAMPLE_HEXES = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f43f5e',
  '#a3e635',
  '#0ea5e9'
]

const SAMPLE_COLORS: PaletteColor[] = SAMPLE_HEXES.map((hex, index) => ({
  id: `sample-${index}`,
  hex,
  rgb: [0, 0, 0],
  oklch: [0, 0, 0],
  timestamp: index,
  sourceCoordinates: null
}))

const CHECKERBOARD_STYLE = {
  backgroundImage:
    'linear-gradient(45deg, #3f3f46 25%, transparent 25%), linear-gradient(-45deg, #3f3f46 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #3f3f46 75%), linear-gradient(-45deg, transparent 75%, #3f3f46 75%)',
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
  backgroundColor: '#27272a'
}

function ExportSettingsCategory(): JSX.Element {
  const realColors = usePaletteStore((state) => state.colors)
  const options = useExportSettingsStore((state) => state.options)
  const update = useExportSettingsStore((state) => state.update)
  const reset = useExportSettingsStore((state) => state.reset)

  const previewColors = realColors.length > 0 ? realColors : SAMPLE_COLORS

  const previewUrl = useMemo(() => {
    const canvas = renderPaletteCanvas(previewColors, options)
    return canvasToPngDataUrl(canvas)
    // previewColors is derived fresh each render from realColors/SAMPLE_COLORS;
    // options is a stable reference from the store until update() is called.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realColors, options])

  return (
    <div className="flex h-full gap-6">
      <div className="flex-1 overflow-y-auto pr-1">
        <h3 className="mb-1 text-sm font-medium text-neutral-100">Export Image</h3>
        <p className="mb-4 text-xs text-neutral-500">
          Controls how the palette is laid out when exported or copied as an image.
        </p>

        <SegmentedControl<PaletteExportOrientation>
          options={[
            { label: 'Vertical', value: 'vertical' },
            { label: 'Horizontal', value: 'horizontal' }
          ]}
          value={options.orientation}
          onChange={(orientation) => update({ orientation })}
        />

        <div className="mt-3 divide-y divide-neutral-700/60">
          <NumberField
            label={options.orientation === 'vertical' ? 'Items per column' : 'Items per row'}
            value={options.groupSize}
            onChange={(groupSize) => update({ groupSize })}
            min={1}
            max={50}
          />
          <NumberField
            label="Oval width"
            value={options.ovalWidth}
            onChange={(ovalWidth) => update({ ovalWidth })}
            min={10}
            max={400}
            suffix="px"
          />
          <NumberField
            label="Oval height"
            value={options.ovalHeight}
            onChange={(ovalHeight) => update({ ovalHeight })}
            min={10}
            max={400}
            suffix="px"
          />
          <NumberField
            label="Item gap"
            value={options.itemGap}
            onChange={(itemGap) => update({ itemGap })}
            min={10}
            max={600}
            suffix="px"
          />
          <NumberField
            label="Line gap"
            value={options.lineGap}
            onChange={(lineGap) => update({ lineGap })}
            min={10}
            max={600}
            suffix="px"
          />
          <NumberField
            label="Outline width"
            value={options.strokeWidth}
            onChange={(strokeWidth) => update({ strokeWidth })}
            min={0}
            max={20}
            suffix="px"
          />
        </div>

        <Button variant="outline" onClick={reset} icon={<RotateCcw size={13} />} className="mt-4">
          Reset to defaults
        </Button>
      </div>

      <div className="flex w-56 shrink-0 flex-col gap-2">
        <span className="text-xs font-medium text-neutral-500">Preview</span>
        <div
          className="flex flex-1 items-center justify-center rounded-xl border border-neutral-700 p-3"
          style={CHECKERBOARD_STYLE}
        >
          <img
            src={previewUrl}
            alt="Palette export preview"
            className="max-h-full max-w-full object-contain"
          />
        </div>
        {realColors.length === 0 && (
          <p className="text-[11px] text-neutral-600">
            Showing sample colors — pick some to preview your actual palette.
          </p>
        )}
      </div>
    </div>
  )
}

export default ExportSettingsCategory
