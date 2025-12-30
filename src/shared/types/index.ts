export interface TerminalSession {
  id: string
  title: string
  cwd: string
  shell: string
  pid: number
  createdAt: Date
  isActive: boolean
}

export interface LLMConfig {
  provider: 'ollama' | 'lmstudio' | 'llamacpp' | 'custom'
  endpoint: string
  model: string
  apiKey?: string
  temperature: number
  maxTokens: number
  systemPrompt?: string
}

export interface LLMResponse {
  content: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface Plugin {
  id: string
  name: string
  version: string
  author: string
  description: string
  enabled: boolean
  manifest: PluginManifest
  hooks: PluginHooks
}

export interface PluginManifest {
  id: string
  name: string
  version: string
  author: string
  description: string
  main: string
  permissions: string[]
  dependencies?: Record<string, string>
}

export interface PluginHooks {
  onTerminalCreate?: (session: TerminalSession) => Promise<void> | void
  onTerminalOutput?: (session: TerminalSession, data: string) => Promise<void> | void
  onCommandExecute?: (session: TerminalSession, command: string) => Promise<string> | string | void
  onAIResponse?: (response: LLMResponse) => Promise<void> | void
}

export interface SSHConfig {
  id: string
  name: string
  host: string
  port: number
  username: string
  authMethod: 'password' | 'key' | 'agent'
  password?: string
  privateKey?: string
  passphrase?: string
  keepAliveInterval?: number
}

export interface SSHSession extends SSHConfig {
  sessionId: string
  connected: boolean
  connectedAt?: Date
  terminalSession?: TerminalSession
}

export interface CommandSuggestion {
  command: string
  description: string
  confidence: number
  source: 'ai' | 'history' | 'plugin'
}

export type TerminalTheme = {
  id: string
  name: string
  colors: {
    background: string
    foreground: string
    cursor: string
    selection?: string
    black: string
    red: string
    green: string
    yellow: string
    blue: string
    magenta: string
    cyan: string
    white: string
    brightBlack: string
    brightRed: string
    brightGreen: string
    brightYellow: string
    brightBlue: string
    brightMagenta: string
    brightCyan: string
    brightWhite: string
  }
}

export interface DevOpsIntegration {
  type: 'docker' | 'kubernetes' | 'terraform' | 'ansible' | 'cloud'
  name: string
  enabled: boolean
  config: Record<string, unknown>
}

export interface MarketPlacePlugin {
  id: string
  name: string
  version: string
  author: string
  description: string
  rating: number
  downloads: number
  tags: string[]
  icon?: string
  screenshots?: string[]
  manifest: PluginManifest
}

export interface TerminalCommand {
  id: string
  command: string
  timestamp: Date
  sessionId: string
  exitCode?: number
  duration?: number
}

export interface AICommandRequest {
  context: string
  commandHistory: TerminalCommand[]
  currentDirectory: string
  shellType: string
}
