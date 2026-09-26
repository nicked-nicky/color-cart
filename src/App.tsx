import type { JSX } from 'react'
import { FlexContainer } from '@stella-componente/terra'
import { useDesktopImageDrops } from '@/hooks/useDesktopImageDrops'
import { AppChrome } from '@/components/organisms/AppChrome'
import { ImageViewport } from '@/components/organisms/ImageViewport'
import { PaletteBasket } from '@/components/organisms/PaletteBasket'
import { SettingsDialog } from '@/components/organisms/SettingsDialog'
import styles from './App.module.css'

function App(): JSX.Element {
  const dropHover = useDesktopImageDrops()

  return (
    <FlexContainer direction="column" gap="2" data-stella-grade="global" className={styles.app}>
      <AppChrome />
      <FlexContainer as="main" gap="2" grow className={styles.workspace}>
        <ImageViewport dropHover={dropHover} />
        <PaletteBasket />
      </FlexContainer>
      <SettingsDialog />
    </FlexContainer>
  )
}

export default App
