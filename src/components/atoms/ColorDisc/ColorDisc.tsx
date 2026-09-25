import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react'
import type { Grade } from '@stella-componente/terra'
import { cx } from '@/lib/cx'
import styles from './ColorDisc.module.css'

type ColorDiscSize = 'sm' | 'md' | 'lg' | 'xl'

interface ColorDiscProps extends HTMLAttributes<HTMLDivElement> {
  hex: string
  size?: ColorDiscSize
  grade?: Grade
}

export const ColorDisc = forwardRef<HTMLDivElement, ColorDiscProps>(
  ({ hex, size = 'md', grade, className, style, ...props }, ref) => (
    <div
      ref={ref}
      data-stella-component="color-disc"
      data-stella-grade={grade}
      className={cx(styles.disc, styles[`size-${size}`], className)}
      style={{ '--color-disc-fill': hex, ...style } as CSSProperties}
      {...props}
    />
  )
)

ColorDisc.displayName = 'ColorDisc'

export type { ColorDiscProps, ColorDiscSize }
