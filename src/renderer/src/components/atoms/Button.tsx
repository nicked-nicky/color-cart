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
  const base = 'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors'

  const variantClass = {
    island: 'border border-border bg-surface text-ink-muted hover:bg-surface-hover hover:text-ink',
    ghost: 'text-ink-muted hover:bg-surface-hover hover:text-ink',
    outline: 'border border-border text-ink-faint'
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
