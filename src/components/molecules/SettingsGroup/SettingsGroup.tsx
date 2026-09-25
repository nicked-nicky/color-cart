import type { JSX, ReactNode } from 'react'
import { Text, type Grade } from '@stella-componente/terra'
import styles from './SettingsGroup.module.css'

interface SettingsGroupProps {
  title?: ReactNode
  description?: ReactNode
  grade?: Grade
  children: ReactNode
}

export function SettingsGroup({
  title,
  description,
  grade,
  children
}: SettingsGroupProps): JSX.Element {
  return (
    <section data-stella-component="settings-group" data-stella-grade={grade} className={styles.group}>
      {title && (
        <Text variant="caption-strong" color="secondary" as="h3" className={styles.title}>
          {title}
        </Text>
      )}
      {description && (
        <Text variant="caption" color="tertiary" as="p" className={styles.description}>
          {description}
        </Text>
      )}
      <div className={styles.rows}>{children}</div>
    </section>
  )
}

SettingsGroup.displayName = 'SettingsGroup'

export type { SettingsGroupProps }
