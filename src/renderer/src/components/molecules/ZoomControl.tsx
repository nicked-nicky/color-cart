import { JSX } from 'react'
import { Minus, Plus } from 'lucide-react'
import Island from '../atoms/Island'
import IconButton from '../atoms/IconButton'

interface ZoomControlProps {
  percent: number
  options: number[]
  onZoomIn: () => void
  onZoomOut: () => void
  onSelect: (percent: number) => void
}

function ZoomControl({ percent, options, onZoomIn, onZoomOut, onSelect }: ZoomControlProps): JSX.Element {
  return (
    <Island className="gap-1 border-border-subtle bg-surface/90 px-2 py-1.5 shadow-lg backdrop-blur">
      <IconButton ariaLabel="Zoom out" onClick={onZoomOut} icon={<Minus size={15} />} />
      <select
        aria-label="Zoom level"
        value={percent}
        onChange={(event) => onSelect(Number(event.target.value))}
        className="h-7 rounded-full bg-transparent px-2 text-center text-xs text-ink-muted outline-none hover:bg-surface-hover focus:bg-surface-hover"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-surface text-ink">
            {option}%
          </option>
        ))}
      </select>
      <IconButton ariaLabel="Zoom in" onClick={onZoomIn} icon={<Plus size={15} />} />
    </Island>
  )
}

export default ZoomControl
