import type { JSX, SVGAttributes } from 'react'
import { cx } from '@/lib/cx'
import {
  roundedSquareRadius,
  shapePolygonPoints,
  type PaletteExportShape
} from '@/lib/exportPalette'
import styles from './ShapeGlyph.module.css'

const VIEWBOX = 24
const HALF = VIEWBOX / 2
const OVAL_HEIGHT_RATIO = 0.6

interface ShapeGlyphProps extends SVGAttributes<SVGSVGElement> {
  shape: PaletteExportShape
}

function renderShape(shape: PaletteExportShape): JSX.Element {
  const polygon = shapePolygonPoints(shape, HALF, HALF)
  if (polygon) {
    const points = polygon.map(([x, y]) => `${x + HALF},${y + HALF}`).join(' ')
    return <polygon points={points} />
  }
  switch (shape) {
    case 'square':
      return <rect x={2} y={2} width={VIEWBOX - 4} height={VIEWBOX - 4} />
    case 'roundedSquare': {
      const side = VIEWBOX - 4
      const radius = roundedSquareRadius(side, side)
      return <rect x={2} y={2} width={side} height={side} rx={radius} ry={radius} />
    }
    case 'circle':
      return <circle cx={HALF} cy={HALF} r={HALF - 2} />
    default:
      return <ellipse cx={HALF} cy={HALF} rx={HALF - 1} ry={(HALF - 1) * OVAL_HEIGHT_RATIO} />
  }
}

export function ShapeGlyph({ shape, className, ...props }: ShapeGlyphProps): JSX.Element {
  return (
    <svg
      data-stella-component="shape-glyph"
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      aria-hidden="true"
      className={cx(styles.glyph, className)}
      {...props}
    >
      {renderShape(shape)}
    </svg>
  )
}

ShapeGlyph.displayName = 'ShapeGlyph'

export type { ShapeGlyphProps }
