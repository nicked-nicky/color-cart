import type { PaletteColor } from '@renderer/types'

const CELL_SIZE = 140
const OVAL_RX = 55
const OVAL_RY = 32
const ROWS_PER_COLUMN = 5

/**
 * Renders the palette onto a transparent canvas: colors as 45deg-rotated
 * ovals, filled top-to-bottom in columns of up to five before starting a
 * new column to the right.
 */
export function renderPaletteCanvas(colors: PaletteColor[]): HTMLCanvasElement {
  const columns = Math.max(1, Math.ceil(colors.length / ROWS_PER_COLUMN))
  const rows = Math.min(ROWS_PER_COLUMN, colors.length) || 1

  const canvas = document.createElement('canvas')
  canvas.width = columns * CELL_SIZE
  canvas.height = rows * CELL_SIZE

  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  colors.forEach((color, index) => {
    const column = Math.floor(index / ROWS_PER_COLUMN)
    const row = index % ROWS_PER_COLUMN
    const centerX = column * CELL_SIZE + CELL_SIZE / 2
    const centerY = row * CELL_SIZE + CELL_SIZE / 2

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(Math.PI / 4)
    ctx.beginPath()
    ctx.ellipse(0, 0, OVAL_RX, OVAL_RY, 0, 0, Math.PI * 2)
    ctx.fillStyle = color.hex
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
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
