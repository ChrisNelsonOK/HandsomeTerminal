import pty from 'node-pty'
import { v4 as uuidv4 } from 'uuid'
import { EventEmitter } from 'eventemitter3'
import type { TerminalSession } from '@shared/types'
import type { IPty } from 'node-pty'

export class TerminalManager extends EventEmitter {
  private sessions: Map<string, TerminalSession> = new Map()
  private processes: Map<string, pty.IPty> = new Map()

  createSession(
    cwd: string = typeof process !== 'undefined' ? (process.env.HOME || process.cwd()) : '/',
    shell: string = typeof process !== 'undefined' && process.platform === 'win32' ? 'powershell.exe' : '/bin/zsh'
  ): TerminalSession {
    const id = uuidv4()
    const ptyProcess: IPty = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd,
      env: process.env as Record<string, string>
    })

    const session: TerminalSession = {
      id,
      title: cwd.split('/').pop() || cwd.split('\\').pop() || 'Terminal',
      cwd,
      shell,
      pid: ptyProcess.pid,
      createdAt: new Date(),
      isActive: true
    }

    this.sessions.set(id, session)
    this.processes.set(id, ptyProcess)

    ptyProcess.onData((data: string) => {
      this.emit('output', { sessionId: id, data })
    })

    ptyProcess.onExit(({ exitCode, signal }: { exitCode: number; signal?: number }) => {
      this.emit('exit', { sessionId: id, exitCode, signal })
      this.closeSession(id)
    })

    this.emit('create', session)

    return session
  }

  write(sessionId: string, data: string): void {
    const process = this.processes.get(sessionId)
    if (process) {
      process.write(data)
    }
  }

  resize(sessionId: string, cols: number, rows: number): void {
    const process = this.processes.get(sessionId)
    if (process) {
      process.resize(cols, rows)
    }
  }

  closeSession(sessionId: string): void {
    const process = this.processes.get(sessionId)
    if (process) {
      process.kill()
      this.processes.delete(sessionId)
    }

    const session = this.sessions.get(sessionId)
    if (session) {
      session.isActive = false
      this.sessions.delete(sessionId)
      this.emit('close', session)
    }
  }

  getSession(sessionId: string): TerminalSession | undefined {
    return this.sessions.get(sessionId)
  }

  getAllSessions(): TerminalSession[] {
    return Array.from(this.sessions.values())
  }

  getActiveSessions(): TerminalSession[] {
    return Array.from(this.sessions.values()).filter(s => s.isActive)
  }

  setActiveSession(sessionId: string): void {
    this.sessions.forEach(session => {
      session.isActive = session.id === sessionId
    })
  }
}
