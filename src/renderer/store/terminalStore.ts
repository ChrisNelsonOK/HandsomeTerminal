import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { TerminalSession } from '@shared/types'

interface TerminalState {
  terminals: Array<TerminalSession & { write?: (data: string) => void; onOutput?: (callback: (data: string) => void) => void }>
  activeTab: string
  createTerminal: () => void
  closeTerminal: (id: string) => void
  setActiveTab: (id: string) => void
  resizeTerminal: (id: string, cols: number, rows: number) => void
  writeTerminal: (id: string, data: string) => void
}

export const useTerminalStore = create<TerminalState>()(
  subscribeWithSelector((set, _get) => ({
    terminals: [],
    activeTab: '',

    createTerminal: async () => {
      // Allow main process to determine defaults
      const session = await window.electronAPI.terminal.create('', '')

      const terminalWithMethods = {
        ...session,
        write: (data: string) => {
          window.electronAPI.terminal.write(session.id, data)
        },
        onOutput: (callback: (data: string) => void) => {
          window.electronAPI.terminal.onOutput((data: { sessionId: string; data: string }) => {
            if (data.sessionId === session.id) {
              callback(data.data)
            }
          })
        }
      }

      set(state => ({
        terminals: [...state.terminals, terminalWithMethods],
        activeTab: state.activeTab || session.id
      }))
    },

    closeTerminal: (id: string) => {
      window.electronAPI.terminal.close(id)
      set(state => {
        const newTerminals = state.terminals.filter(t => t.id !== id)
        return {
          terminals: newTerminals,
          activeTab: state.activeTab === id ? (newTerminals[0]?.id || '') : state.activeTab
        }
      })
    },

    setActiveTab: (id: string) => {
      set({ activeTab: id })
    },

    resizeTerminal: (id: string, cols: number, rows: number) => {
      window.electronAPI.terminal.resize(id, cols, rows)
    },

    writeTerminal: (id: string, data: string) => {
      window.electronAPI.terminal.write(id, data)
    }
  }))
)
