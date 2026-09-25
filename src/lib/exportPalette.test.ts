import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PALETTE_EXPORT_OPTIONS,
  exportFormatFromName,
  hexToRgba,
  isHexColor,
  sanitizeExportOptions,
  shapePolygonPoints
} from './exportPalette'

describe('exportFormatFromName', () => {
  it('maps extensions to encoder formats', () => {
    expect(exportFormatFromName('palette.png')).toBe('png')
    expect(exportFormatFromName('palette.JPG')).toBe('jpeg')
    expect(exportFormatFromName('/a/b/palette.jpeg')).toBe('jpeg')
    expect(exportFormatFromName('palette.webp')).toBe('webp')
  })

  it('falls back to png for unknown or missing extensions', () => {
    expect(exportFormatFromName('palette')).toBe('png')
    expect(exportFormatFromName('palette.gif')).toBe('png')
  })
})

describe('hexToRgba', () => {
  it('converts hex and percent opacity to an rgba string', () => {
    expect(hexToRgba('#ff8000', 50)).toBe('rgba(255, 128, 0, 0.5)')
  })

  it('clamps opacity and tolerates invalid hex', () => {
    expect(hexToRgba('#000000', 150)).toBe('rgba(0, 0, 0, 1)')
    expect(hexToRgba('nope', -5)).toBe('rgba(0, 0, 0, 0)')
  })
})

describe('isHexColor', () => {
  it('accepts only 6-digit hex colors', () => {
    expect(isHexColor('#a1B2c3')).toBe(true)
    expect(isHexColor('#abc')).toBe(false)
    expect(isHexColor('rgba(0, 0, 0, 0.15)')).toBe(false)
    expect(isHexColor(42)).toBe(false)
  })
})

describe('sanitizeExportOptions', () => {
  it('fills missing fields with defaults', () => {
    expect(sanitizeExportOptions({ groupSize: 3 })).toEqual({
      ...DEFAULT_PALETTE_EXPORT_OPTIONS,
      groupSize: 3
    })
  })

  it('replaces colors that are not 6-digit hex', () => {
    const sanitized = sanitizeExportOptions({
      strokeColor: 'rgba(0, 0, 0, 0.15)',
      backgroundColor: 'white'
    })
    expect(sanitized.strokeColor).toBe(DEFAULT_PALETTE_EXPORT_OPTIONS.strokeColor)
    expect(sanitized.backgroundColor).toBe(DEFAULT_PALETTE_EXPORT_OPTIONS.backgroundColor)
  })
})

describe('shapePolygonPoints', () => {
  it('returns one vertex per side for regular polygons', () => {
    expect(shapePolygonPoints('triangle', 10, 10)).toHaveLength(3)
    expect(shapePolygonPoints('pentagon', 10, 10)).toHaveLength(5)
    expect(shapePolygonPoints('hexagon', 10, 10)).toHaveLength(6)
    expect(shapePolygonPoints('octagon', 10, 10)).toHaveLength(8)
    expect(shapePolygonPoints('star', 10, 10)).toHaveLength(10)
  })

  it('starts polygons at the top center', () => {
    const [x, y] = shapePolygonPoints('triangle', 10, 20)?.[0] ?? []
    expect(x).toBeCloseTo(0)
    expect(y).toBeCloseTo(-20)
  })

  it('returns null for curved and rectangular shapes', () => {
    expect(shapePolygonPoints('oval', 10, 10)).toBeNull()
    expect(shapePolygonPoints('circle', 10, 10)).toBeNull()
    expect(shapePolygonPoints('square', 10, 10)).toBeNull()
    expect(shapePolygonPoints('roundedSquare', 10, 10)).toBeNull()
  })
})
