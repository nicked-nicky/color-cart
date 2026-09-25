import { useId, type JSX, type ReactNode } from 'react'
import { Text, type Grade } from '@stella-componente/terra'
import styles from './SettingRow.module.css'

interface SettingRowProps {
  label: ReactNode
  description?: ReactNode
  grade?: Grade
  children: (labelId: string) => ReactNode
}

export function SettingRow({ label, description, grade, children }: SettingRowProps): JSX.Element {
  const labelId = useId()
  return (
    <div data-stella-component="setting-row" data-stella-grade={grade} className={styles.row}>
      <div className={styles.text}>
        <Text id={labelId} variant="body-strong" as="div">
          {label}
        </Text>
        {description && (
          <Text variant="caption" color="secondary" as="p" className={styles.description}>
            {description}
          </Text>
        )}
      </div>
      <div className={styles.control}>{children(labelId)}</div>
    </div>
  )
}

SettingRow.displayName = 'SettingRow'

export type { SettingRowProps }
