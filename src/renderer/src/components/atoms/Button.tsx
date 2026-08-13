import { JSX, type ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  icon?: ReactNode
  onClick?: () => void
  ariaLabel?: string
  variant?: 'island' | 'ghost' | 'outline'
  tone?: 'default' | 'danger'
  className?: string
}

function Button({
  children,
  icon,
  onClick,
  ariaLabel,
  variant = 'island',
  tone = 'default',
  className = ''
}: ButtonProps): JSX.Element {
  const base = 'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs transition-colors'

  const variantClass = {
    island:
      'border border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100',
    ghost: 'text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100',
    outline: 'border border-neutral-700 text-neutral-400'
  }[variant]

  const toneClass = tone === 'danger' ? 'hover:border-red-500/60 hover:text-red-400' : ''

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`${base} ${variantClass} ${toneClass} ${className}`}
    >
      {icon}
      {children}
    </button>
  )
}

export default Button
