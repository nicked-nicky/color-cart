import { JSX } from 'react'
import { Palette, Trash2 } from 'lucide-react'
import { usePaletteStore } from '@renderer/store/paletteStore'
import PaletteSwatch from '../molecules/PaletteSwatch'
import Button from '../atoms/Button'

function PaletteBasketPanel(): JSX.Element {
  const colors = usePaletteStore((state) => state.colors)
  const removeColor = usePaletteStore((state) => state.removeColor)
  const clear = usePaletteStore((state) => state.clear)

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col gap-3 rounded-2xl border border-neutral-700 bg-neutral-800 p-4 shadow-lg shadow-black/30">
      <div className="flex shrink-0 items-center gap-2 text-neutral-300">
        <Palette size={18} />
        <h2 className="text-sm font-medium">Palette ({colors.length})</h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {colors.length === 0 ? (
          <p className="text-xs text-neutral-600">
            Click and hold on the reference image to pick a color.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => (
              <PaletteSwatch key={color.id} color={color} onRemove={removeColor} />
            ))}
          </div>
        )}
      </div>

      {colors.length > 0 && (
        <Button
          variant="outline"
          tone="danger"
          onClick={clear}
          icon={<Trash2 size={14} />}
          className="w-full shrink-0 justify-center py-1.5"
        >
          Clear all
        </Button>
      )}
    </aside>
  )
}

export default PaletteBasketPanel
