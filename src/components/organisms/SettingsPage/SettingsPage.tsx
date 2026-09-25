import type { JSX, ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button, ButtonIsland, Icon, Text, type Grade } from '@stella-componente/terra'
import styles from './SettingsPage.module.css'

interface SettingsPageProps {
  title: ReactNode
  description?: ReactNode
  onReset?: () => void
  grade?: Grade
  children: ReactNode
}

export function SettingsPage({
  title,
  description,
  onReset,
  grade = 'default',
  children
}: SettingsPageProps): JSX.Element {
  return (
    <div data-stella-component="settings-page" data-stella-grade={grade} className={styles.page}>
      <header className={styles.header}>
        <Text variant="title-2" as="h2">
          {title}
        </Text>
        {description && (
          <Text as="p" color="secondary" className={styles.description}>
            {description}
          </Text>
        )}
      </header>
      {children}
      {onReset && (
        <footer className={styles.footer}>
          <ButtonIsland size="sm" parentGrade={grade}>
            <Button
              leadingIcon={
                <Icon size="sm">
                  <RotateCcw />
                </Icon>
              }
              onClick={onReset}
            >
              Reset to defaults
            </Button>
          </ButtonIsland>
        </footer>
      )}
    </div>
  )
}

SettingsPage.displayName = 'SettingsPage'

export type { SettingsPageProps }
