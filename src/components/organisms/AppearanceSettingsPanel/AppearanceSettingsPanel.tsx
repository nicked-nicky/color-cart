import type { JSX } from 'react'
import {
  DEFAULT_THEME_CONFIG,
  appearanceSettingsCategory,
  applyAppearanceChange,
  getAppearanceValues,
  useTheme,
  type AppearanceSettingsValues
} from '@stella-componente/terra'
import { ChoiceIsland } from '@/components/molecules/ChoiceIsland'
import { SettingRow } from '@/components/molecules/SettingRow'
import { SettingsGroup } from '@/components/molecules/SettingsGroup'
import { SettingsPage } from '@/components/organisms/SettingsPage'

export function AppearanceSettingsPanel(): JSX.Element {
  const theme = useTheme()
  const values = getAppearanceValues(theme.config)

  return (
    <SettingsPage
      title="Appearance"
      description="Changes apply instantly across the whole app."
      onReset={() => theme.loadConfig(DEFAULT_THEME_CONFIG)}
    >
      <SettingsGroup>
        {appearanceSettingsCategory.fields.map((field) =>
          field.type === 'choice' ? (
            <SettingRow key={field.key} label={field.label} description={field.description}>
              {(labelId) => (
                <ChoiceIsland
                  aria-labelledby={labelId}
                  options={field.options}
                  value={String(values[field.key as keyof AppearanceSettingsValues])}
                  onValueChange={(value) => applyAppearanceChange(theme, field.key, value)}
                  parentGrade="default"
                />
              )}
            </SettingRow>
          ) : null
        )}
      </SettingsGroup>
    </SettingsPage>
  )
}

AppearanceSettingsPanel.displayName = 'AppearanceSettingsPanel'
