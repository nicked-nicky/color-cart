import { JSX } from 'react'

interface SegmentedControlOption<T extends string> {
  label: string
  value: T
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
    <div className="flex rounded-lg border border-neutral-700 bg-neutral-900 p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-md px-3 py-1 text-xs transition-colors ${
            value === option.value
              ? 'bg-neutral-700 text-neutral-100'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default SegmentedControl
