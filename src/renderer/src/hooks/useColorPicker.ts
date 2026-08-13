import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
  type MouseEvent as ReactMouseEvent,
  type SyntheticEvent
} from 'react'
import type { SourceCoordinates } from '@renderer/types'

const LOUPE_SIZE = 140
const LOUPE_MAGNIFICATION = 4
const LOUPE_APPEAR_DELAY_MS = 100
/** Cap on the offscreen sampling canvas's longest side, in px. Large source
 *  photos (e.g. 8000x6000) don't need to be rasterized at full resolution
 *  just to read a pixel color back out — that's a lot of memory and a slow
 *  drawImage for no visible benefit. */
const MAX_SAMPLING_DIMENSION = 2048

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

/** Computed outside render (in an event handler), where reading `img.getBoundingClientRect()` is safe. */
function computeLoupeStyle(
  img: HTMLImageElement,
  imageUrl: string,
  clientX: number,
  clientY: number,
  hex: string | null
): CSSProperties {
  const rect = img.getBoundingClientRect()
  const bgW = rect.width * LOUPE_MAGNIFICATION
  const bgH = rect.height * LOUPE_MAGNIFICATION
  const fx = (clientX - rect.left) / rect.width
  const fy = (clientY - rect.top) / rect.height
  return {
    left: clientX - LOUPE_SIZE / 2,
    top: clientY - LOUPE_SIZE / 2,
    width: LOUPE_SIZE,
    height: LOUPE_SIZE,
    borderColor: hex ?? '#e5e5e5',
    backgroundImage: `url(${imageUrl})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${bgW}px ${bgH}px`,
    backgroundPosition: `${LOUPE_SIZE / 2 - fx * bgW}px ${LOUPE_SIZE / 2 - fy * bgH}px`
  }
}

interface UseColorPickerOptions {
  imgRef: RefObject<HTMLImageElement | null>
  imageUrl: string | null
  onPick: (hex: string, coordinates: SourceCoordinates) => void
}

/**
 * Owns pixel-accurate color sampling from the reference image: an
 * offscreen canvas for reading pixels, a press-hold-drag-release
 * interaction, and the delayed magnifier loupe (with its style fully
 * computed here so the component just renders it).
 */
export function useColorPicker({ imgRef, imageUrl, onPick }: UseColorPickerOptions): {
  loupeStyle: CSSProperties | null
  isPicking: boolean
  handleImageLoad: (event: SyntheticEvent<HTMLImageElement>) => void
  handlePickMouseDown: (event: ReactMouseEvent<HTMLImageElement>) => boolean
} {
  const [isPicking, setIsPicking] = useState(false)
  const [loupeVisible, setLoupeVisible] = useState(false)
  const [loupeStyle, setLoupeStyle] = useState<CSSProperties | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const loupeTimerRef = useRef<number | null>(null)

  const clearLoupeTimer = (): void => {
    if (loupeTimerRef.current !== null) {
      window.clearTimeout(loupeTimerRef.current)
      loupeTimerRef.current = null
    }
  }

  useEffect(() => {
    canvasRef.current = null
  }, [imageUrl])

  // Track the drag globally so releasing outside the image (or even outside
  // the window bounds) still finalizes or cancels the pick correctly.
  useEffect(() => {
    if (!isPicking) return

    const handleMove = (event: MouseEvent): void => {
      const img = imgRef.current
      const canvas = canvasRef.current
      if (!img || !canvas) return
      const sample = sampleColorAtPoint(img, canvas, event.clientX, event.clientY)
      if (imageUrl) {
        setLoupeStyle(computeLoupeStyle(img, imageUrl, event.clientX, event.clientY, sample?.hex ?? null))
      }
    }

    const handleUp = (event: MouseEvent): void => {
      const img = imgRef.current
      const canvas = canvasRef.current
      clearLoupeTimer()
      setIsPicking(false)
      setLoupeVisible(false)
      setLoupeStyle(null)
      if (!img || !canvas) return
      const sample = sampleColorAtPoint(img, canvas, event.clientX, event.clientY)
      if (sample) onPick(sample.hex, { x: sample.x, y: sample.y })
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPicking, onPick, imageUrl])

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

  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>): void => {
    const img = event.currentTarget
    const scale = Math.min(1, MAX_SAMPLING_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (ctx) {
      // Downscaling with smoothing on would blend neighboring source pixels
      // into whatever gets sampled — nearest-neighbor keeps a picked color
      // an exact source pixel instead of an average.
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    canvasRef.current = canvas
  }

  const handlePickMouseDown = (event: ReactMouseEvent<HTMLImageElement>): boolean => {
    if (event.button !== 0) return false
    const img = imgRef.current
    const canvas = canvasRef.current
    if (!img || !canvas) return false
    const sample = sampleColorAtPoint(img, canvas, event.clientX, event.clientY)
    setIsPicking(true)
    setLoupeVisible(false)
    if (imageUrl) {
      setLoupeStyle(computeLoupeStyle(img, imageUrl, event.clientX, event.clientY, sample?.hex ?? null))
    }
    clearLoupeTimer()
    loupeTimerRef.current = window.setTimeout(() => setLoupeVisible(true), LOUPE_APPEAR_DELAY_MS)
    return true
  }

  return { loupeStyle: loupeVisible ? loupeStyle : null, isPicking, handleImageLoad, handlePickMouseDown }
}
