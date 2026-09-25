export interface SourceCoordinates {
  x: number
  y: number
}

export interface PaletteColor {
  id: string
  hex: string
  rgb: [number, number, number]
  oklch: [number, number, number]
  timestamp: number
  sourceCoordinates: SourceCoordinates | null
}
