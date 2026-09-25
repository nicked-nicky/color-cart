import { invoke, isTauri } from '@tauri-apps/api/core'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import { getCurrentWebview } from '@tauri-apps/api/webview'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { LazyStore } from '@tauri-apps/plugin-store'
import { writeImage, writeText } from '@tauri-apps/plugin-clipboard-manager'
import type { WindowControlsHandlers } from '@stella-componente/terra'
import { exportFormatFromName, type ExportFormat } from '@/lib/exportPalette'

export interface LoadedImage {
  path: string | null
  url: string
}

const IMAGE_MIME_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp'
}

const IMAGE_ACCEPT = Object.values(IMAGE_MIME_TYPES).join(',')

export const isDesktop = isTauri()

function mimeTypeFor(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase() ?? ''
  return IMAGE_MIME_TYPES[extension] ?? 'application/octet-stream'
}

async function loadImageFromPath(path: string): Promise<LoadedImage> {
  const buffer = await invoke<ArrayBuffer>('read_image', { path })
  const url = URL.createObjectURL(new Blob([buffer], { type: mimeTypeFor(path) }))
  return { path, url }
}

export function imageFromFile(file: File): LoadedImage | null {
  if (!Object.values(IMAGE_MIME_TYPES).includes(file.type)) return null
  return { path: null, url: URL.createObjectURL(file) }
}

function pickImageInBrowser(): Promise<LoadedImage | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = IMAGE_ACCEPT
    input.addEventListener('change', () => {
      const file = input.files?.[0]
      resolve(file ? imageFromFile(file) : null)
    })
    input.addEventListener('cancel', () => resolve(null))
    input.click()
  })
}

export async function pickImage(): Promise<LoadedImage | null> {
  if (!isDesktop) return pickImageInBrowser()
  const path = await invoke<string | null>('pick_image')
  return path ? loadImageFromPath(path) : null
}

interface DropHandlers {
  onHover: (hovering: boolean) => void
  onImage: (image: LoadedImage) => void
  onRejected: (fileName: string) => void
  onError: (error: unknown) => void
}

export async function listenForImageDrops(handlers: DropHandlers): Promise<UnlistenFn> {
  if (!isDesktop) return () => undefined
  const unlisteners = await Promise.all([
    getCurrentWebview().onDragDropEvent(({ payload }) => {
      handlers.onHover(payload.type === 'enter' || payload.type === 'over')
    }),
    listen<string>('image-dropped', ({ payload }) => {
      loadImageFromPath(payload).then(handlers.onImage, handlers.onError)
    }),
    listen<string>('image-drop-rejected', ({ payload }) => handlers.onRejected(payload))
  ])
  return () => unlisteners.forEach((unlisten) => unlisten())
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function saveExport(
  defaultName: string,
  encode: (format: ExportFormat) => Promise<Blob>
): Promise<boolean> {
  if (!isDesktop) {
    downloadBlob(await encode('png'), defaultName)
    return true
  }
  const path = await invoke<string | null>('pick_export_path', { defaultName })
  if (!path) return false
  const blob = await encode(exportFormatFromName(path))
  await invoke('write_export', new Uint8Array(await blob.arrayBuffer()))
  return true
}

export async function copyTextToClipboard(text: string): Promise<void> {
  if (isDesktop) {
    await writeText(text)
    return
  }
  await navigator.clipboard.writeText(text)
}

export async function copyImageToClipboard(png: Blob): Promise<void> {
  if (isDesktop) {
    await writeImage(new Uint8Array(await png.arrayBuffer()))
    return
  }
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })])
}

export function createWindowControls(): WindowControlsHandlers {
  if (!isDesktop) return {}
  const appWindow = getCurrentWindow()
  return {
    minimize: () => void appWindow.minimize(),
    maximize: () => void appWindow.toggleMaximize(),
    close: () => void appWindow.close()
  }
}

export async function listenForMaximizeChange(
  onChange: (maximized: boolean) => void
): Promise<UnlistenFn> {
  if (!isDesktop) return () => undefined
  const appWindow = getCurrentWindow()
  onChange(await appWindow.isMaximized())
  return appWindow.onResized(async () => onChange(await appWindow.isMaximized()))
}

const settingsFile = isDesktop ? new LazyStore('settings.json', { autoSave: 300 }) : null
const BROWSER_SETTINGS_PREFIX = 'color-cart:'

export async function loadSetting<T>(key: string): Promise<T | undefined> {
  if (settingsFile) return settingsFile.get<T>(key)
  try {
    const raw = localStorage.getItem(BROWSER_SETTINGS_PREFIX + key)
    return raw === null ? undefined : (JSON.parse(raw) as T)
  } catch {
    return undefined
  }
}

export async function saveSetting(key: string, value: unknown): Promise<void> {
  if (settingsFile) {
    await settingsFile.set(key, value)
    return
  }
  try {
    localStorage.setItem(BROWSER_SETTINGS_PREFIX + key, JSON.stringify(value))
  } catch {
    return
  }
}
