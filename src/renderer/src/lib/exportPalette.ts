import type { PaletteColor } from '@renderer/types'

/**
 * Every visual knob for the exported palette image lives here so a future
 * settings UI can pass overrides instead of the layout being hardcoded.
 */
export interface PaletteExportOptions {
  /** Horizontal radius of each (pre-rotation) oval, in px. */
  ovalRadiusX: number
  /** Vertical radius of each (pre-rotation) oval, in px. */
  ovalRadiusY: number
  /** Distance between column centers, in px. */
  columnSpacing: number
  /** Distance between row centers within a column, in px. */
  rowSpacing: number
  /** How many ovals stack in a column before wrapping to a new one. */
  rowsPerColumn: number
  /** Oval outline color. */
  strokeColor: string
  /** Oval outline width, in px. */
  strokeWidth: number
}

export const DEFAULT_PALETTE_EXPORT_OPTIONS: PaletteExportOptions = {
  ovalRadiusX: 55,
  ovalRadiusY: 32,
  columnSpacing: 140,
  rowSpacing: 115,
  rowsPerColumn: 5,
  strokeColor: 'rgba(0, 0, 0, 0.15)',
  strokeWidth: 2
}

/**
 * Renders the palette onto a transparent canvas: colors as 45deg-rotated
 * ovals, filled top-to-bottom in columns of up to `rowsPerColumn` before
 * starting a new column to the right.
 */
export function renderPaletteCanvas(
  colors: PaletteColor[],
  options: Partial<PaletteExportOptions> = {}
): HTMLCanvasElement {
  const opts: PaletteExportOptions = { ...DEFAULT_PALETTE_EXPORT_OPTIONS, ...options }

  const columns = Math.max(1, Math.ceil(colors.length / opts.rowsPerColumn))
  const rows = Math.min(opts.rowsPerColumn, colors.length) || 1

  const canvas = document.createElement('canvas')
  canvas.width = columns * opts.columnSpacing
  canvas.height = rows * opts.rowSpacing

  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  colors.forEach((color, index) => {
    const column = Math.floor(index / opts.rowsPerColumn)
    const row = index % opts.rowsPerColumn
    const centerX = column * opts.columnSpacing + opts.columnSpacing / 2
    const centerY = row * opts.rowSpacing + opts.rowSpacing / 2

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(Math.PI / 4)
    ctx.beginPath()
    ctx.ellipse(0, 0, opts.ovalRadiusX, opts.ovalRadiusY, 0, 0, Math.PI * 2)
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
