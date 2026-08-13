import { JSX } from 'react'
import { Minus, Square, Copy, X } from 'lucide-react'
import Island from '../atoms/Island'
import IconButton from '../atoms/IconButton'

interface WindowControlsProps {
  isMaximized: boolean
  onMinimize: () => void
  onToggleMaximize: () => void
  onClose: () => void
}

function WindowControls({
  isMaximized,
  onMinimize,
  onToggleMaximize,
  onClose
}: WindowControlsProps): JSX.Element {
  return (
    <Island className="gap-1 border-border bg-surface px-1">
      <IconButton ariaLabel="Minimize" onClick={onMinimize} icon={<Minus size={15} />} />
      <IconButton
        ariaLabel={isMaximized ? 'Restore' : 'Maximize'}
        onClick={onToggleMaximize}
        icon={isMaximized ? <Copy size={13} /> : <Square size={13} />}
      />
      <IconButton ariaLabel="Close" tone="danger" onClick={onClose} icon={<X size={16} />} />
    </Island>
  )
}

export default WindowControls
