import type { PaletteColor } from '@/types'

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
  strokeColor: string
  strokeOpacity: number
  /** Item outline width, in px. */
  strokeWidth: number
  transparentBackground: boolean
  backgroundColor: string
}

export type ExportFormat = 'png' | 'jpeg' | 'webp'

const EXPORT_MIME_TYPES: Record<ExportFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp'
}

const LOSSY_EXPORT_QUALITY = 0.95

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
  strokeColor: '#000000',
  strokeOpacity: 15,
  strokeWidth: 2,
  transparentBackground: true,
  backgroundColor: '#ffffff'
}

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && HEX_COLOR_PATTERN.test(value)
}

export function hexToRgba(hex: string, opacityPercent: number): string {
  const safeHex = isHexColor(hex) ? hex : '#000000'
  const [r, g, b] = [1, 3, 5].map((offset) => parseInt(safeHex.slice(offset, offset + 2), 16))
  const alpha = Math.min(100, Math.max(0, opacityPercent)) / 100
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function exportFormatFromName(fileName: string): ExportFormat {
  const extension = fileName.split('.').pop()?.toLowerCase()
  if (extension === 'jpg' || extension === 'jpeg') return 'jpeg'
  if (extension === 'webp') return 'webp'
  return 'png'
}

export function sanitizeExportOptions(raw: Partial<PaletteExportOptions>): PaletteExportOptions {
  const merged = { ...DEFAULT_PALETTE_EXPORT_OPTIONS, ...raw }
  return {
    ...merged,
    strokeColor: isHexColor(merged.strokeColor)
      ? merged.strokeColor
      : DEFAULT_PALETTE_EXPORT_OPTIONS.strokeColor,
    backgroundColor: isHexColor(merged.backgroundColor)
      ? merged.backgroundColor
      : DEFAULT_PALETTE_EXPORT_OPTIONS.backgroundColor
  }
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

export function shapePolygonPoints(
  shape: PaletteExportShape,
  halfW: number,
  halfH: number
): [number, number][] | null {
  switch (shape) {
    case 'hexagon':
      return regularPolygonPoints(6, halfW, halfH)
    case 'pentagon':
      return regularPolygonPoints(5, halfW, halfH)
    case 'octagon':
      return regularPolygonPoints(8, halfW, halfH)
    case 'triangle':
      return regularPolygonPoints(3, halfW, halfH)
    case 'star':
      return starPoints(halfW, halfH)
    default:
      return null
  }
}

export function roundedSquareRadius(width: number, height: number): number {
  return Math.min(width, height) * 0.22
}

function traceShape(ctx: CanvasRenderingContext2D, shape: PaletteExportShape, width: number, height: number): void {
  const halfW = width / 2
  const halfH = height / 2
  const polygon = shapePolygonPoints(shape, halfW, halfH)

  ctx.beginPath()
  if (polygon) {
    polygon.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
    ctx.closePath()
    return
  }

  switch (shape) {
    case 'circle': {
      const radius = Math.min(width, height) / 2
      ctx.ellipse(0, 0, radius, radius, 0, 0, Math.PI * 2)
      break
    }
    case 'square':
      ctx.rect(-halfW, -halfH, width, height)
      break
    case 'roundedSquare':
      ctx.roundRect(-halfW, -halfH, width, height, roundedSquareRadius(width, height))
      break
    default:
      ctx.ellipse(0, 0, halfW, halfH, 0, 0, Math.PI * 2)
      break
  }
}

/**
 * Renders the palette onto a canvas (transparent unless a background is set). In 'vertical' orientation
 * items fill top-to-bottom in columns of up to `groupSize` before starting
 * a new column to the right; in 'horizontal' orientation they fill
 * left-to-right in rows of up to `groupSize` before starting a new row
 * below.
 */
export function renderPaletteCanvas(
  colors: PaletteColor[],
  options: Partial<PaletteExportOptions> = {},
  format: ExportFormat = 'png'
): HTMLCanvasElement {
  const opts = sanitizeExportOptions(options)
  const groupSize = Math.max(1, Math.round(opts.groupSize))
  const isVertical = opts.orientation === 'vertical'

  const lines = Math.max(1, Math.ceil(colors.length / groupSize))
  const itemsInLongestLine = Math.min(groupSize, colors.length) || 1

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(isVertical ? lines * opts.lineGap : itemsInLongestLine * opts.itemGap)
  canvas.height = Math.round(isVertical ? itemsInLongestLine * opts.itemGap : lines * opts.lineGap)

  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  if (!opts.transparentBackground || format === 'jpeg') {
    ctx.fillStyle = opts.backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const strokeStyle = hexToRgba(opts.strokeColor, opts.strokeOpacity)

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
    if (opts.strokeWidth > 0) {
      ctx.lineWidth = opts.strokeWidth
      ctx.strokeStyle = strokeStyle
      ctx.stroke()
    }
    ctx.restore()
  })

  return canvas
}

export function canvasToDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL(EXPORT_MIME_TYPES.png)
}

export function encodeCanvas(canvas: HTMLCanvasElement, format: ExportFormat): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob && blob.type === EXPORT_MIME_TYPES[format]) resolve(blob)
        else reject(new Error(`This system can't encode ${format.toUpperCase()} images.`))
      },
      EXPORT_MIME_TYPES[format],
      format === 'png' ? undefined : LOSSY_EXPORT_QUALITY
    )
  })
}
