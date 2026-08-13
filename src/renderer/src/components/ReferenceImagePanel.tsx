import {
  JSX,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type SyntheticEvent,
  type WheelEvent
} from 'react'
import { ImageIcon, Minus, Plus } from 'lucide-react'
import { useImageStore } from '@renderer/store/imageStore'
import { usePaletteStore } from '@renderer/store/paletteStore'

const MIN_ZOOM = 0.1
const MAX_ZOOM = 5
const ZOOM_STEP = 0.1
const ZOOM_PRESETS = [25, 50, 75, 100, 150, 200, 300, 400]

const LOUPE_SIZE = 140
const LOUPE_MAGNIFICATION = 4
const LOUPE_APPEAR_DELAY_MS = 300

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

interface PickedSample {
  hex: string
  x: number
  y: number
}

function sampleColorAtPoint(
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number
): PickedSample | null {
  const rect = img.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return null

  const fx = (clientX - rect.left) / rect.width
  const fy = (clientY - rect.top) / rect.height
  if (fx < 0 || fx > 1 || fy < 0 || fy > 1) return null

  const x = Math.min(canvas.width - 1, Math.max(0, Math.floor(fx * canvas.width)))
  const y = Math.min(canvas.height - 1, Math.max(0, Math.floor(fy * canvas.height)))

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
  const hex = `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
  return { hex, x, y }
}

function ReferenceImagePanel(): JSX.Element {
  const url = useImageStore((state) => state.url)
  const setImage = useImageStore((state) => state.setImage)
  const addColor = usePaletteStore((state) => state.addColor)

  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPicking, setIsPicking] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [loupeVisible, setLoupeVisible] = useState(false)
  const [loupe, setLoupe] = useState<{ clientX: number; clientY: number; hex: string | null } | null>(
    null
  )

  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const loupeTimerRef = useRef<number | null>(null)
  const panStartRef = useRef<{ mouseX: number; mouseY: number; panX: number; panY: number } | null>(
    null
  )

  const clearLoupeTimer = (): void => {
    if (loupeTimerRef.current !== null) {
      window.clearTimeout(loupeTimerRef.current)
      loupeTimerRef.current = null
    }
  }

  // Reset zoom/pan and drop the sampling canvas whenever a new image loads.
  useEffect(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    canvasRef.current = null
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

  // Track the drag globally so releasing outside the image (or even outside
  // the window bounds) still finalizes or cancels the pick correctly.
  useEffect(() => {
    if (!isPicking) return

    const handleMove = (event: MouseEvent): void => {
      const img = imgRef.current
      const canvas = canvasRef.current
      if (!img || !canvas) return
      const sample = sampleColorAtPoint(img, canvas, event.clientX, event.clientY)
      setLoupe({ clientX: event.clientX, clientY: event.clientY, hex: sample?.hex ?? null })
    }

    const handleUp = (event: MouseEvent): void => {
      const img = imgRef.current
      const canvas = canvasRef.current
      clearLoupeTimer()
      setIsPicking(false)
      setLoupeVisible(false)
      setLoupe(null)
      if (!img || !canvas) return
      const sample = sampleColorAtPoint(img, canvas, event.clientX, event.clientY)
      if (sample) addColor(sample.hex, { x: sample.x, y: sample.y })
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPicking, addColor])

  // Middle-mouse drag to pan. Tracked globally, same reasoning as picking:
  // the drag can leave the image bounds and should keep following the mouse.
  useEffect(() => {
    if (!isPanning) return

    const handleMove = (event: MouseEvent): void => {
      const start = panStartRef.current
      if (!start) return
      setPan({
        x: start.panX + (event.clientX - start.mouseX),
        y: start.panY + (event.clientY - start.mouseY)
      })
    }

    const handleUp = (): void => {
      setIsPanning(false)
      panStartRef.current = null
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [isPanning])

  // Hide the OS cursor for the whole window once the loupe actually shows —
  // a quick click-and-release shouldn't flicker the cursor away.
  useEffect(() => {
    if (!loupeVisible) return
    const previousCursor = document.body.style.cursor
    document.body.style.cursor = 'none'
    return () => {
      document.body.style.cursor = previousCursor
    }
  }, [loupeVisible])

  // Clear any pending appear-timer on unmount.
  useEffect(() => clearLoupeTimer, [])

  const handleWheel = (event: WheelEvent<HTMLDivElement>): void => {
    if (event.deltaY === 0) return
    const direction = event.deltaY < 0 ? 1 : -1
    setZoom((z) => clamp(z + direction * ZOOM_STEP, MIN_ZOOM, MAX_ZOOM))
  }

  const handleOpen = async (): Promise<void> => {
    const image = await window.api?.openImage()
    if (image) setImage(image)
  }

  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>): void => {
    const img = event.currentTarget
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx?.drawImage(img, 0, 0)
    canvasRef.current = canvas
  }

  const handleImageMouseDown = (event: ReactMouseEvent<HTMLImageElement>): void => {
    if (event.button === 1) {
      // Prevent Chromium's default middle-click auto-scroll mode.
      event.preventDefault()
      panStartRef.current = {
        mouseX: event.clientX,
        mouseY: event.clientY,
        panX: pan.x,
        panY: pan.y
      }
      setIsPanning(true)
      return
    }

    if (event.button !== 0) return
    const img = imgRef.current
    const canvas = canvasRef.current
    if (!img || !canvas) return
    const sample = sampleColorAtPoint(img, canvas, event.clientX, event.clientY)
    setIsPicking(true)
    setLoupeVisible(false)
    setLoupe({ clientX: event.clientX, clientY: event.clientY, hex: sample?.hex ?? null })
    clearLoupeTimer()
    loupeTimerRef.current = window.setTimeout(() => setLoupeVisible(true), LOUPE_APPEAR_DELAY_MS)
  }

  if (url) {
    const currentPercent = Math.round(zoom * 100)
    const options = Array.from(new Set([...ZOOM_PRESETS, currentPercent])).sort((a, b) => a - b)

    let loupeStyle: CSSProperties | null = null
    if (loupeVisible && loupe && imgRef.current) {
      const rect = imgRef.current.getBoundingClientRect()
      const bgW = rect.width * LOUPE_MAGNIFICATION
      const bgH = rect.height * LOUPE_MAGNIFICATION
      const fx = (loupe.clientX - rect.left) / rect.width
      const fy = (loupe.clientY - rect.top) / rect.height
      loupeStyle = {
        left: loupe.clientX - LOUPE_SIZE / 2,
        top: loupe.clientY - LOUPE_SIZE / 2,
        width: LOUPE_SIZE,
        height: LOUPE_SIZE,
        borderColor: loupe.hex ?? '#e5e5e5',
        backgroundImage: `url(${url})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundPosition: `${LOUPE_SIZE / 2 - fx * bgW}px ${LOUPE_SIZE / 2 - fy * bgH}px`
      }
    }

    return (
      <section
        className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-800 shadow-lg shadow-black/30"
        onWheel={handleWheel}
      >
        <img
          ref={imgRef}
          src={url}
          alt="Reference"
          draggable={false}
          onLoad={handleImageLoad}
          onMouseDown={handleImageMouseDown}
          className={`max-h-full max-w-full select-none object-contain ${
            isPanning ? '' : 'transition-transform duration-75 ease-out'
          } ${isPanning ? 'cursor-grabbing' : loupeVisible ? 'cursor-none' : 'cursor-crosshair'}`}
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        />

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-neutral-600 bg-neutral-900/90 px-2 py-1.5 shadow-lg backdrop-blur">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoom((z) => clamp(z - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM))}
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-neutral-100"
          >
            <Minus size={15} />
          </button>
          <select
            aria-label="Zoom level"
            value={currentPercent}
            onChange={(event) => setZoom(Number(event.target.value) / 100)}
            className="h-7 rounded-full bg-transparent px-1 text-center text-xs text-neutral-300 outline-none hover:bg-neutral-700 focus:bg-neutral-700"
          >
            {options.map((percent) => (
              <option key={percent} value={percent} className="bg-neutral-800 text-neutral-100">
                {percent}%
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setZoom((z) => clamp(z + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM))}
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-neutral-100"
          >
            <Plus size={15} />
          </button>
        </div>

        {loupeStyle && (
          <div
            className="pointer-events-none fixed z-50 overflow-hidden rounded-full border-4 shadow-2xl"
            style={loupeStyle}
          >
            <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white mix-blend-difference" />
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="flex flex-1 items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-800 shadow-lg shadow-black/30">
      <button
        type="button"
        onClick={() => void handleOpen()}
        className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-neutral-600 px-16 py-14 text-neutral-500 transition-colors hover:border-neutral-500 hover:text-neutral-300"
      >
        <ImageIcon size={40} />
        <span className="text-sm">Click to open a reference image</span>
      </button>
    </section>
  )
}

export default ReferenceImagePanel
