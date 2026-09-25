import { useState, type HTMLAttributes, type PointerEvent as ReactPointerEvent } from 'react'

const DRAG_THRESHOLD_PX = 4
const SWATCH_INDEX_ATTRIBUTE = 'data-swatch-index'

interface DragState {
  from: number
  over: number | null
  active: boolean
  startX: number
  startY: number
}

function indexAtPoint(clientX: number, clientY: number): number | null {
  const target = document
    .elementFromPoint(clientX, clientY)
    ?.closest<HTMLElement>(`[${SWATCH_INDEX_ATTRIBUTE}]`)
  const index = target?.getAttribute(SWATCH_INDEX_ATTRIBUTE)
  return index === null || index === undefined ? null : Number(index)
}

export function useSwatchReorder(onReorder: (fromIndex: number, toIndex: number) => void): {
  draggingIndex: number | null
  dropTargetIndex: number | null
  handlePropsFor: (index: number) => HTMLAttributes<HTMLDivElement>
} {
  const [drag, setDrag] = useState<DragState | null>(null)

  const handlePropsFor = (index: number): HTMLAttributes<HTMLDivElement> => ({
    onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return
      event.currentTarget.setPointerCapture(event.pointerId)
      setDrag({ from: index, over: null, active: false, startX: event.clientX, startY: event.clientY })
    },
    onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!drag || drag.from !== index) return
      const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY)
      if (!drag.active && distance < DRAG_THRESHOLD_PX) return
      setDrag({ ...drag, active: true, over: indexAtPoint(event.clientX, event.clientY) })
    },
    onPointerUp: () => {
      if (drag?.active && drag.over !== null && drag.over !== drag.from) {
        onReorder(drag.from, drag.over)
      }
      setDrag(null)
    },
    onPointerCancel: () => setDrag(null)
  })

  return {
    draggingIndex: drag?.active ? drag.from : null,
    dropTargetIndex: drag?.active && drag.over !== drag.from ? drag.over : null,
    handlePropsFor
  }
}
