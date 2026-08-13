import { JSX } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface NumberFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
}

function NumberField({ label, value, onChange, min, max, step = 1, suffix }: NumberFieldProps): JSX.Element {
  const clamped = (next: number): number => {
    if (min !== undefined) next = Math.max(min, next)
    if (max !== undefined) next = Math.min(max, next)
    return next
  }
  const stepBy = (delta: number): void => onChange(clamped(value + delta * step))

  return (
    <label className="flex items-center justify-between gap-3 py-1.5 text-sm text-ink-muted">
      <span>{label}</span>
      <span className="flex items-center gap-1.5">
        <span className="relative">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(event) => {
              const next = Number(event.target.value)
              if (!Number.isNaN(next)) onChange(next)
            }}
            className="w-20 rounded-full border border-border bg-canvas py-1 pl-3 pr-7 text-right text-sm text-ink outline-none focus:border-ink-faint"
          />
          <span className="absolute inset-y-1 right-1 flex flex-col">
            <button
              type="button"
              aria-label={`Increase ${label}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => stepBy(1)}
              className="flex h-1/2 w-5 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-surface-hover hover:text-ink"
            >
              <ChevronUp size={11} />
            </button>
            <button
              type="button"
              aria-label={`Decrease ${label}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => stepBy(-1)}
              className="flex h-1/2 w-5 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-surface-hover hover:text-ink"
            >
              <ChevronDown size={11} />
            </button>
          </span>
        </span>
        {suffix && <span className="w-6 text-xs text-ink-faint">{suffix}</span>}
      </span>
    </label>
  )
}

export default NumberField
