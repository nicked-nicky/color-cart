import { JSX, useEffect, useState } from 'react'
import { FolderOpen, Download, ClipboardCopy, Check, Palette, Settings, Sun, Moon } from 'lucide-react'
import { usePaletteStore } from '@renderer/store/paletteStore'
import { useImageStore } from '@renderer/store/imageStore'
import { useUiStore } from '@renderer/store/uiStore'
import { useExportSettingsStore } from '@renderer/store/exportSettingsStore'
import { useThemeStore } from '@renderer/store/themeStore'
import { renderPaletteCanvas, canvasToPngDataUrl, canvasToPngBlob } from '@renderer/lib/exportPalette'
import Island from '../atoms/Island'
import Button from '../atoms/Button'
import IconButton from '../atoms/IconButton'
import WindowControls from '../molecules/WindowControls'

function TitleBar(): JSX.Element {
  const [isMaximized, setIsMaximized] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const windowApi = window.api?.window

  const colors = usePaletteStore((state) => state.colors)
  const hasImage = useImageStore((state) => state.url !== null)
  const setImage = useImageStore((state) => state.setImage)
  const openSettings = useUiStore((state) => state.openSettings)
  const exportOptions = useExportSettingsStore((state) => state.options)
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const hasColors = colors.length > 0

  useEffect(() => {
    if (!windowApi) return
    void windowApi.isMaximized().then(setIsMaximized)
    const unsubscribe = windowApi.onMaximizeChange(setIsMaximized)
    return unsubscribe
  }, [windowApi])

  const handleOpenImage = async (): Promise<void> => {
    const image = await window.api?.openImage()
    if (image) setImage(image)
  }

  const handleExportImage = async (): Promise<void> => {
    if (!window.api || colors.length === 0) return
    const canvas = renderPaletteCanvas(colors, exportOptions)
    const dataUrl = canvasToPngDataUrl(canvas)
    const filePath = await window.api.savePaletteDialog('color-basket-palette.png')
    if (!filePath) return
    await window.api.writePaletteImage(filePath, dataUrl)
  }

  const handleCopyToClipboard = async (): Promise<void> => {
    if (colors.length === 0) return
    const canvas = renderPaletteCanvas(colors, exportOptions)
    const blob = await canvasToPngBlob(canvas)
    if (!blob) return
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    setCopyState('copied')
    window.setTimeout(() => setCopyState('idle'), 1200)
  }

  return (
    <header
      className="flex h-10 shrink-0 items-center justify-between gap-[10px] [-webkit-app-region:drag]"
      onDoubleClick={() => void windowApi?.toggleMaximize()}
    >
      <Island className="gap-2 border-border bg-surface px-3">
        <Palette size={16} className="text-ink" />
        <span className="text-xs font-medium text-ink-faint">color-basket</span>
      </Island>

      <div className="flex h-full items-center gap-[10px] [-webkit-app-region:no-drag]">
        {hasColors && (
          <Island className="gap-1 border-border bg-surface px-1.5">
            <Button
              variant="ghost"
              ariaLabel="Export palette as image"
              onClick={() => void handleExportImage()}
              icon={<Download size={14} />}
            >
              Export
            </Button>
            <Button
              variant="ghost"
              ariaLabel="Copy palette image to clipboard"
              onClick={() => void handleCopyToClipboard()}
              icon={
                copyState === 'copied' ? (
                  <Check size={14} className="text-emerald-400" />
                ) : (
                  <ClipboardCopy size={14} />
                )
              }
            >
              {copyState === 'copied' ? 'Copied' : 'Copy'}
            </Button>
          </Island>
        )}

        <Button
          variant="island"
          onClick={() => void handleOpenImage()}
          icon={<FolderOpen size={14} />}
          className="h-full"
        >
          {hasImage ? 'Choose another picture' : 'Choose a picture'}
        </Button>

        <Island className="gap-1 border-border bg-surface px-1">
          <IconButton
            ariaLabel={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={toggleTheme}
            icon={theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          />
          <IconButton ariaLabel="Settings" onClick={openSettings} icon={<Settings size={15} />} />
        </Island>

        <WindowControls
          isMaximized={isMaximized}
          onMinimize={() => void windowApi?.minimize()}
          onToggleMaximize={() => void windowApi?.toggleMaximize()}
          onClose={() => void windowApi?.close()}
        />
      </div>
    </header>
  )
}

export default TitleBar
