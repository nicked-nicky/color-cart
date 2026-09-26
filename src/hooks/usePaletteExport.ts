import { useState } from 'react'
import { useNotifications } from '@stella-componente/terra'
import { encodeCanvas, renderPaletteCanvas } from '@/lib/exportPalette'
import { errorMessage } from '@/lib/errorMessage'
import { copyImageToClipboard, saveExport } from '@/platform'
import { useExportSettingsStore } from '@/store/exportSettingsStore'
import { usePaletteStore } from '@/store/paletteStore'

const DEFAULT_EXPORT_NAME = 'color-cart-palette.png'

export type PaletteExportAction = 'export' | 'copy'

interface PaletteExport {
  /** The action currently running, if any. */
  busy: PaletteExportAction | null
  exportPalette: () => void
  copyPalette: () => void
}

export function usePaletteExport(): PaletteExport {
  const colors = usePaletteStore((state) => state.colors)
  const exportOptions = useExportSettingsStore((state) => state.values)
  const notify = useNotifications()
  const [busy, setBusy] = useState<PaletteExportAction | null>(null)

  const run = async (
    action: PaletteExportAction,
    task: () => Promise<string | null>,
    failure: string
  ): Promise<void> => {
    setBusy(action)
    try {
      const success = await task()
      if (success) notify.success(success)
    } catch (error) {
      notify.error(errorMessage(error, failure))
    } finally {
      setBusy(null)
    }
  }

  const exportPalette = (): void =>
    void run(
      'export',
      async () => {
        const saved = await saveExport(DEFAULT_EXPORT_NAME, (format) =>
          encodeCanvas(renderPaletteCanvas(colors, exportOptions, format), format)
        )
        return saved ? 'Palette exported.' : null
      },
      "Couldn't export the palette."
    )

  const copyPalette = (): void =>
    void run(
      'copy',
      async () => {
        const png = await encodeCanvas(renderPaletteCanvas(colors, exportOptions, 'png'), 'png')
        await copyImageToClipboard(png)
        return 'Palette image copied to the clipboard.'
      },
      "Couldn't copy the palette image."
    )

  return { busy, exportPalette, copyPalette }
}
