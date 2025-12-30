import { EventEmitter } from 'eventemitter3'
import type { SSHConfig, SSHSession } from '@shared/types'
import pty from 'node-pty'
import { v4 as uuidv4 } from 'uuid'

export class SSHManager extends EventEmitter {
  private sessions: Map<string, SSHSession> = new Map()
  private sshProcesses: Map<string, pty.IPty> = new Map()

  async connect(config: SSHConfig): Promise<SSHSession> {
    const sessionId = uuidv4()
    const sshCmd = this.buildSSHCommand(config)

    const ptyProcess = pty.spawn('ssh', sshCmd, {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      env: typeof process !== 'undefined' ? (process.env as Record<string, string>) : {},
      cwd: typeof process !== 'undefined' ? (process.env.HOME || process.cwd()) : '/'
    })

    const session: SSHSession = {
      ...config,
      sessionId,
      connected: true,
      connectedAt: new Date()
    }

    this.sessions.set(sessionId, session)
    this.sshProcesses.set(sessionId, ptyProcess)

    ptyProcess.onData((data: string) => {
      this.emit('output', { sessionId, data })
    })

    ptyProcess.onExit(({ exitCode, signal }: { exitCode: number; signal?: number }) => {
      this.emit('disconnect', { sessionId, exitCode, signal })
      this.disconnect(sessionId)
    })

    this.emit('connect', session)

    return session
  }

  private buildSSHCommand(config: SSHConfig): string[] {
    const args: string[] = []

    if (config.port && config.port !== 22) {
      args.push('-p', config.port.toString())
    }

    args.push('-o', 'StrictHostKeyChecking=no')
    args.push('-o', 'UserKnownHostsFile=/dev/null')

    if (config.keepAliveInterval) {
      args.push('-o', `ServerAliveInterval=${config.keepAliveInterval}`)
      args.push('-o', 'ServerAliveCountMax=3')
    }

      if (config.authMethod === 'key') {
        args.push('-i', config.privateKey || (typeof process !== 'undefined' ? `${process.env.HOME}/.ssh/id_rsa` : ''))
      }

    if (config.authMethod === 'agent') {
      args.push('-A')
    }

    args.push(`${config.username}@${config.host}`)

    return args
  }

  disconnect(sessionId: string): void {
    const process = this.sshProcesses.get(sessionId)
    if (process) {
      process.kill()
      this.sshProcesses.delete(sessionId)
    }

    const session = this.sessions.get(sessionId)
    if (session) {
      session.connected = false
      this.sessions.delete(sessionId)
      this.emit('close', session)
    }
  }

  write(sessionId: string, data: string): void {
    const process = this.sshProcesses.get(sessionId)
    if (process) {
      process.write(data)
    }
  }

  resize(sessionId: string, cols: number, rows: number): void {
    const process = this.sshProcesses.get(sessionId)
    if (process) {
      process.resize(cols, rows)
    }
  }

  getSession(sessionId: string): SSHSession | undefined {
    return this.sessions.get(sessionId)
  }

  getAllSessions(): SSHSession[] {
    return Array.from(this.sessions.values())
  }

  async saveConfig(config: SSHConfig): Promise<void> {
    this.emit('config-saved', config)
  }

  async deleteConfig(configId: string): Promise<void> {
    this.emit('config-deleted', configId)
  }

  async testConnection(config: SSHConfig): Promise<boolean> {
    const testSession = await this.connect({
      ...config,
      id: `test-${uuidv4()}`
    })

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.disconnect(testSession.sessionId)
        resolve(false)
      }, 10000)

      const onOutput = (data: { sessionId: string; data: string }) => {
        if (data.sessionId === testSession.sessionId) {
          if (data.data.includes('Welcome') || 
              data.data.includes('Last login') || 
              data.data.includes(config.username)) {
            clearTimeout(timeout)
            this.disconnect(testSession.sessionId)
            this.off('output', onOutput)
            resolve(true)
          }
        }
      }

      this.on('output', onOutput)
    })
  }
}
