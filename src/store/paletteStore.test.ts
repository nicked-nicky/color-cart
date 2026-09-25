import { beforeEach, describe, expect, it } from 'vitest'
import { usePaletteStore } from './paletteStore'

describe('paletteStore', () => {
  beforeEach(() => usePaletteStore.getState().clear())

  it('adds a color with derived rgb and oklch values', () => {
    const result = usePaletteStore.getState().addColor('#ff0000', { x: 3, y: 4 })
    const [color] = usePaletteStore.getState().colors
    expect(result).toEqual({ added: true })
    expect(color.rgb).toEqual([255, 0, 0])
    expect(color.oklch[0]).toBeCloseTo(0.628, 2)
    expect(color.sourceCoordinates).toEqual({ x: 3, y: 4 })
  })

  it('skips near-duplicate colors', () => {
    const { addColor } = usePaletteStore.getState()
    addColor('#336699')
    const result = addColor('#336698')
    expect(result.added).toBe(false)
    expect(result.duplicateOf).toBe(usePaletteStore.getState().colors[0].id)
    expect(usePaletteStore.getState().colors).toHaveLength(1)
  })

  it('reorders and removes colors', () => {
    const { addColor } = usePaletteStore.getState()
    addColor('#ff0000')
    addColor('#00ff00')
    addColor('#0000ff')
    usePaletteStore.getState().reorderColors(0, 2)
    expect(usePaletteStore.getState().colors.map((c) => c.hex)).toEqual([
      '#00ff00',
      '#0000ff',
      '#ff0000'
    ])
    usePaletteStore.getState().removeColor(usePaletteStore.getState().colors[1].id)
    expect(usePaletteStore.getState().colors.map((c) => c.hex)).toEqual(['#00ff00', '#ff0000'])
  })
})
