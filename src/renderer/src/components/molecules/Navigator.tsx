import { JSX, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'

interface NavigatorRect {
  left: number
  top: number
  width: number
  height: number
}

interface NavigatorProps {
  imageUrl: string
  /** Image width/height ratio — the minimap is sized to match so the
   *  thumbnail fills it exactly with no letterboxing, which keeps the
   *  percentage-based viewport rect aligned with what's actually drawn. */
  aspectRatio: number
  rect: NavigatorRect
  onPan: (fractionX: number, fractionY: number) => void
}

const MAX_DIMENSION = 130
const MIN_DIMENSION = 70

function Navigator({ imageUrl, aspectRatio, rect, onPan }: NavigatorProps): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const width = aspectRatio >= 1 ? MAX_DIMENSION : Math.max(MIN_DIMENSION, MAX_DIMENSION * aspectRatio)
  const height = aspectRatio >= 1 ? Math.max(MIN_DIMENSION, MAX_DIMENSION / aspectRatio) : MAX_DIMENSION

  const panFromEvent = (clientX: number, clientY: number): void => {
    const node = rootRef.current
    if (!node) return
    const bounds = node.getBoundingClientRect()
    if (bounds.width === 0 || bounds.height === 0) return
    const fx = (clientX - bounds.left) / bounds.width
    const fy = (clientY - bounds.top) / bounds.height
    onPan(Math.min(1, Math.max(0, fx)), Math.min(1, Math.max(0, fy)))
  }

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>): void => {
    if (event.button !== 0) return
    panFromEvent(event.clientX, event.clientY)
    setIsDragging(true)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMove = (event: MouseEvent): void => panFromEvent(event.clientX, event.clientY)
    const handleUp = (): void => setIsDragging(false)

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging])

  return (
    <div
      ref={rootRef}
      onMouseDown={handleMouseDown}
      className="absolute bottom-4 right-4 z-30 cursor-pointer overflow-hidden rounded-xl border border-border-subtle shadow-lg backdrop-blur"
      style={{
        width,
        height,
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-surface/40" />
      <div
        className="pointer-events-none absolute border-2 border-violet-400 bg-violet-400/20"
        style={{
          left: `${rect.left}%`,
          top: `${rect.top}%`,
          width: `${rect.width}%`,
          height: `${rect.height}%`
        }}
      />
    </div>
  )
}

export default Navigator
