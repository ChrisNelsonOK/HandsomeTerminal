# Handsome Terminal API Reference

**Version:** 1.0.0  
**Last Updated:** December 30, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [IPC API](#ipc-api)
3. [Terminal API](#terminal-api)
4. [AI/LLM API](#aillm-api)
5. [Plugin API](#plugin-api)
6. [SSH API](#ssh-api)
7. [DevOps APIs](#devops-apis)
8. [Settings API](#settings-api)
9. [Window API](#window-api)
10. [State Management](#state-management)

---

## Overview

Handsome Terminal provides APIs at multiple levels:
- **IPC API**: Secure communication between main and renderer processes
- **Manager APIs**: Core business logic in main process
- **React Hooks**: State management in renderer process
- **Plugin API**: Extensibility interface for plugins

### Type Safety

All APIs are fully typed with TypeScript. Import types from `@shared/types`:

```typescript
import type { TerminalSession, LLMConfig, Plugin } from '@shared/types'
```

---

## IPC API

### Communication Pattern

The IPC API uses Electron's `ipcRenderer.invoke()` for request-response and `ipcRenderer.on()` for events.

**Exposed via Preload Script:**
```typescript
window.electron.terminal.create(config)
window.electron.ai.generate(prompt)
window.electron.plugin.install(pluginId)
```

---

## Terminal API

### `terminal:create`

Create a new terminal session.

**Request:**
```typescript
interface TerminalCreateRequest {
  shell?: string
  cwd?: string
  env?: Record<string, string>
}
```

**Response:**
```typescript
interface TerminalSession {
  id: string
  title: string
  shell: string
  cwd: string
  pid: number
  cols: number
  rows: number
  isActive: boolean
}
```

**Example:**
```typescript
const session = await window.electron.terminal.create({
  shell: '/bin/zsh',
  cwd: '/Users/username/projects'
})
```

---

### `terminal:close`

Close a terminal session.

**Request:**
```typescript
{ id: string }
```

**Response:**
```typescript
void
```

**Example:**
```typescript
await window.electron.terminal.close({ id: 'term-123' })
```

---

### `terminal:write`

Write data to terminal.

**Request:**
```typescript
{
  id: string
  data: string
}
```

**Response:**
```typescript
void
```

**Example:**
```typescript
await window.electron.terminal.write({
  id: 'term-123',
  data: 'ls -la\n'
})
```

---

### `terminal:resize`

Resize terminal dimensions.

**Request:**
```typescript
{
  id: string
  cols: number
  rows: number
}
```

**Response:**
```typescript
void
```

**Example:**
```typescript
await window.electron.terminal.resize({
  id: 'term-123',
  cols: 120,
  rows: 40
})
```

---

### `terminal:data` (Event)

Receives output from terminal.

**Payload:**
```typescript
{
  id: string
  data: string
}
```

**Example:**
```typescript
window.electron.terminal.onData((event) => {
  console.log(`Terminal ${event.id}:`, event.data)
})
```

---

## AI/LLM API

### `ai:generate`

Generate AI response from LLM.

**Request:**
```typescript
{
  prompt: string
  configId?: string  // Optional, uses active config if not specified
  stream?: boolean   // Future: streaming responses
}
```

**Response:**
```typescript
interface LLMResponse {
  content: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}
```

**Example:**
```typescript
const response = await window.electron.ai.generate({
  prompt: 'Explain the ls command',
  configId: 'ollama-llama2'
})
console.log(response.content)
```

---

### `ai:check-connection`

Test LLM connection.

**Request:**
```typescript
{
  configId?: string
}
```

**Response:**
```typescript
{
  connected: boolean
  error?: string
}
```

**Example:**
```typescript
const status = await window.electron.ai.checkConnection({
  configId: 'ollama-llama2'
})
if (status.connected) {
  console.log('LLM is ready')
}
```

---

### `ai:get-suggestions`

Get command suggestions.

**Request:**
```typescript
{
  input: string
  context: {
    cwd: string
    shell: string
    history: string[]
  }
}
```

**Response:**
```typescript
interface Suggestion {
  command: string
  description: string
  confidence: number  // 0-100
  source: 'history' | 'filesystem' | 'ai'
}

type SuggestionsResponse = Suggestion[]
```

**Example:**
```typescript
const suggestions = await window.electron.ai.getSuggestions({
  input: 'git',
  context: {
    cwd: '/Users/me/project',
    shell: 'zsh',
    history: ['git status', 'git add .']
  }
})
```

---

### `ai:add-config`

Add LLM configuration.

**Request:**
```typescript
interface LLMConfig {
  id: string
  provider: 'ollama' | 'lmstudio' | 'llamacpp' | 'custom'
  endpoint: string
  model: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}
```

**Response:**
```typescript
void
```

**Example:**
```typescript
await window.electron.ai.addConfig({
  id: 'my-llm',
  provider: 'ollama',
  endpoint: 'http://localhost:11434/api',
  model: 'llama2',
  temperature: 0.7,
  maxTokens: 2048
})
```

---

## Plugin API

### `plugin:list`

List installed plugins.

**Request:**
```typescript
{}
```

**Response:**
```typescript
interface Plugin {
  id: string
  name: string
  version: string
  author: string
  description: string
  enabled: boolean
  hooks: string[]
}

type PluginsResponse = Plugin[]
```

---

### `plugin:install`

Install plugin from marketplace.

**Request:**
```typescript
{
  pluginId: string
  source?: 'marketplace' | 'local' | 'github'
}
```

**Response:**
```typescript
{
  success: boolean
  error?: string
}
```

---

### `plugin:uninstall`

Remove installed plugin.

**Request:**
```typescript
{
  pluginId: string
}
```

**Response:**
```typescript
{
  success: boolean
  error?: string
}
```

---

### `plugin:enable` / `plugin:disable`

Toggle plugin state.

**Request:**
```typescript
{
  pluginId: string
}
```

**Response:**
```typescript
void
```

---

### Plugin Hook API

Plugins can register hooks to extend functionality:

```typescript
interface PluginHooks {
  onTerminalCreate?: (session: TerminalSession) => void
  onCommandExecute?: (command: string, session: TerminalSession) => void
  onAIResponse?: (response: LLMResponse, prompt: string) => void
  onShutdown?: () => void
}
```

---

## SSH API

### `ssh:connect`

Establish SSH connection.

**Request:**
```typescript
interface SSHConfig {
  host: string
  port: number
  username: string
  password?: string
  privateKey?: string
  passphrase?: string
}
```

**Response:**
```typescript
interface SSHSession {
  id: string
  host: string
  username: string
  connected: boolean
}
```

---

### `ssh:disconnect`

Close SSH connection.

**Request:**
```typescript
{
  id: string
}
```

**Response:**
```typescript
void
```

---

## DevOps APIs

### Docker API

#### `docker:list-containers`

**Response:**
```typescript
interface DockerContainer {
  id: string
  name: string
  image: string
  status: string
  ports: string[]
}[]
```

#### `docker:start` / `docker:stop` / `docker:remove`

**Request:**
```typescript
{
  containerId: string
}
```

#### `docker:logs`

**Request:**
```typescript
{
  containerId: string
  tail?: number
  follow?: boolean
}
```

**Response:**
```typescript
{
  logs: string
}
```

---

### Kubernetes API

#### `k8s:list-pods`

**Request:**
```typescript
{
  namespace?: string
}
```

**Response:**
```typescript
interface K8sPod {
  name: string
  namespace: string
  status: string
  ready: string
  restarts: number
  age: string
}[]
```

#### `k8s:scale-deployment`

**Request:**
```typescript
{
  name: string
  namespace: string
  replicas: number
}
```

---

### Terraform API

#### `terraform:list-workspaces`

**Response:**
```typescript
string[]
```

#### `terraform:plan`

**Request:**
```typescript
{
  workspace?: string
  varFile?: string
}
```

**Response:**
```typescript
{
  output: string
  exitCode: number
}
```

---

### Network API

#### `network:ping`

**Request:**
```typescript
{
  host: string
  count?: number
}
```

**Response:**
```typescript
{
  host: string
  sent: number
  received: number
  loss: number
  min: number
  avg: number
  max: number
}
```

#### `network:port-scan`

**Request:**
```typescript
{
  host: string
  ports: number[]
}
```

**Response:**
```typescript
{
  host: string
  openPorts: number[]
  closedPorts: number[]
}
```

---

## Settings API

### `settings:get`

Get all settings.

**Response:**
```typescript
interface Settings {
  theme: string
  fontSize: number
  fontFamily: string
  llmConfigs: Map<string, LLMConfig>
  activeLLMId: string | null
  keyBindings: Record<string, string>
}
```

---

### `settings:set`

Update settings.

**Request:**
```typescript
Partial<Settings>
```

**Response:**
```typescript
void
```

---

## Window API

### `window:minimize` / `window:maximize` / `window:close`

Window control operations.

**Response:**
```typescript
void
```

---

## State Management

### Terminal Store (Zustand)

```typescript
interface TerminalStore {
  terminals: TerminalSession[]
  activeTab: string
  createTerminal: (config?: TerminalCreateRequest) => Promise<TerminalSession>
  closeTerminal: (id: string) => void
  setActiveTab: (id: string) => void
  resizeTerminal: (id: string, cols: number, rows: number) => void
  writeTerminal: (id: string, data: string) => void
}

// Usage
import { useTerminalStore } from '@/store/terminalStore'

function MyComponent() {
  const { terminals, createTerminal } = useTerminalStore()
  
  const handleNew = async () => {
    await createTerminal({ shell: '/bin/zsh' })
  }
  
  return <button onClick={handleNew}>New Terminal</button>
}
```

---

### Settings Store (Zustand)

```typescript
interface SettingsStore {
  theme: string
  fontSize: number
  fontFamily: string
  llmConfigs: Map<string, LLMConfig>
  activeLLMId: string | null
  setTheme: (theme: string) => void
  setFontSize: (size: number) => void
  setFontFamily: (family: string) => void
  addLLMConfig: (id: string, config: LLMConfig) => void
  removeLLMConfig: (id: string) => void
  setActiveLLM: (id: string) => void
  loadSettings: () => Promise<void>
  saveSettings: () => Promise<void>
}

// Usage
import { useSettingsStore } from '@/store/settingsStore'

function SettingsPanel() {
  const { theme, setTheme } = useSettingsStore()
  
  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="dark">Dark</option>
      <option value="midnight">Midnight</option>
    </select>
  )
}
```

---

## Error Handling

All async APIs return Promises and may reject with errors:

```typescript
try {
  await window.electron.terminal.create({})
} catch (error) {
  console.error('Failed to create terminal:', error)
}
```

Error objects follow this structure:
```typescript
interface APIError {
  code: string
  message: string
  details?: any
}
```

---

## Rate Limiting

Some APIs have rate limits:
- **AI Generation**: 10 requests per minute per config
- **Plugin Installation**: 5 per minute
- **SSH Connections**: 3 concurrent per host

---

## Versioning

The API follows semantic versioning. Breaking changes will increment the major version.

**Current Version:** 1.0.0

---

## Examples

### Complete Terminal Workflow

```typescript
// Create terminal
const session = await window.electron.terminal.create({
  shell: '/bin/zsh',
  cwd: '/Users/me/projects'
})

// Listen for output
window.electron.terminal.onData((event) => {
  if (event.id === session.id) {
    displayOutput(event.data)
  }
})

// Send command
await window.electron.terminal.write({
  id: session.id,
  data: 'npm install\n'
})

// Resize on window change
await window.electron.terminal.resize({
  id: session.id,
  cols: 120,
  rows: 40
})

// Close when done
await window.electron.terminal.close({ id: session.id })
```

---

### AI-Powered Command Assistant

```typescript
// Add LLM config
await window.electron.ai.addConfig({
  id: 'ollama',
  provider: 'ollama',
  endpoint: 'http://localhost:11434/api',
  model: 'codellama'
})

// Get command explanation
const response = await window.electron.ai.generate({
  prompt: 'Explain what this command does: tar -xzvf archive.tar.gz'
})

// Get suggestions while typing
const suggestions = await window.electron.ai.getSuggestions({
  input: 'dock',
  context: {
    cwd: process.cwd(),
    shell: 'zsh',
    history: []
  }
})

suggestions.forEach(s => {
  console.log(`${s.command} (${s.confidence}%): ${s.description}`)
})
```

---

### Plugin Development

```typescript
// plugin.ts
export default {
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  
  hooks: {
    onTerminalCreate(session) {
      console.log('New terminal created:', session.id)
    },
    
    onCommandExecute(command, session) {
      if (command.startsWith('git')) {
        // Provide git-specific enhancements
      }
    },
    
    onAIResponse(response, prompt) {
      // Process or modify AI responses
    }
  }
}
```

---

## Support

For API questions:
- GitHub Issues: [Issues](https://github.com/yourusername/handsome-terminal/issues)
- Documentation: [docs/](../docs/)
- Examples: [examples/](../examples/)

---

**API Version:** 1.0.0  
**Last Updated:** December 30, 2025
