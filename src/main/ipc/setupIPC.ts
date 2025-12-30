import { ipcMain } from 'electron'
import type { WindowManager } from '../services/WindowManager'
import type { TerminalManager } from '../terminal/TerminalManager'
import type { LLMManager } from '../ai/LLMManager'
import type { PluginManager } from '../plugins/PluginManager'
import type { SSHManager } from '../ssh/SSHManager'
import type Store from 'electron-store'

interface Managers {
  windowManager: WindowManager
  terminalManager: TerminalManager
  llmManager: LLMManager
  pluginManager: PluginManager
  sshManager: SSHManager
  store: Store<Record<string, unknown>>
}

export function setupIPC(managers: Managers): void {
  const { windowManager, terminalManager, llmManager, pluginManager, sshManager, store } = managers

  ipcMain.on('terminal:create', async (event, { cwd, shell }: { cwd: string; shell: string }) => {
    // Treat empty strings as undefined to trigger default values in TerminalManager
    const session = terminalManager.createSession(cwd || undefined, shell || undefined)
    event.sender.send('terminal:create', session)
  })

  ipcMain.on('terminal:write', (_event, { sessionId, data }: { sessionId: string; data: string }) => {
    terminalManager.write(sessionId, data)
  })

  ipcMain.on('terminal:resize', (_event, { sessionId, cols, rows }: { sessionId: string; cols: number; rows: number }) => {
    terminalManager.resize(sessionId, cols, rows)
  })

  ipcMain.on('terminal:close', (_event, { sessionId }: { sessionId: string }) => {
    terminalManager.closeSession(sessionId)
  })

  ipcMain.on('terminal:list', (event) => {
    event.sender.send('terminal:list', terminalManager.getAllSessions())
  })

  ipcMain.on('llm:connect', async (event, { id, config }: { id: string; config: unknown }) => {
    try {
      const llmConfig = config as import('../../shared/types').LLMConfig
      llmManager.addConfig(id, llmConfig)
      const connected = await llmManager.checkConnection(id)
      event.sender.send('llm:connect', { success: true, connected })
    } catch (error) {
      event.sender.send('llm:connect', { success: false, error: (error as Error).message })
    }
  })

  ipcMain.on('llm:generate', async (event, { prompt, configId }: { prompt: string; configId?: string }) => {
    try {
      const response = await llmManager.generate(prompt, configId)
      event.sender.send('llm:generate', { success: true, response })
    } catch (error) {
      event.sender.send('llm:generate', { success: false, error: (error as Error).message })
    }
  })

  ipcMain.on('llm:chat', async (event, { messages, configId }: { messages: { role: string; content: string }[]; configId?: string }) => {
    const prompt = messages.map((m) => `${m.role}: ${m.content}`).join('\n')
    try {
      const response = await llmManager.generate(prompt, configId)
      event.sender.send('llm:chat', { success: true, response })
    } catch (error) {
      event.sender.send('llm:chat', { success: false, error: (error as Error).message })
    }
  })

  ipcMain.on('llm:status', async (event, { configId }: { configId?: string }) => {
    const connected = await llmManager.checkConnection(configId)
    event.sender.send('llm:status', { connected })
  })

  ipcMain.on('plugin:list', (event) => {
    event.sender.send('plugin:list', pluginManager.getAllPlugins())
  })

  ipcMain.on('plugin:load', async (event, { pluginPath }: { pluginPath: string }) => {
    try {
      const plugin = await pluginManager.loadPlugin(pluginPath)
      event.sender.send('plugin:load', { success: true, plugin })
    } catch (error) {
      event.sender.send('plugin:load', { success: false, error: (error as Error).message })
    }
  })

  ipcMain.on('plugin:unload', async (event, { pluginId }: { pluginId: string }) => {
    try {
      await pluginManager.unloadPlugin(pluginId)
      event.sender.send('plugin:unload', { success: true })
    } catch (error) {
      event.sender.send('plugin:unload', { success: false, error: (error as Error).message })
    }
  })

  ipcMain.on('plugin:enable', (event, { pluginId }: { pluginId: string }) => {
    pluginManager.enablePlugin(pluginId)
    event.sender.send('plugin:enable', { success: true })
  })

  ipcMain.on('plugin:disable', (event, { pluginId }: { pluginId: string }) => {
    pluginManager.disablePlugin(pluginId)
    event.sender.send('plugin:disable', { success: true })
  })

  ipcMain.on('ssh:connect', async (event, { config }: { config: unknown }) => {
    try {
      const sshConfig = config as import('../../shared/types').SSHConfig
      const session = await sshManager.connect(sshConfig)
      event.sender.send('ssh:connect', { success: true, session })
    } catch (error) {
      event.sender.send('ssh:connect', { success: false, error: (error as Error).message })
    }
  })

  ipcMain.on('ssh:disconnect', (event, { sessionId }: { sessionId: string }) => {
    sshManager.disconnect(sessionId)
    event.sender.send('ssh:disconnect', { success: true })
  })

  ipcMain.on('ssh:write', (_event, { sessionId, data }: { sessionId: string; data: string }) => {
    sshManager.write(sessionId, data)
  })

  ipcMain.on('ssh:resize', (_event, { sessionId, cols, rows }: { sessionId: string; cols: number; rows: number }) => {
    sshManager.resize(sessionId, cols, rows)
  })

  ipcMain.on('ssh:list', (event) => {
    event.sender.send('ssh:list', sshManager.getAllSessions())
  })

  ipcMain.on('settings:get', (event) => {
    event.sender.send('settings:get', (store as any).store)
  })

  ipcMain.on('settings:set', (event, { key, value }: { key: string; value: unknown }) => {
    (store as any).set(key, value)
    event.sender.send('settings:set', { success: true })
  })

  ipcMain.on('settings:reset', (event) => {
    (store as any).clear()
    event.sender.send('settings:reset', { success: true })
  })

  ipcMain.on('window:focus', (_event, { windowId }: { windowId: string }) => {
    windowManager.focusWindow(windowId)
  })

  ipcMain.on('window:minimize', (_event, { windowId }: { windowId: string }) => {
    windowManager.minimizeWindow(windowId)
  })

  ipcMain.on('window:maximize', (_event, { windowId }: { windowId: string }) => {
    windowManager.maximizeWindow(windowId)
  })

  ipcMain.on('window:close', (_event, { windowId }: { windowId: string }) => {
    windowManager.closeWindow(windowId)
  })
}
