import type { JSX } from 'react'
import type { Grade } from '@stella-componente/terra'
import type { PaletteExportShape } from '@/lib/exportPalette'
import { ShapeGlyph } from '@/components/atoms/ShapeGlyph'
import { ChoiceIsland, type ChoiceOption } from '@/components/molecules/ChoiceIsland'

const SHAPE_LABELS: Record<PaletteExportShape, string> = {
  oval: 'Oval',
  circle: 'Circle',
  square: 'Square',
  roundedSquare: 'Rounded square',
  triangle: 'Triangle',
  pentagon: 'Pentagon',
  hexagon: 'Hexagon',
  octagon: 'Octagon',
  star: 'Star'
}

const SHAPE_OPTIONS: ChoiceOption<PaletteExportShape>[] = (
  Object.keys(SHAPE_LABELS) as PaletteExportShape[]
).map((shape) => ({ value: shape, label: SHAPE_LABELS[shape], icon: <ShapeGlyph shape={shape} /> }))

interface ShapePickerProps {
  value: PaletteExportShape
  onValueChange: (shape: PaletteExportShape) => void
  parentGrade?: Grade
  'aria-labelledby'?: string
}

export function ShapePicker({
  value,
  onValueChange,
  parentGrade,
  'aria-labelledby': labelledBy
}: ShapePickerProps): JSX.Element {
  return (
    <ChoiceIsland
      iconOnly
      options={SHAPE_OPTIONS}
      value={value}
      onValueChange={onValueChange}
      parentGrade={parentGrade}
      aria-labelledby={labelledBy}
    />
  )
}

ShapePicker.displayName = 'ShapePicker'

export type { ShapePickerProps }
