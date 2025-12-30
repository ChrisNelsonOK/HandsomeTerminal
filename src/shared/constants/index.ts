import type { TerminalTheme } from '../types'

export const IPC_EVENTS = {
  TERMINAL: {
    CREATE: 'terminal:create',
    WRITE: 'terminal:write',
    RESIZE: 'terminal:resize',
    CLOSE: 'terminal:close',
    LIST: 'terminal:list',
    OUTPUT: 'terminal:output',
    ERROR: 'terminal:error'
  },
  LLM: {
    CONNECT: 'llm:connect',
    GENERATE: 'llm:generate',
    CHAT: 'llm:chat',
    STREAM: 'llm:stream',
    SUGGEST: 'llm:suggest',
    STATUS: 'llm:status'
  },
  PLUGIN: {
    LOAD: 'plugin:load',
    UNLOAD: 'plugin:unload',
    LIST: 'plugin:list',
    INSTALL: 'plugin:install',
    UNINSTALL: 'plugin:uninstall',
    SEARCH: 'plugin:search',
    ENABLE: 'plugin:enable',
    DISABLE: 'plugin:disable'
  },
  SSH: {
    CONNECT: 'ssh:connect',
    DISCONNECT: 'ssh:disconnect',
    WRITE: 'ssh:write',
    RESIZE: 'ssh:resize',
    LIST: 'ssh:list',
    SAVE: 'ssh:save',
    DELETE: 'ssh:delete'
  },
  THEME: {
    SET: 'theme:set',
    GET: 'theme:get',
    LIST: 'theme:list'
  },
  SETTINGS: {
    GET: 'settings:get',
    SET: 'settings:set',
    RESET: 'settings:reset'
  },
  WINDOW: {
    FOCUS: 'window:focus',
    MINIMIZE: 'window:minimize',
    MAXIMIZE: 'window:maximize',
    CLOSE: 'window:close'
  }
} as const

export const DEFAULT_SHELL = typeof process !== 'undefined' && process.platform === 'win32' ? 'powershell.exe' : '/bin/zsh'

export const DEFAULT_THEME: TerminalTheme = {
  id: 'default-dark',
  name: 'Default Dark',
  colors: {
    background: '#0a0a0a',
    foreground: '#e0e0e0',
    cursor: '#00ff88',
    selection: '#2a2a2a',
    black: '#000000',
    red: '#ff5c5c',
    green: '#00ff88',
    yellow: '#ffcc00',
    blue: '#00ccff',
    magenta: '#ff5cff',
    cyan: '#00ffff',
    white: '#ffffff',
    brightBlack: '#5a5a5a',
    brightRed: '#ff8080',
    brightGreen: '#55ffaa',
    brightYellow: '#ffdd55',
    brightBlue: '#55ddff',
    brightMagenta: '#ff88ff',
    brightCyan: '#55ffff',
    brightWhite: '#ffffff'
  }
}

export const MARKETPLACE_URL = 'https://api.handsometerminal.com/plugins'

export const SUPPORTED_LLMS = {
  OLLAMA: {
    name: 'Ollama',
    defaultEndpoint: 'http://localhost:11434/api',
    docsUrl: 'https://ollama.com/docs/api'
  },
  LMSTUDIO: {
    name: 'LM Studio',
    defaultEndpoint: 'http://localhost:1234/v1',
    docsUrl: 'https://lmstudio.ai/docs'
  },
  LLAMACPP: {
    name: 'Llama.cpp',
    defaultEndpoint: 'http://localhost:8080',
    docsUrl: 'https://github.com/ggerganov/llama.cpp'
  }
} as const

export type IPCEventType = typeof IPC_EVENTS
