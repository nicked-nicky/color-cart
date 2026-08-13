import { JSX, useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { ImageIcon, X } from 'lucide-react'
import { useUiStore } from '@renderer/store/uiStore'
import SettingsNavItem from '../molecules/SettingsNavItem'
import IconButton from '../atoms/IconButton'
import ExportSettingsCategory from './ExportSettingsCategory'

type SettingsCategory = 'export-image'

const CATEGORIES: Array<{ id: SettingsCategory; label: string; icon: JSX.Element }> = [
  { id: 'export-image', label: 'Export Image', icon: <ImageIcon size={16} /> }
]

function SettingsModal(): JSX.Element | null {
  const isOpen = useUiStore((state) => state.isSettingsOpen)
  const closeSettings = useUiStore((state) => state.closeSettings)
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('export-image')
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') closeSettings()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeSettings])

  useEffect(() => {
    if (!isOpen || !panelRef.current) return
    animate(panelRef.current, {
      scale: [0.96, 1],
      opacity: [0, 1],
      duration: 200,
      ease: 'outQuad'
    })
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={closeSettings}
    >
      <div
        ref={panelRef}
        onClick={(event) => event.stopPropagation()}
        className="relative flex h-[520px] max-h-[85vh] w-[760px] max-w-[92vw] overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
      >
        <IconButton
          ariaLabel="Close settings"
          onClick={closeSettings}
          icon={<X size={16} />}
          className="absolute right-3 top-3"
        />

        <nav className="flex w-48 shrink-0 flex-col gap-1 border-r border-border p-3">
          <span className="px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-wide text-ink-faint">
            Settings
          </span>
          {CATEGORIES.map((category) => (
            <SettingsNavItem
              key={category.id}
              icon={category.icon}
              label={category.label}
              active={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            />
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto p-5">
          {activeCategory === 'export-image' && <ExportSettingsCategory />}
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
