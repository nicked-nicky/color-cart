import { contextBridge, ipcRenderer } from 'electron'

const api = {
  openImage: (): Promise<string | null> => ipcRenderer.invoke('dialog:openImage'),
  savePaletteDialog: (defaultName: string): Promise<string | null> =>
    ipcRenderer.invoke('dialog:savePalette', defaultName),
  writePaletteImage: (filePath: string, dataUrl: string): Promise<boolean> =>
    ipcRenderer.invoke('fs:writePaletteImage', filePath, dataUrl)
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
  ;(window as unknown as { api: ColorBasketApi }).api = api
}
