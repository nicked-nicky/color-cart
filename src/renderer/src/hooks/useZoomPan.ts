import { useEffect, useRef, useState, type RefObject, type MouseEvent as ReactMouseEvent, type WheelEvent } from 'react'

const MIN_ZOOM = 0.1
const MAX_ZOOM = 5
const ZOOM_STEP = 0.1
const ZOOM_PRESETS = [25, 50, 75, 100, 150, 200, 300, 400]
/** Minimum px of the image that must stay inside the viewport at all times. */
const MIN_VISIBLE_PX = 40

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

interface Pan {
  x: number
  y: number
}

/** Keeps at least MIN_VISIBLE_PX of the image overlapping the section, so it can never be panned or zoomed fully off-screen. */
function clampPan(pan: Pan, imgRect: DOMRect, sectionRect: DOMRect): Pan {
  const maxX = Math.max(0, sectionRect.width / 2 + imgRect.width / 2 - MIN_VISIBLE_PX)
  const maxY = Math.max(0, sectionRect.height / 2 + imgRect.height / 2 - MIN_VISIBLE_PX)
  return { x: clamp(pan.x, -maxX, maxX), y: clamp(pan.y, -maxY, maxY) }
}

interface UseZoomPanOptions {
  imgRef: RefObject<HTMLImageElement | null>
  sectionRef: RefObject<HTMLElement | null>
  /** The currently loaded image URL — zoom/pan resets when it changes, and arrow-key zoom is only active while it's set. */
  imageUrl: string | null
}

/**
 * Owns zoom/pan state for the reference image: wheel-to-zoom (anchored to
 * the cursor position so the point under it stays put), arrow-key zoom,
 * and middle-mouse drag-to-pan — with pan always clamped so the image
 * can't disappear off the edge of the viewport.
 */
export function useZoomPan({ imgRef, sectionRef, imageUrl }: UseZoomPanOptions): {
  zoom: number
  pan: Pan
  isPanning: boolean
  currentPercent: number
  zoomOptions: number[]
  handleWheel: (event: WheelEvent<HTMLDivElement>) => void
  handlePanMouseDown: (event: ReactMouseEvent<HTMLImageElement>) => boolean
  setZoomPercent: (percent: number) => void
  zoomIn: () => void
  zoomOut: () => void
} {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStartRef = useRef<{ mouseX: number; mouseY: number; panX: number; panY: number } | null>(null)

  useEffect(() => {
    // Reset when a new image loads. The panel stays mounted across image
    // swaps (only the <img src> changes), so there's no natural `key` to
    // remount by — an imperative reset here is the pragmatic option.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [imageUrl])

  useEffect(() => {
    if (!imageUrl) return

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
  }, [imageUrl])

  useEffect(() => {
    if (!isPanning) return

    const handleMove = (event: MouseEvent): void => {
      const start = panStartRef.current
      const img = imgRef.current
      const section = sectionRef.current
      if (!start || !img || !section) return
      const tentative = {
        x: start.panX + (event.clientX - start.mouseX),
        y: start.panY + (event.clientY - start.mouseY)
      }
      setPan(clampPan(tentative, img.getBoundingClientRect(), section.getBoundingClientRect()))
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
  }, [isPanning, imgRef, sectionRef])

  const handleWheel = (event: WheelEvent<HTMLDivElement>): void => {
    if (event.deltaY === 0) return
    const img = imgRef.current
    const section = sectionRef.current
    if (!img || !section) return

    const direction = event.deltaY < 0 ? 1 : -1
    const nextZoom = clamp(zoom + direction * ZOOM_STEP, MIN_ZOOM, MAX_ZOOM)
    if (nextZoom === zoom) return

    // Anchor the zoom to the cursor: work out how far the cursor sits from
    // the image's current visual center, then shift pan so that same
    // world point stays under the cursor at the new zoom level.
    const rect = img.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = event.clientX - centerX
    const dy = event.clientY - centerY
    const scaleRatio = nextZoom / zoom
    const panRatio = 1 - scaleRatio

    const sectionRect = section.getBoundingClientRect()
    const nextImgRect = new DOMRect(
      rect.left - (rect.width * (scaleRatio - 1)) / 2,
      rect.top - (rect.height * (scaleRatio - 1)) / 2,
      rect.width * scaleRatio,
      rect.height * scaleRatio
    )

    setPan(clampPan({ x: pan.x + dx * panRatio, y: pan.y + dy * panRatio }, nextImgRect, sectionRect))
    setZoom(nextZoom)
  }

  const handlePanMouseDown = (event: ReactMouseEvent<HTMLImageElement>): boolean => {
    if (event.button !== 1) return false
    // Prevent Chromium's default middle-click auto-scroll mode.
    event.preventDefault()
    panStartRef.current = { mouseX: event.clientX, mouseY: event.clientY, panX: pan.x, panY: pan.y }
    setIsPanning(true)
    return true
  }

  const setZoomPercent = (percent: number): void => setZoom(clamp(percent / 100, MIN_ZOOM, MAX_ZOOM))
  const zoomIn = (): void => setZoom((z) => clamp(z + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM))
  const zoomOut = (): void => setZoom((z) => clamp(z - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM))

  const currentPercent = Math.round(zoom * 100)
  const zoomOptions = Array.from(new Set([...ZOOM_PRESETS, currentPercent])).sort((a, b) => a - b)

  return {
    zoom,
    pan,
    isPanning,
    currentPercent,
    zoomOptions,
    handleWheel,
    handlePanMouseDown,
    setZoomPercent,
    zoomIn,
    zoomOut
  }
}
