import { useRef, type JSX } from 'react'
import { ClipboardCopy, Download, FolderOpen, Palette, Settings } from 'lucide-react'
import { Button, Icon, Tooltip, WindowChrome } from '@stella-componente/terra'
import { useOpenImage } from '@/hooks/useOpenImage'
import { usePaletteExport } from '@/hooks/usePaletteExport'
import { useWindowControls } from '@/hooks/useWindowControls'
import { useWindowDragRegion } from '@/hooks/useWindowDragRegion'
import { useImageStore } from '@/store/imageStore'
import { usePaletteStore } from '@/store/paletteStore'
import { useUiStore } from '@/store/uiStore'
import styles from './AppChrome.module.css'

export function AppChrome(): JSX.Element {
  const hasColors = usePaletteStore((state) => state.colors.length > 0)
  const hasImage = useImageStore((state) => state.url !== null)
  const openSettings = useUiStore((state) => state.openSettings)
  const openImage = useOpenImage()
  const { busy, exportPalette, copyPalette } = usePaletteExport()
  const windowControls = useWindowControls()

  // WindowChrome doesn't forward refs, so reach its header through a
  // layout-neutral wrapper.
  const chromeRef = useRef<HTMLDivElement>(null)
  useWindowDragRegion(chromeRef)

  return (
    <div ref={chromeRef} className={styles.wrapper}>
      <WindowChrome
        className={styles.chrome}
        icon={<Palette />}
        title="Color Cart"
        windowControls={windowControls}
        tools={
          <>
            <Button
              leadingIcon={
                <Icon size="sm">
                  <FolderOpen />
                </Icon>
              }
              onClick={openImage}
            >
              {hasImage ? 'Choose another picture' : 'Choose a picture'}
            </Button>
            <Button
              leadingIcon={
                <Icon size="sm">
                  <Download />
                </Icon>
              }
              disabled={!hasColors || busy !== null}
              loading={busy === 'export'}
              onClick={exportPalette}
            >
              Export
            </Button>
            <Button
              leadingIcon={
                <Icon size="sm">
                  <ClipboardCopy />
                </Icon>
              }
              disabled={!hasColors || busy !== null}
              loading={busy === 'copy'}
              onClick={copyPalette}
            >
              Copy image
            </Button>
          </>
        }
        systemTools={
          <Tooltip label="Settings">
            <Button iconOnly aria-label="Settings" onClick={openSettings}>
              <Settings />
            </Button>
          </Tooltip>
        }
      />
    </div>
  )
}

AppChrome.displayName = 'AppChrome'
