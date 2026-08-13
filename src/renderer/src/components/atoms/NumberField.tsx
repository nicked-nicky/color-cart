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
    <label className="flex items-center justify-between gap-3 py-1.5 text-sm text-neutral-300">
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
          className="w-20 rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1 text-right text-sm text-neutral-100 outline-none focus:border-neutral-500"
        />
        {suffix && <span className="w-6 text-xs text-neutral-500">{suffix}</span>}
      </span>
    </label>
  )
}

export default NumberField
