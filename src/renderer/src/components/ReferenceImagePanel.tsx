import { JSX, useEffect, useState, type WheelEvent } from 'react'
import { ImageIcon, FolderOpen, Minus, Plus } from 'lucide-react'
import { useImageStore } from '@renderer/store/imageStore'

const MIN_ZOOM = 0.1
const MAX_ZOOM = 5
const ZOOM_STEP = 0.1
const ZOOM_PRESETS = [25, 50, 75, 100, 150, 200, 300, 400]

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function ReferenceImagePanel(): JSX.Element {
  const url = useImageStore((state) => state.url)
  const setImage = useImageStore((state) => state.setImage)
  const [zoom, setZoom] = useState(1)

  // Reset to 100% whenever a new image is loaded.
  useEffect(() => {
    setZoom(1)
  }, [url])

  // Arrow Up/Down zoom, ignored while a form control (like the % dropdown)
  // has focus so it doesn't fight with native select navigation.
  useEffect(() => {
    if (!url) return

    const handleKeyDown = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setZoom((z) => clamp(z + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM))
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        setZoom((z) => clamp(z - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [url])

  const handleWheel = (event: WheelEvent<HTMLDivElement>): void => {
    const factor = Math.exp(-event.deltaY * 0.001)
    setZoom((z) => clamp(z * factor, MIN_ZOOM, MAX_ZOOM))
  }

  const handleOpen = async (): Promise<void> => {
    const image = await window.api?.openImage()
    if (image) setImage(image)
  }

  if (url) {
    const currentPercent = Math.round(zoom * 100)
    const options = Array.from(new Set([...ZOOM_PRESETS, currentPercent])).sort((a, b) => a - b)

    return (
      <section
        className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-lg shadow-black/30"
        onWheel={handleWheel}
      >
        <img
          src={url}
          alt="Reference"
          draggable={false}
          className="max-h-full max-w-full select-none object-contain transition-transform duration-75 ease-out"
          style={{ transform: `scale(${zoom})` }}
        />

        <button
          type="button"
          onClick={() => void handleOpen()}
          className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-950/80 px-3 py-1.5 text-xs text-neutral-300 backdrop-blur transition-colors hover:border-neutral-500 hover:text-neutral-100"
        >
          <FolderOpen size={14} />
          Change image
        </button>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-neutral-700 bg-neutral-950/90 px-2 py-1.5 shadow-lg backdrop-blur">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoom((z) => clamp(z - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM))}
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
          >
            <Minus size={14} />
          </button>
          <select
            aria-label="Zoom level"
            value={currentPercent}
            onChange={(event) => setZoom(Number(event.target.value) / 100)}
            className="h-7 rounded-full bg-transparent px-1 text-center text-xs text-neutral-300 outline-none hover:bg-neutral-800 focus:bg-neutral-800"
          >
            {options.map((percent) => (
              <option key={percent} value={percent} className="bg-neutral-900 text-neutral-100">
                {percent}%
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setZoom((z) => clamp(z + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM))}
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
          >
            <Plus size={14} />
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-1 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900 shadow-lg shadow-black/30">
      <button
        type="button"
        onClick={() => void handleOpen()}
        className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-neutral-700 px-16 py-14 text-neutral-500 transition-colors hover:border-neutral-500 hover:text-neutral-300"
      >
        <ImageIcon size={36} />
        <span className="text-sm">Click to open a reference image</span>
      </button>
    </section>
  )
}

export default ReferenceImagePanel
