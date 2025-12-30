import { app, BrowserWindow } from 'electron'
import { WindowManager } from './services/WindowManager'
import { TerminalManager } from './terminal/TerminalManager'
import { LLMManager } from './ai/LLMManager'
import { PluginManager } from './plugins/PluginManager'
import { SSHManager } from './ssh/SSHManager'
import { UpdateManager } from './services/UpdateManager'
import { setupIPC } from './ipc/setupIPC'
import Store from 'electron-store'

const store = new Store()

let windowManager: WindowManager
let terminalManager: TerminalManager
let llmManager: LLMManager
let pluginManager: PluginManager
let sshManager: SSHManager
let updateManager: UpdateManager

app.whenReady().then(() => {
  windowManager = new WindowManager()
  terminalManager = new TerminalManager()
  llmManager = new LLMManager()
  pluginManager = new PluginManager()
  sshManager = new SSHManager()
  updateManager = new UpdateManager()

  setupIPC({
    windowManager,
    terminalManager,
    llmManager,
    pluginManager,
    sshManager,
    store
  })

  windowManager.createMainWindow()
  
  if (app.isPackaged) {
    updateManager.checkForUpdates()
  }
})

app.on('window-all-closed', () => {
  if (typeof process !== 'undefined' && process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    windowManager.createMainWindow()
  }
})
