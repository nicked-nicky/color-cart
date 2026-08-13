import { JSX } from 'react'

interface ColorDotProps {
  hex: string
  size?: number
  className?: string
}

function ColorDot({ hex, size = 64, className = '' }: ColorDotProps): JSX.Element {
  return (
    <div
      className={`rounded-full border border-border shadow-inner ${className}`}
      style={{ backgroundColor: hex, width: size, height: size }}
    />
  )
}

export default ColorDot
