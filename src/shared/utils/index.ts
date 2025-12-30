import type { TerminalTheme } from '../types'

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

export const parseAnsiColors = (text: string): string => {
  /* eslint-disable no-control-regex */
  return text
    .replace(/\x1b\[30m/g, '<span class="ansi-black">')
    .replace(/\x1b\[31m/g, '<span class="ansi-red">')
    .replace(/\x1b\[32m/g, '<span class="ansi-green">')
    .replace(/\x1b\[33m/g, '<span class="ansi-yellow">')
    .replace(/\x1b\[34m/g, '<span class="ansi-blue">')
    .replace(/\x1b\[35m/g, '<span class="ansi-magenta">')
    .replace(/\x1b\[36m/g, '<span class="ansi-cyan">')
    .replace(/\x1b\[37m/g, '<span class="ansi-white">')
    .replace(/\x1b\[0m/g, '</span>')
  /* eslint-enable no-control-regex */
}

export const generateSessionId = (): string => {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const validateURL = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

export const throttle = <T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}
