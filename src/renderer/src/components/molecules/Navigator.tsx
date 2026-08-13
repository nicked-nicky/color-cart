import { JSX, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { useNavigatorSettingsStore } from '@renderer/store/navigatorSettingsStore'

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
  /** Whether the navigator should currently be shown. Stays mounted either
   *  way — only opacity/scale/pointer-events change — so appearing at the
   *  zoom threshold is a cheap CSS transition instead of a fresh mount. */
  visible: boolean
  onPan: (fractionX: number, fractionY: number) => void
}

const MIN_DIMENSION = 70

function Navigator({ imageUrl, aspectRatio, rect, visible, onPan }: NavigatorProps): JSX.Element {
  const maxDimension = useNavigatorSettingsStore((state) => state.values.size)
  const rootRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const width = aspectRatio >= 1 ? maxDimension : Math.max(MIN_DIMENSION, maxDimension * aspectRatio)
  const height = aspectRatio >= 1 ? Math.max(MIN_DIMENSION, maxDimension / aspectRatio) : maxDimension

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
    if (!visible || event.button !== 0) return
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
      className={`absolute bottom-4 right-4 z-30 cursor-pointer overflow-hidden rounded-xl border border-border-subtle shadow-lg backdrop-blur transition-[opacity,transform] duration-200 ease-out ${
        visible ? 'scale-100 opacity-100' : 'pointer-events-none scale-90 opacity-0'
      }`}
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
        className="pointer-events-none absolute border-2 border-accent bg-accent/20"
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
