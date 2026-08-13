import { contextBridge, ipcRenderer, webUtils } from 'electron'

interface OpenedImage {
  path: string
  url: string
}

const api = {
  openImage: (): Promise<OpenedImage | null> => ipcRenderer.invoke('dialog:openImage'),
  readImageFile: (filePath: string): Promise<OpenedImage | null> =>
    ipcRenderer.invoke('fs:readImageFile', filePath),
  getPathForFile: (file: File): string => webUtils.getPathForFile(file),
  savePaletteDialog: (defaultName: string): Promise<string | null> =>
    ipcRenderer.invoke('dialog:savePalette', defaultName),
  writePaletteImage: (filePath: string, dataUrl: string): Promise<boolean> =>
    ipcRenderer.invoke('fs:writePaletteImage', filePath, dataUrl),
  window: {
    minimize: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
    toggleMaximize: (): Promise<void> => ipcRenderer.invoke('window:toggleMaximize'),
    close: (): Promise<void> => ipcRenderer.invoke('window:close'),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:isMaximized'),
    onMaximizeChange: (callback: (isMaximized: boolean) => void): (() => void) => {
      const listener = (_event: Electron.IpcRendererEvent, isMaximized: boolean): void =>
        callback(isMaximized)
      ipcRenderer.on('window:maximized', listener)
      return () => ipcRenderer.removeListener('window:maximized', listener)
    }
  }
}

export type ColorBasketApi = typeof api

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // Fallback only relevant if contextIsolation is ever disabled; not used in this app.
  ;(globalThis as unknown as { api: ColorBasketApi }).api = api
}
