import { app, shell, BrowserWindow, ipcMain, dialog, systemPreferences } from 'electron'
import { join, extname } from 'path'

const IMAGE_MIME_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp'
}

const isDev = !app.isPackaged
/** Settings keys are used to build a filename, so keep them to a safe charset. */
const SETTINGS_KEY_PATTERN = /^[a-z0-9-]+$/i

function settingsFilePath(key: string): string {
  return join(app.getPath('userData'), `${key}.json`)
}

function normalizeHexColor(raw: string | null | undefined): string | null {
  if (!raw) return null
  const hex = raw.replace('#', '').slice(0, 6)
  return hex.length === 6 ? `#${hex}` : null
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    show: false,
    frame: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('maximize', () => mainWindow.webContents.send('window:maximized', true))
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('window:maximized', false))

  mainWindow.webContents.setWindowOpenHandler((details) => {
    void shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    void mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerWindowControlHandlers(): void {
  ipcMain.handle('window:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.handle('window:toggleMaximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
  })

  ipcMain.handle('window:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  ipcMain.handle('window:isMaximized', (event) => {
    return BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false
  })
}

async function readImageFile(filePath: string): Promise<{ path: string; url: string } | null> {
  const ext = extname(filePath).slice(1).toLowerCase()
  if (!IMAGE_MIME_TYPES[ext]) return null

  // A file:// URL won't load as an <img src> when the renderer itself is
  // served from http://localhost (electron-vite dev server) — Chromium
  // blocks cross-protocol resource loads. A data URL works in both dev
  // (http origin) and the packaged app (file origin), so read + inline it.
  const { readFile } = await import('fs/promises')
  const buffer = await readFile(filePath)
  return { path: filePath, url: `data:${IMAGE_MIME_TYPES[ext]};base64,${buffer.toString('base64')}` }
}

function registerIpcHandlers(): void {
  registerWindowControlHandlers()

  ipcMain.handle('dialog:openImage', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Open reference image',
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }]
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return readImageFile(result.filePaths[0])
  })

  ipcMain.handle('fs:readImageFile', async (_event, filePath: string) => {
    if (typeof filePath !== 'string' || !filePath.trim()) return null
    try {
      return await readImageFile(filePath)
    } catch {
      return null
    }
  })

  ipcMain.handle('dialog:savePalette', async (_event, defaultName: string) => {
    const result = await dialog.showSaveDialog({
      title: 'Export palette',
      defaultPath: defaultName,
      filters: [
        { name: 'PNG Image', extensions: ['png'] },
        { name: 'JPEG Image', extensions: ['jpg'] },
        { name: 'WebP Image', extensions: ['webp'] }
      ]
    })
    if (result.canceled || !result.filePath) return null
    return result.filePath
  })

  ipcMain.handle('fs:writePaletteImage', async (_event, filePath: string, dataUrl: string) => {
    const { writeFile } = await import('fs/promises')
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '')
    await writeFile(filePath, Buffer.from(base64, 'base64'))
    return true
  })

  ipcMain.handle('settings:load', async (_event, key: string) => {
    if (typeof key !== 'string' || !SETTINGS_KEY_PATTERN.test(key)) return null
    try {
      const { readFile } = await import('fs/promises')
      const raw = await readFile(settingsFilePath(key), 'utf-8')
      return JSON.parse(raw)
    } catch {
      // No saved settings yet, or the file is unreadable/corrupt — the
      // renderer falls back to defaults either way.
      return null
    }
  })

  ipcMain.handle('settings:save', async (_event, key: string, data: unknown) => {
    if (typeof key !== 'string' || !SETTINGS_KEY_PATTERN.test(key)) return false
    try {
      const { writeFile } = await import('fs/promises')
      await writeFile(settingsFilePath(key), JSON.stringify(data, null, 2), 'utf-8')
      return true
    } catch {
      return false
    }
  })

  ipcMain.handle('system:getAccentColor', () => {
    // getAccentColor() is Windows-only; getColor() with this key is the
    // closest macOS equivalent. Neither is guaranteed available, so this
    // degrades to null (the renderer falls back to a manual color) rather
    // than throwing.
    try {
      const color = normalizeHexColor(systemPreferences.getAccentColor())
      if (color) return color
    } catch {
      // not supported on this platform
    }
    try {
      return normalizeHexColor(systemPreferences.getColor('selected-content-background'))
    } catch {
      return null
    }
  })
}

void app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
