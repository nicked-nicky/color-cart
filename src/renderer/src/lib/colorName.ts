/**
 * Approximate, dependency-free color naming from an OKLCH triple.
 * Not a lookup against a named-color list — just hue/lightness/chroma
 * buckets that produce a reasonable human-readable label.
 */
export function nameColor(oklch: readonly [number, number, number]): string {
  const [l, c, h] = oklch

  if (c < 0.02) {
    if (l > 0.95) return 'White'
    if (l > 0.8) return 'Light Gray'
    if (l > 0.4) return 'Gray'
    if (l > 0.15) return 'Dark Gray'
    return 'Black'
  }

  const hue = ((h % 360) + 360) % 360
  let base: string
  if (hue < 15 || hue >= 345) base = 'Red'
  else if (hue < 45) base = 'Orange'
  else if (hue < 70) base = 'Yellow'
  else if (hue < 160) base = 'Green'
  else if (hue < 200) base = 'Teal'
  else if (hue < 250) base = 'Blue'
  else if (hue < 290) base = 'Violet'
  else if (hue < 330) base = 'Magenta'
  else base = 'Pink'

  if (c < 0.06) return `Muted ${base}`
  if (l > 0.85) return `Light ${base}`
  if (l < 0.3) return `Dark ${base}`
  return base
}
