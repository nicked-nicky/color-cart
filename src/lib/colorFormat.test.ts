import { describe, expect, it } from 'vitest'
import { formatHex, formatOklch, formatRgb } from './colorFormat'
import { nameColor } from './colorName'

describe('color formatting', () => {
  it('formats hex, rgb and oklch strings', () => {
    expect(formatHex('#a1b2c3')).toBe('#A1B2C3')
    expect(formatRgb([12, 34, 56])).toBe('rgb(12, 34, 56)')
    expect(formatOklch([0.62796, 0.25768, 29.2339])).toBe('oklch(62.8% 0.258 29.2)')
  })
})

describe('nameColor', () => {
  it('names achromatic colors by lightness', () => {
    expect(nameColor([1, 0, 0])).toBe('White')
    expect(nameColor([0.5, 0.01, 120])).toBe('Gray')
    expect(nameColor([0.05, 0, 0])).toBe('Black')
  })

  it('names chromatic colors by hue bucket', () => {
    expect(nameColor([0.63, 0.26, 29])).toBe('Orange')
    expect(nameColor([0.45, 0.2, 260])).toBe('Violet')
    expect(nameColor([0.9, 0.1, 140])).toBe('Light Green')
  })
})
