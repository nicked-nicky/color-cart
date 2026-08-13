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
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
        active
          ? 'bg-neutral-700 text-neutral-100'
          : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

export default SettingsNavItem
