/**
 * Logger Service
 * 
 * Production-ready logging service with level-based filtering,
 * structured logging, and environment-aware output.
 * 
 * Usage:
 *   import { logger } from './services/Logger'
 *   logger.error('Connection failed', error, { endpoint: url })
 *   logger.info('Server started', { port: 3000 })
 */

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  [key: string]: any
}

export class Logger {
  private static instance: Logger
  private logLevel: LogLevel
  private isDevelopment: boolean

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production'
    this.logLevel = this.isDevelopment ? 'debug' : 'info'
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  /**
   * Set the minimum log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const timestamp = new Date().toISOString()
      const logData = {
        level: 'ERROR',
        timestamp,
        message,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        ...context
      }

      if (this.isDevelopment) {
        console.error(`[${timestamp}] [ERROR] ${message}`, error, context)
      } else {
        // In production, could send to error tracking service (Sentry, etc.)
        console.error(JSON.stringify(logData))
      }
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      const timestamp = new Date().toISOString()
      const logData = {
        level: 'WARN',
        timestamp,
        message,
        ...context
      }

      if (this.isDevelopment) {
        console.warn(`[${timestamp}] [WARN] ${message}`, context)
      } else {
        console.warn(JSON.stringify(logData))
      }
    }
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      const timestamp = new Date().toISOString()
      const logData = {
        level: 'INFO',
        timestamp,
        message,
        ...context
      }

      if (this.isDevelopment) {
        console.info(`[${timestamp}] [INFO] ${message}`, context || '')
      } else {
        console.log(JSON.stringify(logData))
      }
    }
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      const timestamp = new Date().toISOString()
      const logData = {
        level: 'DEBUG',
        timestamp,
        message,
        ...context
      }

      if (this.isDevelopment) {
        console.debug(`[${timestamp}] [DEBUG] ${message}`, context || '')
      } else {
        // Debug logs typically not shown in production
        console.log(JSON.stringify(logData))
      }
    }
  }

  /**
   * Check if the given level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.logLevel)
    const messageLevelIndex = levels.indexOf(level)
    return messageLevelIndex >= currentLevelIndex
  }
}

// Export singleton instance
export const logger = Logger.getInstance()
