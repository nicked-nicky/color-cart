import { JSX } from 'react'

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
  return (
    <label className="flex items-center justify-between gap-3 py-1.5 text-sm text-ink-muted">
      <span>{label}</span>
      <span className="flex items-center gap-1.5">
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
          className="w-20 rounded-full border border-border bg-canvas px-3 py-1 text-right text-sm text-ink outline-none focus:border-ink-faint"
        />
        {suffix && <span className="w-6 text-xs text-ink-faint">{suffix}</span>}
      </span>
    </label>
  )
}

export default NumberField
