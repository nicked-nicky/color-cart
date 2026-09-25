import type { CSSProperties, JSX } from 'react'
import styles from './Loupe.module.css'

interface LoupeProps {
  style: CSSProperties
}

export function Loupe({ style }: LoupeProps): JSX.Element {
  return (
    <div data-stella-component="loupe" aria-hidden="true" className={styles.loupe} style={style}>
      <div className={styles.reticle} />
    </div>
  )
}

Loupe.displayName = 'Loupe'

export type { LoupeProps }
