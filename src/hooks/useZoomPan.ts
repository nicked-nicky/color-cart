import { useEffect, useRef, useState, type RefObject, type MouseEvent as ReactMouseEvent, type WheelEvent } from 'react'
import { useNavigatorSettingsStore } from '@/store/navigatorSettingsStore'
import { useGeneralSettingsStore } from '@/store/generalSettingsStore'

const MIN_ZOOM = 0.1
const MAX_ZOOM = 10
const ZOOM_PRESETS = [25, 50, 75, 100, 150, 200, 300, 400, 600, 800, 1000]
/** Minimum px of the image that must stay inside the viewport at all times. */
const MIN_VISIBLE_PX = 40
/** Cap on how much a fast flick can multiply the base zoom rate by, so an
 *  extreme scroll spike can't send zoom flying uncontrollably. */
const MAX_SPEED_MULTIPLIER = 4

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

interface Pan {
  x: number
  y: number
}

interface Size {
  width: number
  height: number
}

interface NavigatorRect {
  left: number
  top: number
  width: number
  height: number
}

/** Keeps at least MIN_VISIBLE_PX of the image overlapping the section, so it can never be panned or zoomed fully off-screen. */
function clampPan(pan: Pan, imgRect: DOMRect, sectionRect: DOMRect): Pan {
  const maxX = Math.max(0, sectionRect.width / 2 + imgRect.width / 2 - MIN_VISIBLE_PX)
  const maxY = Math.max(0, sectionRect.height / 2 + imgRect.height / 2 - MIN_VISIBLE_PX)
  return { x: clamp(pan.x, -maxX, maxX), y: clamp(pan.y, -maxY, maxY) }
}

function observeSize(node: Element, onChange: (size: Size) => void): () => void {
  const observer = new ResizeObserver(([entry]) => {
    const box = entry.borderBoxSize?.[0]
    onChange(box ? { width: box.inlineSize, height: box.blockSize } : entry.contentRect)
  })
  observer.observe(node)
  return () => observer.disconnect()
}

interface UseZoomPanOptions {
  imgRef: RefObject<HTMLImageElement | null>
  sectionRef: RefObject<HTMLElement | null>
  /** The currently loaded image URL — zoom/pan resets when it changes, and arrow-key zoom is only active while it's set. */
  imageUrl: string | null
}

/**
 * Owns zoom/pan state for the reference image: wheel-to-zoom (anchored to
 * the cursor position so the point under it stays put, and scaled by how
 * fast you're scrolling for finer control at low speed and bigger jumps on
 * a fast flick), arrow-key zoom, middle-mouse drag-to-pan, and the data a
 * minimap navigator needs — all with pan clamped so the image can't
 * disappear off the edge of the viewport.
 */
