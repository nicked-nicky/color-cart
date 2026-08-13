import { JSX, useEffect, useState } from 'react'
import { Minus, Square, Copy, X, FolderOpen, Download, ClipboardCopy, Check } from 'lucide-react'
import { usePaletteStore } from '@renderer/store/paletteStore'
import { useImageStore } from '@renderer/store/imageStore'
import { renderPaletteCanvas, canvasToPngDataUrl, canvasToPngBlob } from '@renderer/lib/exportPalette'

const islandClass = 'flex h-full items-center rounded-full border border-neutral-700 bg-neutral-800'

function TitleBar(): JSX.Element {
  const [isMaximized, setIsMaximized] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const windowApi = window.api?.window

  const colors = usePaletteStore((state) => state.colors)
  const hasImage = useImageStore((state) => state.url !== null)
  const setImage = useImageStore((state) => state.setImage)
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
    const canvas = renderPaletteCanvas(colors)
    const dataUrl = canvasToPngDataUrl(canvas)
    const filePath = await window.api.savePaletteDialog('color-basket-palette.png')
    if (!filePath) return
    await window.api.writePaletteImage(filePath, dataUrl)
  }

  const handleCopyToClipboard = async (): Promise<void> => {
    if (colors.length === 0) return
    const canvas = renderPaletteCanvas(colors)
    const blob = await canvasToPngBlob(canvas)
    if (!blob) return
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    setCopyState('copied')
    window.setTimeout(() => setCopyState('idle'), 1200)
  }

  return (
    <header
      className="flex h-10 shrink-0 items-center justify-between gap-[5px] [-webkit-app-region:drag]"
      onDoubleClick={() => void windowApi?.toggleMaximize()}
    >
      <div className={`${islandClass} gap-2 px-3`}>
        <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-fuchsia-500 to-sky-500" />
        <span className="text-xs font-medium text-neutral-400">color-basket</span>
      </div>

      <div className="flex h-full items-center gap-[5px] [-webkit-app-region:no-drag]">
        {hasColors && (
          <div className={`${islandClass} gap-1 px-1.5`}>
            <button
              type="button"
              aria-label="Export palette as image"
              onClick={() => void handleExportImage()}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-neutral-100"
            >
              <Download size={14} />
              Export
            </button>
            <button
              type="button"
              aria-label="Copy palette image to clipboard"
              onClick={() => void handleCopyToClipboard()}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-neutral-100"
            >
              {copyState === 'copied' ? (
                <Check size={14} className="text-emerald-400" />
              ) : (
                <ClipboardCopy size={14} />
              )}
              {copyState === 'copied' ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => void handleOpenImage()}
          className={`${islandClass} gap-1.5 px-3 text-xs text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-neutral-100`}
        >
          <FolderOpen size={14} />
          {hasImage ? 'Choose another picture' : 'Choose a picture'}
        </button>

        <div className={`${islandClass} gap-1 px-1`}>
          <button
            type="button"
            aria-label="Minimize"
            onClick={() => void windowApi?.minimize()}
            className="flex h-7 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-neutral-100"
          >
            <Minus size={15} />
          </button>
          <button
            type="button"
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
            onClick={() => void windowApi?.toggleMaximize()}
            className="flex h-7 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-neutral-100"
          >
            {isMaximized ? <Copy size={13} /> : <Square size={13} />}
          </button>
          <button
            type="button"
            aria-label="Close"
            onClick={() => void windowApi?.close()}
            className="flex h-7 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-red-600 hover:text-neutral-100"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default TitleBar
