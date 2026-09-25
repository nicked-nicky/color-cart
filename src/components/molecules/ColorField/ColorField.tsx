import type { JSX } from 'react'
import { Text, type Grade } from '@stella-componente/terra'
import { ColorDisc } from '@/components/atoms/ColorDisc'
import styles from './ColorField.module.css'

interface ColorFieldProps {
  value: string
  onValueChange: (hex: string) => void
  grade?: Grade
  disabled?: boolean
  'aria-labelledby'?: string
}

export function ColorField({
  value,
  onValueChange,
  grade = 'elevated',
  disabled = false,
  'aria-labelledby': labelledBy
}: ColorFieldProps): JSX.Element {
  return (
    <label
      data-stella-component="color-field"
      data-stella-grade={grade}
      data-disabled={disabled || undefined}
      className={styles.field}
    >
      <ColorDisc hex={value} size="sm" className={styles.disc} />
      <Text variant="mono" color="secondary">
        {value.toUpperCase()}
      </Text>
      <input
        type="color"
        value={value}
        disabled={disabled}
        aria-labelledby={labelledBy}
        onChange={(event) => onValueChange(event.target.value)}
        className={styles.input}
      />
    </label>
  )
}

ColorField.displayName = 'ColorField'

export type { ColorFieldProps }
