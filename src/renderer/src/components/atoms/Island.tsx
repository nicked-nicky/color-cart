import { JSX, type ReactNode } from 'react'

interface IslandProps {
  children: ReactNode
  className?: string
}

/**
 * Purely structural container atom — no fixed color/background so every
 * call site composes its own tone via `className` without fighting
 * Tailwind's generated-stylesheet cascade order.
 */
function Island({ children, className = '' }: IslandProps): JSX.Element {
  return <div className={`flex h-full items-center rounded-full border ${className}`}>{children}</div>
}

export default Island
