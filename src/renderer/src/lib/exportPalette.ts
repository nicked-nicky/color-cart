import type { PaletteColor } from '@renderer/types'

export type PaletteExportOrientation = 'vertical' | 'horizontal'
export type PaletteExportShape =
  | 'oval'
  | 'circle'
  | 'square'
  | 'roundedSquare'
  | 'hexagon'
  | 'pentagon'
  | 'octagon'
  | 'triangle'
  | 'star'

/**
 * Every visual knob for the exported palette image lives here so the
 * settings UI can read/write it without the renderer hardcoding layout.
 */
export interface PaletteExportOptions {
  /** Item shape. */
  shape: PaletteExportShape
  /** Item width before rotation, in px. */
  ovalWidth: number
  /** Item height before rotation, in px (ignored for circle, which uses the smaller of the two). */
  ovalHeight: number
  /** Rotation applied to every item, in degrees. */
  rotationDeg: number
  /** Horizontal shear applied to every item (in its own rotated frame), in degrees. */
  skewDeg: number
  /** Center-to-center distance between items along the fill direction. */
  itemGap: number
  /** Center-to-center distance between wrapped lines (columns or rows). */
  lineGap: number
  /** Items per line before wrapping — per column (vertical) or per row (horizontal). */
  groupSize: number
  /** Fill direction: stack down each column, or across each row. */
  orientation: PaletteExportOrientation
  /** Item outline color. */
  strokeColor: string
  /** Item outline width, in px. */
  strokeWidth: number
}

export const DEFAULT_PALETTE_EXPORT_OPTIONS: PaletteExportOptions = {
  shape: 'oval',
  ovalWidth: 110,
  ovalHeight: 64,
  rotationDeg: 45,
  skewDeg: 0,
  itemGap: 115,
  lineGap: 140,
  groupSize: 5,
  orientation: 'vertical',
  strokeColor: 'rgba(0, 0, 0, 0.15)',
  strokeWidth: 2
}

/** Points of a regular N-gon inscribed in a halfW x halfH box, first point straight up. */
function regularPolygonPoints(sides: number, halfW: number, halfH: number): [number, number][] {
  const points: [number, number][] = []
  const startAngle = -Math.PI / 2
  for (let i = 0; i < sides; i++) {
    const angle = startAngle + (i * 2 * Math.PI) / sides
    points.push([halfW * Math.cos(angle), halfH * Math.sin(angle)])
  }
  return points
}

/** A 5-point star, alternating outer/inner radius across 10 vertices. */
function starPoints(halfW: number, halfH: number, innerRatio = 0.45): [number, number][] {
  const points: [number, number][] = []
  const spikes = 5
  const startAngle = -Math.PI / 2
  for (let i = 0; i < spikes * 2; i++) {
    const angle = startAngle + (i * Math.PI) / spikes
    const ratio = i % 2 === 0 ? 1 : innerRatio
    points.push([halfW * ratio * Math.cos(angle), halfH * ratio * Math.sin(angle)])
  }
  return points
}

function tracePolygon(ctx: CanvasRenderingContext2D, points: [number, number][]): void {
  ctx.beginPath()
  points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
  ctx.closePath()
}

function traceShape(ctx: CanvasRenderingContext2D, shape: PaletteExportShape, width: number, height: number): void {
  const halfW = width / 2
  const halfH = height / 2

  switch (shape) {
    case 'circle': {
      const radius = Math.min(width, height) / 2
      ctx.beginPath()
      ctx.ellipse(0, 0, radius, radius, 0, 0, Math.PI * 2)
      break
    }
    case 'square':
      ctx.beginPath()
      ctx.rect(-halfW, -halfH, width, height)
      break
    case 'roundedSquare':
      ctx.beginPath()
      ctx.roundRect(-halfW, -halfH, width, height, Math.min(width, height) * 0.22)
      break
    case 'hexagon':
      tracePolygon(ctx, regularPolygonPoints(6, halfW, halfH))
      break
    case 'pentagon':
      tracePolygon(ctx, regularPolygonPoints(5, halfW, halfH))
      break
    case 'octagon':
      tracePolygon(ctx, regularPolygonPoints(8, halfW, halfH))
      break
    case 'triangle':
      tracePolygon(ctx, regularPolygonPoints(3, halfW, halfH))
      break
    case 'star':
      tracePolygon(ctx, starPoints(halfW, halfH))
      break
    case 'oval':
    default:
      ctx.beginPath()
      ctx.ellipse(0, 0, halfW, halfH, 0, 0, Math.PI * 2)
      break
  }
}

/**
 * Renders the palette onto a transparent canvas. In 'vertical' orientation
 * items fill top-to-bottom in columns of up to `groupSize` before starting
 * a new column to the right; in 'horizontal' orientation they fill
 * left-to-right in rows of up to `groupSize` before starting a new row
 * below.
 */
export function renderPaletteCanvas(
  colors: PaletteColor[],
  options: Partial<PaletteExportOptions> = {}
): HTMLCanvasElement {
  const opts: PaletteExportOptions = { ...DEFAULT_PALETTE_EXPORT_OPTIONS, ...options }
  const groupSize = Math.max(1, Math.round(opts.groupSize))
  const isVertical = opts.orientation === 'vertical'

  const lines = Math.max(1, Math.ceil(colors.length / groupSize))
  const itemsInLongestLine = Math.min(groupSize, colors.length) || 1

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(isVertical ? lines * opts.lineGap : itemsInLongestLine * opts.itemGap)
  canvas.height = Math.round(isVertical ? itemsInLongestLine * opts.itemGap : lines * opts.lineGap)

  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  colors.forEach((color, index) => {
    const line = Math.floor(index / groupSize)
    const posInLine = index % groupSize

    const centerX = isVertical
      ? line * opts.lineGap + opts.lineGap / 2
      : posInLine * opts.itemGap + opts.itemGap / 2
    const centerY = isVertical
      ? posInLine * opts.itemGap + opts.itemGap / 2
      : line * opts.lineGap + opts.lineGap / 2

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((opts.rotationDeg * Math.PI) / 180)
    if (opts.skewDeg !== 0) {
      ctx.transform(1, 0, Math.tan((opts.skewDeg * Math.PI) / 180), 1, 0, 0)
    }
    traceShape(ctx, opts.shape, opts.ovalWidth, opts.ovalHeight)
    ctx.fillStyle = color.hex
    ctx.fill()
    ctx.lineWidth = opts.strokeWidth
    ctx.strokeStyle = opts.strokeColor
    ctx.stroke()
    ctx.restore()
  })

  return canvas
}

export function canvasToPngDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png')
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}
