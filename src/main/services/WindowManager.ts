import { BrowserWindow, screen } from 'electron'
import path from 'path'

export class WindowManager {
  private windows: Map<string, BrowserWindow> = new Map()

  createMainWindow(): BrowserWindow {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize

    const mainWindow = new BrowserWindow({
      width,
      height,
      backgroundColor: '#0a0a0a',
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true
      },
      title: 'Handsome Terminal',
      titleBarStyle: typeof process !== 'undefined' && process.platform === 'darwin' ? 'hiddenInset' : 'default',
      frame: true,
      transparent: false
    })

    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      mainWindow.loadURL('http://localhost:5173')
      mainWindow.webContents.openDevTools()
    } else {
      mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
    }

    mainWindow.once('ready-to-show', () => {
      mainWindow.show()
    })

    mainWindow.on('closed', () => {
      this.windows.delete('main')
    })

    this.windows.set('main', mainWindow)
    return mainWindow
  }

  getWindow(id: string): BrowserWindow | undefined {
    return this.windows.get(id)
  }

  getAllWindows(): BrowserWindow[] {
    return Array.from(this.windows.values())
  }

  closeWindow(id: string): void {
    const window = this.windows.get(id)
    if (window && !window.isDestroyed()) {
      window.close()
    }
  }

  focusWindow(id: string): void {
    const window = this.windows.get(id)
    if (window && !window.isDestroyed()) {
      if (window.isMinimized()) {
        window.restore()
      }
      window.focus()
    }
  }

  minimizeWindow(id: string): void {
    const window = this.windows.get(id)
    if (window && !window.isDestroyed()) {
      window.minimize()
    }
  }

  maximizeWindow(id: string): void {
    const window = this.windows.get(id)
    if (window && !window.isDestroyed()) {
      if (window.isMaximized()) {
        window.unmaximize()
      } else {
        window.maximize()
      }
    }
  }
}
