import { autoUpdater } from 'electron-updater'
import { BrowserWindow, ipcMain } from 'electron'
import { logger } from './Logger'

export class UpdateManager {
  constructor() {
    this.init()
  }

  private init(): void {
    autoUpdater.logger = logger
    autoUpdater.autoDownload = false

    autoUpdater.on('checking-for-update', () => {
      logger.info('Checking for update...')
      this.sendToRenderer('update:checking')
    })

    autoUpdater.on('update-available', (info) => {
      logger.info('Update available', { version: info.version })
      this.sendToRenderer('update:available', info)
    })

    autoUpdater.on('update-not-available', (info) => {
      logger.info('Update not available', { version: info.version })
      this.sendToRenderer('update:not-available', info)
    })

    autoUpdater.on('error', (err) => {
      logger.error('Error in auto-updater', err)
      this.sendToRenderer('update:error', err.message)
    })

    autoUpdater.on('download-progress', (progressObj) => {
      let log_message = 'Download speed: ' + progressObj.bytesPerSecond
      log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
      log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
      logger.debug(log_message)
      this.sendToRenderer('update:progress', progressObj)
    })

    autoUpdater.on('update-downloaded', (info) => {
      logger.info('Update downloaded', { version: info.version })
      this.sendToRenderer('update:downloaded', info)
    })

    // IPC handlers
    ipcMain.handle('update:check', () => {
      autoUpdater.checkForUpdates()
    })

    ipcMain.handle('update:download', () => {
      autoUpdater.downloadUpdate()
    })

    ipcMain.handle('update:install', () => {
      autoUpdater.quitAndInstall()
    })
  }

  private sendToRenderer(channel: string, ...args: any[]): void {
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send(channel, ...args)
    })
  }

  checkForUpdates(): void {
    autoUpdater.checkForUpdatesAndNotify()
  }
}
