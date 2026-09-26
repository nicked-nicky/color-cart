import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  NotificationProvider,
  OverlayProvider,
  ThemeProvider,
  type ThemeConfig
} from '@stella-componente/terra'
import '@stella-componente/terra/styles/tokens.css'
import './app.css'
import App from './App'
import { loadSetting, saveSetting } from './platform'

const THEME_SETTINGS_KEY = 'theme'

async function bootstrap(): Promise<void> {
  const savedTheme = await loadSetting<Partial<ThemeConfig>>(THEME_SETTINGS_KEY).catch(() => undefined)

  createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <ThemeProvider
        defaultConfig={{ colorScheme: 'dark', ...savedTheme }}
        onChange={(config) => void saveSetting(THEME_SETTINGS_KEY, config).catch(() => undefined)}
      >
        <OverlayProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </OverlayProvider>
      </ThemeProvider>
    </StrictMode>
  )
}

void bootstrap()
