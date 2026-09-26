export function formatHex(hex: string): string {
  return hex.toUpperCase()
}

export function formatRgb([r, g, b]: readonly [number, number, number]): string {
  return `rgb(${r}, ${g}, ${b})`
}

export function formatOklch([l, c, h]: readonly [number, number, number]): string {
  return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${h.toFixed(1)})`
}
