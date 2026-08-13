import { Palette, X } from 'lucide-react'
import { usePaletteStore } from '@renderer/store/paletteStore'

function PaletteBasketPanel(): JSX.Element {
  const colors = usePaletteStore((state) => state.colors)
  const removeColor = usePaletteStore((state) => state.removeColor)

  return (
    <aside className="flex w-80 shrink-0 flex-col gap-3 bg-neutral-950 p-4">
      <div className="flex items-center gap-2 text-neutral-300">
        <Palette size={16} />
        <h2 className="text-sm font-medium">Palette ({colors.length})</h2>
      </div>

      {colors.length === 0 ? (
        <p className="mt-2 text-xs text-neutral-600">
          Pick colors from the reference image to add them here.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <div
              key={color.id}
              className="group relative h-16 w-16 overflow-hidden rounded-md border border-neutral-800"
              style={{ backgroundColor: color.hex }}
              title={color.hex}
            >
              <button
                type="button"
                aria-label={`Remove ${color.hex}`}
                onClick={() => removeColor(color.id)}
                className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-sm bg-neutral-950/70 text-neutral-200 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={10} />
              </button>
              <span className="absolute bottom-0.5 left-0.5 rounded-sm bg-neutral-950/70 px-1 text-[10px] leading-tight text-neutral-200">
                {color.hex}
              </span>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}

export default PaletteBasketPanel
