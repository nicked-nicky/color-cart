import type { PaletteColor } from '@renderer/types'

export type PaletteExportOrientation = 'vertical' | 'horizontal'
export type PaletteExportShape = 'oval' | 'circle' | 'square'

/**
 * Every visual knob for the exported palette image lives here so the
 * settings UI can read/write it without the renderer hardcoding layout.
 */
export interface PaletteExportOptions {
  /** Item shape: oval, circle, or square — all drawn at the same 45deg angle. */
  shape: PaletteExportShape
  /** Item width before rotation, in px. */
  ovalWidth: number
  /** Item height before rotation, in px (ignored for circle, which uses the smaller of the two). */
  ovalHeight: number
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
  itemGap: 115,
  lineGap: 140,
  groupSize: 5,
  orientation: 'vertical',
  strokeColor: 'rgba(0, 0, 0, 0.15)',
  strokeWidth: 2
}

/**
 * Renders the palette onto a transparent canvas: colors as 45deg-rotated
 * ovals. In 'vertical' orientation they fill top-to-bottom in columns of
 * up to `groupSize` before starting a new column to the right; in
 * 'horizontal' orientation they fill left-to-right in rows of up to
 * `groupSize` before starting a new row below.
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
    ctx.rotate(Math.PI / 4)
    ctx.beginPath()
    if (opts.shape === 'circle') {
      const radius = Math.min(opts.ovalWidth, opts.ovalHeight) / 2
      ctx.ellipse(0, 0, radius, radius, 0, 0, Math.PI * 2)
    } else if (opts.shape === 'square') {
      ctx.rect(-opts.ovalWidth / 2, -opts.ovalHeight / 2, opts.ovalWidth, opts.ovalHeight)
    } else {
      ctx.ellipse(0, 0, opts.ovalWidth / 2, opts.ovalHeight / 2, 0, 0, Math.PI * 2)
    }
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
