import { JSX, useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { X, Copy, Check } from 'lucide-react'
import type { PaletteColor } from '@renderer/types'
import { nameColor } from '@renderer/lib/colorName'
import ColorDot from '../atoms/ColorDot'

interface PaletteSwatchProps {
  color: PaletteColor
  onRemove: (id: string) => void
}

function PaletteSwatch({ color, onRemove }: PaletteSwatchProps): JSX.Element {
  const [copied, setCopied] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const name = nameColor(color.oklch)

  // Entrance animation runs once, on mount — i.e. only for newly picked
  // colors, since existing swatches keep a stable `key` and never remount.
  useEffect(() => {
    if (!rootRef.current) return
    animate(rootRef.current, {
      scale: [0.5, 1],
      opacity: [0, 1],
      duration: 280,
      ease: 'outBack'
    })
  }, [])

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(color.hex)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div ref={rootRef} className="flex w-20 flex-col items-center gap-1.5">
      <div className="group relative h-[64px] w-[64px]">
        <ColorDot hex={color.hex} size={64} />
        <button
          type="button"
          aria-label={`Remove ${color.hex}`}
          onClick={() => onRemove(color.id)}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-neutral-900/60 text-neutral-100 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <X size={19} />
        </button>
      </div>

      <div className="flex w-full flex-col items-center text-center">
        <span className="w-full truncate text-[12px] text-ink-muted" title={name}>
          {name}
        </span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="group/hex flex items-center gap-1 text-[11px] text-ink-faint transition-colors hover:text-ink-muted"
        >
          <span className="underline-offset-2 group-hover/hex:underline">{color.hex}</span>
          {copied ? (
            <Check size={11} className="text-emerald-400" />
          ) : (
            <Copy size={11} className="opacity-40 transition-opacity group-hover/hex:opacity-100" />
          )}
        </button>
      </div>
    </div>
  )
}

export default PaletteSwatch
