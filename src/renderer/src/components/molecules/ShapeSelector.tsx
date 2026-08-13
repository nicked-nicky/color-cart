import { JSX } from 'react'
import type { PaletteExportShape } from '@renderer/lib/exportPalette'

interface ShapeOption {
  value: PaletteExportShape
  label: string
  className: string
}

const SHAPE_OPTIONS: ShapeOption[] = [
  { value: 'oval', label: 'Oval', className: 'h-3 w-5 rounded-full' },
  { value: 'circle', label: 'Circle', className: 'h-4 w-4 rounded-full' },
  { value: 'square', label: 'Square', className: 'h-4 w-4' },
  { value: 'roundedSquare', label: 'Rounded square', className: 'h-4 w-4 rounded-md' },
  {
    value: 'triangle',
    label: 'Triangle',
    className: 'h-4 w-4 [clip-path:polygon(50%_0%,0%_100%,100%_100%)]'
  },
  {
    value: 'pentagon',
    label: 'Pentagon',
    className: 'h-4 w-4 [clip-path:polygon(50%_0%,100%_38%,82%_100%,18%_100%,0%_38%)]'
  },
  {
    value: 'hexagon',
    label: 'Hexagon',
    className: 'h-4 w-4 [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]'
  },
  {
    value: 'octagon',
    label: 'Octagon',
    className: 'h-4 w-4 [clip-path:polygon(30%_0%,70%_0%,100%_30%,100%_70%,70%_100%,30%_100%,0%_70%,0%_30%)]'
  },
  {
    value: 'star',
    label: 'Star',
    className:
      'h-4 w-4 [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]'
  }
]

interface ShapeSelectorProps {
  value: PaletteExportShape
  onChange: (shape: PaletteExportShape) => void
}

function ShapeSelector({ value, onChange }: ShapeSelectorProps): JSX.Element {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {SHAPE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-label={option.label}
          title={option.label}
          onClick={() => onChange(option.value)}
          className={`flex h-9 items-center justify-center rounded-lg border transition-colors ${
            value === option.value
              ? 'border-accent/60 bg-accent/15 text-accent'
              : 'border-border bg-canvas text-ink-faint hover:text-ink-muted'
          }`}
        >
          <span className={`bg-current ${option.className}`} />
        </button>
      ))}
    </div>
  )
}

export default ShapeSelector
