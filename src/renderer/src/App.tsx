import { ImageIcon, Palette } from 'lucide-react'
import { usePaletteStore } from './store/paletteStore'

function App(): JSX.Element {
  const colors = usePaletteStore((state) => state.colors)

  return (
    <div className="flex h-screen w-screen flex-col bg-neutral-950 text-neutral-100 md:flex-row">
      <section className="flex flex-1 items-center justify-center border-b border-neutral-800 md:border-b-0 md:border-r">
        <div className="flex flex-col items-center gap-2 text-neutral-500">
          <ImageIcon size={32} />
          <p className="text-sm">Open a reference image to start picking colors</p>
        </div>
      </section>
      <aside className="flex w-full flex-col gap-3 p-4 md:w-80">
        <div className="flex items-center gap-2 text-neutral-300">
          <Palette size={18} />
          <h2 className="text-sm font-medium">Palette ({colors.length})</h2>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => (
            <div
              key={color.id}
              className="aspect-square rounded-md border border-neutral-800"
              style={{ backgroundColor: color.hex }}
              title={color.hex}
            />
          ))}
        </div>
      </aside>
    </div>
  )
}

export default App
