declare global {
  interface Window {
    electronAPI: {
      terminal: {
        create: (cwd: string, shell: string) => Promise<any>
        write: (sessionId: string, data: string) => void
        resize: (sessionId: string, cols: number, rows: number) => void
        close: (sessionId: string) => void
        list: () => Promise<any[]>
        onOutput: (callback: (data: { sessionId: string; data: string }) => void) => void
        onClose: (callback: (data: { sessionId: string; exitCode?: number; signal?: string }) => void) => void
      }
      llm: {
        connect: (id: string, config: any) => Promise<any>
        generate: (prompt: string, configId?: string) => Promise<any>
        chat: (messages: { role: string; content: string }[], configId?: string) => Promise<any>
        status: (configId?: string) => Promise<any>
      }
      plugin: {
        list: () => Promise<any[]>
        load: (pluginPath: string) => Promise<any>
        unload: (pluginId: string) => Promise<any>
        enable: (pluginId: string) => Promise<any>
        disable: (pluginId: string) => Promise<any>
      }
      ssh: {
        connect: (config: any) => Promise<any>
        disconnect: (sessionId: string) => void
        write: (sessionId: string, data: string) => void
        resize: (sessionId: string, cols: number, rows: number) => void
        list: () => Promise<any[]>
      }
      settings: {
        get: () => Promise<any>
        set: (key: string, value: unknown) => Promise<void>
        reset: () => Promise<void>
      }
      window: {
        focus: (windowId: string) => void
        minimize: (windowId: string) => void
        maximize: (windowId: string) => void
        close: (windowId: string) => void
      }
    }
  }

  const process: any
  const Buffer: any
  const __dirname: string
}

export {}
