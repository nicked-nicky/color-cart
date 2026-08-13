import { JSX, type ReactNode } from 'react'

interface SegmentedControlOption<T extends string> {
  label: ReactNode
  value: T
  ariaLabel?: string
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[]
  value: T
  onChange: (value: T) => void
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange
}: SegmentedControlProps<T>): JSX.Element {
  return (
    <div className="flex rounded-full border border-border bg-canvas p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-label={option.ariaLabel}
          onClick={() => onChange(option.value)}
          className={`flex items-center justify-center rounded-full px-3 py-1 text-xs transition-colors ${
            value === option.value ? 'bg-surface-hover text-ink' : 'text-ink-faint hover:text-ink-muted'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default SegmentedControl
