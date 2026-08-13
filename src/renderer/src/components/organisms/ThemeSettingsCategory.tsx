import { JSX } from 'react'
import { RefreshCw } from 'lucide-react'
import { useThemeStore, type AccentMode, type Theme } from '@renderer/store/themeStore'
import SegmentedControl from '../atoms/SegmentedControl'
import Button from '../atoms/Button'

function ThemeSettingsCategory(): JSX.Element {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const accentMode = useThemeStore((state) => state.accentMode)
  const setAccentMode = useThemeStore((state) => state.setAccentMode)
  const customAccentColor = useThemeStore((state) => state.customAccentColor)
  const setCustomAccentColor = useThemeStore((state) => state.setCustomAccentColor)
  const systemAccentColor = useThemeStore((state) => state.systemAccentColor)
  const refreshSystemAccentColor = useThemeStore((state) => state.refreshSystemAccentColor)

  return (
    <div className="flex-1 overflow-y-auto pr-1">
      <h3 className="mb-1 text-sm font-medium text-ink">Theme</h3>
      <p className="mb-4 text-xs text-ink-faint">Appearance and accent color for the whole app.</p>

      <div className="mb-1 text-xs font-medium text-ink-faint">Appearance</div>
      <SegmentedControl<Theme>
        options={[
          { label: 'Dark', value: 'dark' },
          { label: 'Light', value: 'light' }
        ]}
        value={theme}
        onChange={(next) => {
          if (next !== theme) toggleTheme()
        }}
      />

      <div className="mb-1 mt-4 text-xs font-medium text-ink-faint">Accent color</div>
      <SegmentedControl<AccentMode>
        options={[
          { label: 'Custom', value: 'custom' },
          { label: 'Follow system', value: 'system' }
        ]}
        value={accentMode}
        onChange={setAccentMode}
      />

      <div className="mt-3 flex items-center gap-3">
        {accentMode === 'custom' ? (
          <>
            <input
              type="color"
              aria-label="Custom accent color"
              value={customAccentColor}
              onChange={(event) => setCustomAccentColor(event.target.value)}
              className="h-9 w-9 rounded-full border border-border shadow-inner transition-transform hover:scale-105"
            />
            <span className="text-xs text-ink-faint">{customAccentColor}</span>
          </>
        ) : (
          <>
            <div
              className="h-9 w-9 rounded-full border border-border shadow-inner"
              style={{ backgroundColor: systemAccentColor ?? 'transparent' }}
            />
            <div className="flex flex-col items-start gap-1.5">
              <span className="text-xs text-ink-faint">
                {systemAccentColor ?? "Couldn't detect a system accent color — using your custom color instead."}
              </span>
              <Button
                variant="outline"
                onClick={() => void refreshSystemAccentColor()}
                icon={<RefreshCw size={12} />}
                className="py-1 text-[11px]"
              >
                Refresh
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ThemeSettingsCategory
