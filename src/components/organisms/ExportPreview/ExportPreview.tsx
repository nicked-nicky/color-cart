import { useMemo, type JSX } from 'react'
import { Text, type Grade } from '@stella-componente/terra'
import type { PaletteColor } from '@/types'
import {
  canvasToDataUrl,
  renderPaletteCanvas,
  type PaletteExportOptions
} from '@/lib/exportPalette'
import styles from './ExportPreview.module.css'

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

interface ExportPreviewProps {
  colors: PaletteColor[]
  options: PaletteExportOptions
  grade?: Grade
}

export function ExportPreview({ colors, options, grade = 'elevated' }: ExportPreviewProps): JSX.Element {
  const usingSamples = colors.length === 0
  const previewColors = usingSamples ? SAMPLE_COLORS : colors
  const previewUrl = useMemo(
    () => canvasToDataUrl(renderPaletteCanvas(previewColors, options)),
    [previewColors, options]
  )

  return (
    <figure data-stella-component="export-preview" data-stella-grade={grade} className={styles.preview}>
      <div className={styles.canvas}>
        <img src={previewUrl} alt="Palette export preview" className={styles.image} />
      </div>
      {usingSamples && (
        <figcaption className={styles.caption}>
          <Text variant="caption" color="secondary">
            Showing sample colors — pick some to preview your own palette.
          </Text>
        </figcaption>
      )}
    </figure>
  )
}

ExportPreview.displayName = 'ExportPreview'

export type { ExportPreviewProps }
