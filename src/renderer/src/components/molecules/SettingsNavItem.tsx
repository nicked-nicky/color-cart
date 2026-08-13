import { JSX, type ReactNode } from 'react'

interface SettingsNavItemProps {
  icon: ReactNode
  label: string
  active: boolean
  onClick: () => void
}

function SettingsNavItem({ icon, label, active, onClick }: SettingsNavItemProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-full px-3 py-2 text-left text-sm transition-colors ${
        active ? 'bg-surface-hover text-ink' : 'text-ink-faint hover:bg-surface-hover hover:text-ink-muted'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

export default SettingsNavItem
