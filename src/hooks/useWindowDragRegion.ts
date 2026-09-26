import { useEffect, type RefObject } from 'react'
import { isDesktop, startWindowDrag } from '@/platform'

const DRAG_THRESHOLD_PX = 4
const INTERACTIVE_SELECTOR =
  'button, a, input, select, textarea, label, [role="button"], [role="menuitem"], [role="tab"], [contenteditable]'

/**
 * Makes everything inside `ref` that isn't interactive drag the window.
 *
 * Tauri's own data-tauri-drag-region starts the move on mousedown. On Linux
 * that hands the pointer to the window manager, so the second click of a
 * double-click never reaches the page and double-click-to-maximize breaks.
 * Here the move only starts once the pointer actually travels, leaving plain
 * clicks and double-clicks to the page.
 */
export function useWindowDragRegion(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const region = ref.current
    if (!isDesktop || !region) return

    // Opt the whole subtree out of Tauri's built-in drag handling.
    for (const el of region.querySelectorAll('[data-tauri-drag-region]')) {
      el.setAttribute('data-tauri-drag-region', 'false')
    }

    let cancelPending: (() => void) | null = null

    const handleMouseDown = (down: MouseEvent): void => {
      if (down.button !== 0 || down.detail > 1) return
      if (!(down.target instanceof Element) || down.target.closest(INTERACTIVE_SELECTOR)) return

      const handleMove = (move: MouseEvent): void => {
        const distance = Math.hypot(move.clientX - down.clientX, move.clientY - down.clientY)
        if (distance < DRAG_THRESHOLD_PX) return
        cancel()
        void startWindowDrag()
      }
      const cancel = (): void => {
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('mouseup', cancel)
        cancelPending = null
      }

      cancelPending?.()
      cancelPending = cancel
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', cancel)
    }

    region.addEventListener('mousedown', handleMouseDown)
    return () => {
      region.removeEventListener('mousedown', handleMouseDown)
      cancelPending?.()
    }
  }, [ref])
}
