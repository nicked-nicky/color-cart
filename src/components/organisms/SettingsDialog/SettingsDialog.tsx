import { useState, type ComponentType, type JSX } from 'react'
import { Compass, ImageDown, SlidersHorizontal, SunMoon, type LucideIcon } from 'lucide-react'
import { Button, ButtonIsland, Dialog, Icon, ScrollArea } from '@stella-componente/terra'
import { useUiStore } from '@/store/uiStore'
import { AppearanceSettingsPanel } from '@/components/organisms/AppearanceSettingsPanel'
import { ExportSettingsPanel } from '@/components/organisms/ExportSettingsPanel'
import { GeneralSettingsPanel } from '@/components/organisms/GeneralSettingsPanel'
import { NavigatorSettingsPanel } from '@/components/organisms/NavigatorSettingsPanel'
import styles from './SettingsDialog.module.css'

type CategoryId = 'general' | 'navigator' | 'export' | 'appearance'

interface Category {
  id: CategoryId
  label: string
  icon: LucideIcon
  Panel: ComponentType
}

const CATEGORIES: Category[] = [
  { id: 'general', label: 'General', icon: SlidersHorizontal, Panel: GeneralSettingsPanel },
  { id: 'navigator', label: 'Navigator', icon: Compass, Panel: NavigatorSettingsPanel },
  { id: 'export', label: 'Export image', icon: ImageDown, Panel: ExportSettingsPanel },
  { id: 'appearance', label: 'Appearance', icon: SunMoon, Panel: AppearanceSettingsPanel }
]

export function SettingsDialog(): JSX.Element {
  const open = useUiStore((state) => state.isSettingsOpen)
  const close = useUiStore((state) => state.closeSettings)
  const [activeId, setActiveId] = useState<CategoryId>('general')
  const active = CATEGORIES.find((category) => category.id === activeId) ?? CATEGORIES[0]

  return (
    <Dialog open={open} onClose={close} size="lg">
      <Dialog.Header>
        <Dialog.Title>Settings</Dialog.Title>
      </Dialog.Header>
      <Dialog.Body>
        <div data-stella-component="settings-dialog" className={styles.layout}>
          <nav aria-label="Settings categories" className={styles.nav}>
            <ButtonIsland orientation="vertical" parentGrade="global">
              {CATEGORIES.map(({ id, label, icon: CategoryIcon }) => (
                <Button
                  key={id}
                  active={id === activeId}
                  aria-current={id === activeId ? 'page' : undefined}
                  leadingIcon={
                    <Icon size="sm">
                      <CategoryIcon />
                    </Icon>
                  }
                  onClick={() => setActiveId(id)}
                >
                  {label}
                </Button>
              ))}
            </ButtonIsland>
          </nav>
          <ScrollArea grow padding="4" className={styles.content}>
            <active.Panel />
          </ScrollArea>
        </div>
      </Dialog.Body>
    </Dialog>
  )
}

SettingsDialog.displayName = 'SettingsDialog'
