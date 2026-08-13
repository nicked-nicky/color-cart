import { create } from 'zustand'
import Color from 'colorjs.io'
import type { PaletteColor, SourceCoordinates } from '@renderer/types'

const DUPLICATE_THRESHOLD_DELTA_E = 1

interface PaletteState {
  colors: PaletteColor[]
  addColor: (
    hex: string,
    sourceCoordinates?: SourceCoordinates
  ) => { added: boolean; duplicateOf?: string }
  removeColor: (id: string) => void
  reorderColors: (fromIndex: number, toIndex: number) => void
  clear: () => void
}

function toOklch(hex: string): [number, number, number] {
  const [l, c, h] = new Color(hex).to('oklch').coords
  return [l ?? 0, c ?? 0, h === null || Number.isNaN(h) ? 0 : h]
}

function toRgb(hex: string): [number, number, number] {
  const [r, g, b] = new Color(hex)
    .to('srgb')
    .coords.map((v) => Math.round((v ?? 0) * 255))
  return [r, g, b]
}

function deltaE(hexA: string, hexB: string): number {
  return new Color(hexA).deltaE(new Color(hexB), '2000')
}

export const usePaletteStore = create<PaletteState>((set, get) => ({
  colors: [],
  addColor: (hex, sourceCoordinates) => {
    const existing = get().colors.find((c) => deltaE(c.hex, hex) <= DUPLICATE_THRESHOLD_DELTA_E)
    if (existing) return { added: false, duplicateOf: existing.id }

    const newColor: PaletteColor = {
      id: crypto.randomUUID(),
      hex,
      rgb: toRgb(hex),
      oklch: toOklch(hex),
      timestamp: Date.now(),
      sourceCoordinates: sourceCoordinates ?? null
    }
    set((state) => ({ colors: [...state.colors, newColor] }))
    return { added: true }
  },
  removeColor: (id) => set((state) => ({ colors: state.colors.filter((c) => c.id !== id) })),
  reorderColors: (fromIndex, toIndex) =>
    set((state) => {
      const next = [...state.colors]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return { colors: next }
    }),
  clear: () => set({ colors: [] })
}))