export function useZoomPan({ imgRef, sectionRef, imageUrl }: UseZoomPanOptions): {
  zoom: number
  pan: Pan
  isPanning: boolean
  currentPercent: number
  zoomOptions: number[]
  baseSize: Size | null
  navigatorRect: NavigatorRect | null
  navigatorVisible: boolean
  handleWheel: (event: WheelEvent<HTMLDivElement>) => void
  handlePanMouseDown: (event: ReactMouseEvent<HTMLImageElement>) => boolean
  setZoomPercent: (percent: number) => void
  zoomIn: () => void
  zoomOut: () => void
  panToImageFraction: (fractionX: number, fractionY: number) => void
} {
  const navigatorThresholdPercent = useNavigatorSettingsStore(
    (state) => state.values.appearThresholdPercent
  )
  const zoomBaseRate = useGeneralSettingsStore((state) => state.values.zoomBaseRate)
  const zoomSensitivity = useGeneralSettingsStore((state) => state.values.zoomSensitivity)

  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [baseSize, setBaseSize] = useState<Size | null>(null)
  const [sectionSize, setSectionSize] = useState<Size | null>(null)
  const panStartRef = useRef<{ mouseX: number; mouseY: number; panX: number; panY: number } | null>(null)
  const lastWheelTimeRef = useRef<number | null>(null)

  useEffect(() => {
    // Reset when a new image loads. The panel stays mounted across image
    // swaps (only the <img src> changes), so there's no natural `key` to
    // remount by — an imperative reset here is the pragmatic option.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setZoom(1)
    setPan({ x: 0, y: 0 })
    lastWheelTimeRef.current = null
  }, [imageUrl])

  useEffect(() => {
    if (!imageUrl) return

    const handleKeyDown = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setZoom((z) => clamp(z * Math.exp(zoomBaseRate), MIN_ZOOM, MAX_ZOOM))
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        setZoom((z) => clamp(z * Math.exp(-zoomBaseRate), MIN_ZOOM, MAX_ZOOM))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [imageUrl, zoomBaseRate])

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

  // The section is mounted in both the loaded and empty states, so its size
  // only needs tracking once. A CSS `transform` (our zoom scale) doesn't
  // affect the layout box ResizeObserver reports, so observing the image
  // element here always yields its *unscaled* — i.e. zoom=1 "fit" — size,
  // regardless of the current zoom level.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    return observeSize(section, setSectionSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const img = imgRef.current
    if (!img) return
    return observeSize(img, setBaseSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl])

  const handleWheel = (event: WheelEvent<HTMLDivElement>): void => {
    if (event.deltaY === 0) return
    const img = imgRef.current
    const section = sectionRef.current
    if (!img || !section) return

    // Scale the zoom rate by how fast the user is scrolling: a burst of
    // large deltas arriving close together (a fast flick) ramps the
    // multiplier up, while a slow, deliberate scroll stays close to the
    // base rate. Both signals are needed since trackpads emit frequent
    // small deltas and mouse wheels emit sparse large ones.
    const now = performance.now()
    const previous = lastWheelTimeRef.current
    lastWheelTimeRef.current = now
    const dt = previous === null ? null : now - previous
    const speed = dt === null || dt <= 0 ? 0 : Math.abs(event.deltaY) / dt
    const speedMultiplier = clamp(1 + zoomSensitivity * speed, 1, MAX_SPEED_MULTIPLIER)
    const effectiveRate = zoomBaseRate * speedMultiplier

    const direction = event.deltaY < 0 ? 1 : -1
    const nextZoom = clamp(zoom * Math.exp(direction * effectiveRate), MIN_ZOOM, MAX_ZOOM)
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
  const zoomIn = (): void => setZoom((z) => clamp(z * Math.exp(zoomBaseRate), MIN_ZOOM, MAX_ZOOM))
  const zoomOut = (): void => setZoom((z) => clamp(z * Math.exp(-zoomBaseRate), MIN_ZOOM, MAX_ZOOM))

  /** Recenters the view on a point given as a 0-1 fraction of the image — what a minimap click/drag reports. */
  const panToImageFraction = (fractionX: number, fractionY: number): void => {
    const img = imgRef.current
    const section = sectionRef.current
    if (!img || !section || !baseSize) return
    const nextPan = {
      x: -(fractionX - 0.5) * baseSize.width * zoom,
      y: -(fractionY - 0.5) * baseSize.height * zoom
    }
    setPan(clampPan(nextPan, img.getBoundingClientRect(), section.getBoundingClientRect()))
  }

  const currentPercent = Math.round(zoom * 100)
  const zoomOptions = Array.from(new Set([...ZOOM_PRESETS, currentPercent])).sort((a, b) => a - b)

  // Computed whenever we have enough layout info, regardless of whether
  // it's currently meant to be shown — the navigator stays mounted at all
  // times and just fades via `navigatorVisible`, so its rect always needs
  // to be up to date underneath.
  let navigatorRect: NavigatorRect | null = null
  if (baseSize && sectionSize) {
    const halfW = (baseSize.width * zoom) / 2
    const halfH = (baseSize.height * zoom) / 2
    const imgLeft = pan.x - halfW
    const imgTop = pan.y - halfH
    const imgRight = imgLeft + baseSize.width * zoom
    const imgBottom = imgTop + baseSize.height * zoom
    const viewLeft = -sectionSize.width / 2
    const viewTop = -sectionSize.height / 2
    const viewRight = sectionSize.width / 2
    const viewBottom = sectionSize.height / 2

    const fracLeft = clamp((Math.max(imgLeft, viewLeft) - imgLeft) / (baseSize.width * zoom), 0, 1)
    const fracRight = clamp((Math.min(imgRight, viewRight) - imgLeft) / (baseSize.width * zoom), 0, 1)
    const fracTop = clamp((Math.max(imgTop, viewTop) - imgTop) / (baseSize.height * zoom), 0, 1)
    const fracBottom = clamp((Math.min(imgBottom, viewBottom) - imgTop) / (baseSize.height * zoom), 0, 1)

    navigatorRect = {
      left: fracLeft * 100,
      top: fracTop * 100,
      width: Math.max(0, fracRight - fracLeft) * 100,
      height: Math.max(0, fracBottom - fracTop) * 100
    }
  }

  return {
    zoom,
    pan,
    isPanning,
    currentPercent,
    zoomOptions,
    baseSize,
    navigatorRect,
    navigatorVisible: currentPercent > navigatorThresholdPercent,
    handleWheel,
    handlePanMouseDown,
    setZoomPercent,
    zoomIn,
    zoomOut,
    panToImageFraction
  }
}
