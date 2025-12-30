import { ipcRenderer } from 'electron'
import { IPC_EVENTS } from '../shared/constants'
import type { LLMConfig, SSHConfig } from '../shared/types'

const electronAPI = {
  terminal: {
    create: (cwd: string, shell: string) => ipcRenderer.invoke(IPC_EVENTS.TERMINAL.CREATE, { cwd, shell }),
    write: (sessionId: string, data: string) => ipcRenderer.send(IPC_EVENTS.TERMINAL.WRITE, { sessionId, data }),
    resize: (sessionId: string, cols: number, rows: number) => ipcRenderer.send(IPC_EVENTS.TERMINAL.RESIZE, { sessionId, cols, rows }),
    close: (sessionId: string) => ipcRenderer.send(IPC_EVENTS.TERMINAL.CLOSE, { sessionId }),
    list: () => ipcRenderer.invoke(IPC_EVENTS.TERMINAL.LIST),
    onOutput: (callback: (data: { sessionId: string; data: string }) => void) => {
      ipcRenderer.on(IPC_EVENTS.TERMINAL.OUTPUT, (_event: Electron.IpcRendererEvent, data: { sessionId: string; data: string }) => callback(data))
    },
    onClose: (callback: (data: { sessionId: string; exitCode?: number; signal?: string }) => void) => {
      ipcRenderer.on(IPC_EVENTS.TERMINAL.CLOSE, (_event: Electron.IpcRendererEvent, data: { sessionId: string; exitCode?: number; signal?: string }) => callback(data))
    }
  },
  llm: {
    connect: (id: string, config: LLMConfig) => ipcRenderer.invoke(IPC_EVENTS.LLM.CONNECT, { id, config }),
    generate: (prompt: string, configId?: string) => ipcRenderer.invoke(IPC_EVENTS.LLM.GENERATE, { prompt, configId }),
    chat: (messages: { role: string; content: string }[], configId?: string) => ipcRenderer.invoke(IPC_EVENTS.LLM.CHAT, { messages, configId }),
    status: (configId?: string) => ipcRenderer.invoke(IPC_EVENTS.LLM.STATUS, { configId })
  },
  plugin: {
    list: () => ipcRenderer.invoke(IPC_EVENTS.PLUGIN.LIST),
    load: (pluginPath: string) => ipcRenderer.invoke(IPC_EVENTS.PLUGIN.LOAD, { pluginPath }),
    unload: (pluginId: string) => ipcRenderer.invoke(IPC_EVENTS.PLUGIN.UNLOAD, { pluginId }),
    enable: (pluginId: string) => ipcRenderer.invoke(IPC_EVENTS.PLUGIN.ENABLE, { pluginId }),
    disable: (pluginId: string) => ipcRenderer.invoke(IPC_EVENTS.PLUGIN.DISABLE, { pluginId })
  },
  ssh: {
    connect: (config: SSHConfig) => ipcRenderer.invoke(IPC_EVENTS.SSH.CONNECT, { config }),
    disconnect: (sessionId: string) => ipcRenderer.send(IPC_EVENTS.SSH.DISCONNECT, { sessionId }),
    write: (sessionId: string, data: string) => ipcRenderer.send(IPC_EVENTS.SSH.WRITE, { sessionId, data }),
    resize: (sessionId: string, cols: number, rows: number) => ipcRenderer.send(IPC_EVENTS.SSH.RESIZE, { sessionId, cols, rows }),
    list: () => ipcRenderer.invoke(IPC_EVENTS.SSH.LIST)
  },
  settings: {
    get: () => ipcRenderer.invoke(IPC_EVENTS.SETTINGS.GET),
    set: (key: string, value: unknown) => ipcRenderer.invoke(IPC_EVENTS.SETTINGS.SET, { key, value }),
    reset: () => ipcRenderer.invoke(IPC_EVENTS.SETTINGS.RESET)
  },
  window: {
    focus: (windowId: string) => ipcRenderer.send(IPC_EVENTS.WINDOW.FOCUS, { windowId }),
    minimize: (windowId: string) => ipcRenderer.send(IPC_EVENTS.WINDOW.MINIMIZE, { windowId }),
    maximize: (windowId: string) => ipcRenderer.send(IPC_EVENTS.WINDOW.MAXIMIZE, { windowId }),
    close: (windowId: string) => ipcRenderer.send(IPC_EVENTS.WINDOW.CLOSE, { windowId })
  }
}

export type ElectronAPI = typeof electronAPI

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

if (typeof window !== 'undefined') {
  window.electronAPI = electronAPI
}
