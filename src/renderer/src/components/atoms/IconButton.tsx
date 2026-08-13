import { JSX, type ReactNode } from 'react'

interface IconButtonProps {
  icon: ReactNode
  ariaLabel: string
  onClick?: () => void
  tone?: 'default' | 'danger'
  className?: string
}

/**
 * Always fully round — a former `shape` prop distinguished "circle" from
 * "rounded" back when the app used a semi-rounded style; now every
 * IconButton looks the same, so the prop (and its branching) is gone.
 */
function IconButton({ icon, ariaLabel, onClick, tone = 'default', className = '' }: IconButtonProps): JSX.Element {
  const toneClass =
    tone === 'danger' ? 'hover:bg-red-600 hover:text-ink' : 'hover:bg-surface-hover hover:text-ink'

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded-full text-ink-faint transition-colors ${toneClass} ${className}`}
    >
      {icon}
    </button>
  )
}

export default IconButton
