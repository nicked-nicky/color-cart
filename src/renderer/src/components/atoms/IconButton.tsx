import { JSX, type ReactNode } from 'react'

interface IconButtonProps {
  icon: ReactNode
  ariaLabel: string
  onClick?: () => void
  shape?: 'circle' | 'rounded'
  tone?: 'default' | 'danger'
  className?: string
}

function IconButton({
  icon,
  ariaLabel,
  onClick,
  shape = 'rounded',
  tone = 'default',
  className = ''
}: IconButtonProps): JSX.Element {
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg'
  const toneClass =
    tone === 'danger'
      ? 'hover:bg-red-600 hover:text-neutral-100'
      : 'hover:bg-neutral-700 hover:text-neutral-100'

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center text-neutral-400 transition-colors ${shapeClass} ${toneClass} ${className}`}
    >
      {icon}
    </button>
  )
}

export default IconButton
