import { useEffect, useMemo, useState, type JSX } from 'react'
import { ClipboardCopy, Download, FolderOpen, Palette, Settings } from 'lucide-react'
import { Button, Icon, Tooltip, WindowChrome, useNotifications } from '@stella-componente/terra'
import { encodeCanvas, renderPaletteCanvas } from '@/lib/exportPalette'
import { errorMessage } from '@/lib/errorMessage'
import {
  copyImageToClipboard,
  createWindowControls,
  listenForMaximizeChange,
  pickImage,
  saveExport
} from '@/platform'
import { useExportSettingsStore } from '@/store/exportSettingsStore'
import { useImageStore } from '@/store/imageStore'
import { usePaletteStore } from '@/store/paletteStore'
import { useUiStore } from '@/store/uiStore'

const DEFAULT_EXPORT_NAME = 'color-cart-palette.png'

type BusyAction = 'export' | 'copy' | null

export function AppChrome(): JSX.Element {
  const colors = usePaletteStore((state) => state.colors)
  const hasImage = useImageStore((state) => state.url !== null)
  const setImage = useImageStore((state) => state.setImage)
  const exportOptions = useExportSettingsStore((state) => state.values)
  const openSettings = useUiStore((state) => state.openSettings)
  const notify = useNotifications()

  const controls = useMemo(createWindowControls, [])
  const [maximized, setMaximized] = useState(false)
  const [busy, setBusy] = useState<BusyAction>(null)
  const hasColors = colors.length > 0

  useEffect(() => {
    let unlisten: (() => void) | null = null
    let disposed = false
    void listenForMaximizeChange(setMaximized).then((stop) => {
      if (disposed) stop()
      else unlisten = stop
    })
    return () => {
      disposed = true
      unlisten?.()
    }
  }, [])

  const handleOpen = (): void => {
    pickImage().then(
      (image) => image && setImage(image),
      (error) => notify.error(errorMessage(error, "Couldn't open the image."))
    )
  }

  const handleExport = async (): Promise<void> => {
    setBusy('export')
    try {
      const saved = await saveExport(DEFAULT_EXPORT_NAME, (format) =>
        encodeCanvas(renderPaletteCanvas(colors, exportOptions, format), format)
      )
      if (saved) notify.success('Palette exported.')
    } catch (error) {
      notify.error(errorMessage(error, "Couldn't export the palette."))
    } finally {
      setBusy(null)
    }
  }

  const handleCopy = async (): Promise<void> => {
    setBusy('copy')
    try {
      const png = await encodeCanvas(renderPaletteCanvas(colors, exportOptions, 'png'), 'png')
      await copyImageToClipboard(png)
      notify.success('Palette image copied to the clipboard.')
    } catch (error) {
      notify.error(errorMessage(error, "Couldn't copy the palette image."))
    } finally {
      setBusy(null)
    }
  }

  return (
    <WindowChrome
      icon={<Palette />}
      title="Color Cart"
      windowControls={{ ...controls, maximized }}
      tools={
        <>
          <Button
            leadingIcon={
              <Icon size="sm">
                <FolderOpen />
              </Icon>
            }
            onClick={handleOpen}
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
            onClick={() => void handleExport()}
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
            onClick={() => void handleCopy()}
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
  )
}

AppChrome.displayName = 'AppChrome'
