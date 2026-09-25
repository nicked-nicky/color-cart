import {
  useRef,
  useState,
  type CSSProperties,
  type JSX,
  type PointerEvent as ReactPointerEvent
} from 'react'
import type { Grade } from '@stella-componente/terra'
import { cx } from '@/lib/cx'
import { useNavigatorSettingsStore } from '@/store/navigatorSettingsStore'
import styles from './Navigator.module.css'

interface NavigatorRect {
  left: number
  top: number
  width: number
  height: number
}

interface NavigatorProps {
  imageUrl: string
  aspectRatio: number
  rect: NavigatorRect
  visible: boolean
  onPan: (fractionX: number, fractionY: number) => void
  grade?: Grade
}

const MIN_DIMENSION = 70

function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value))
}

export function Navigator({
  imageUrl,
  aspectRatio,
  rect,
  visible,
  onPan,
  grade = 'elevated'
}: NavigatorProps): JSX.Element {
  const maxDimension = useNavigatorSettingsStore((state) => state.values.size)
  const rootRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const width = aspectRatio >= 1 ? maxDimension : Math.max(MIN_DIMENSION, maxDimension * aspectRatio)
  const height = aspectRatio >= 1 ? Math.max(MIN_DIMENSION, maxDimension / aspectRatio) : maxDimension

  const panFromPoint = (clientX: number, clientY: number): void => {
    const node = rootRef.current
    if (!node) return
    const bounds = node.getBoundingClientRect()
    if (bounds.width === 0 || bounds.height === 0) return
    onPan(clampUnit((clientX - bounds.left) / bounds.width), clampUnit((clientY - bounds.top) / bounds.height))
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!visible || event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    panFromPoint(event.clientX, event.clientY)
    setIsDragging(true)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (isDragging && visible) panFromPoint(event.clientX, event.clientY)
  }

  return (
    <div
      ref={rootRef}
      data-stella-component="navigator"
      data-stella-grade={grade}
      aria-hidden="true"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={() => setIsDragging(false)}
      onPointerCancel={() => setIsDragging(false)}
      className={cx(styles.navigator, visible && styles.visible, visible && isDragging && styles.dragging)}
      style={
        {
          width,
          height,
          '--navigator-image': `url(${imageUrl})`
        } as CSSProperties
      }
    >
      <div
        className={styles.viewport}
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

Navigator.displayName = 'Navigator'

export type { NavigatorProps, NavigatorRect }
