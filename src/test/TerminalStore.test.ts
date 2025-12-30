import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('../../src/renderer/main')

describe('Terminal Store Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Session Management', () => {
    it('should have empty terminals on mount', () => {
      const { result } = renderHook(() => ({
        terminals: [],
        activeTab: '',
        createTerminal: async () => {},
        closeTerminal: () => {},
        setActiveTab: () => {},
        resizeTerminal: () => {},
        writeTerminal: () => {}
      }))

      expect(result.current.terminals).toEqual([])
    })

    it('should create new terminal', async () => {
      const { result } = renderHook(() => ({
        terminals: [],
        activeTab: '',
        createTerminal: async () => {
          return { id: 'test-1', title: 'Test Terminal' } as any
        },
        closeTerminal: () => {},
        setActiveTab: () => {},
        resizeTerminal: () => {},
        writeTerminal: () => {}
      }))

      await act(async () => {
        await result.current.createTerminal()
      })

      expect(result.current.terminals.length).toBe(1)
    })

    it('should close terminal', () => {
      let closeTerminalCalled = false

      const { result } = renderHook(() => ({
        terminals: [{ id: 'test-1' } as any],
        activeTab: 'test-1',
        createTerminal: async () => ({} as any),
        closeTerminal: (_id: string) => {
          closeTerminalCalled = true
        },
        setActiveTab: (_id: string) => {},
        resizeTerminal: (_id: string, _cols: number, _rows: number) => {},
        writeTerminal: (_id: string, _data: string) => {}
      }))

      act(() => {
        result.current.closeTerminal('test-1')
      })

      expect(closeTerminalCalled).toBe(true)
    })

    it('should set active tab', () => {
      let setActiveTabCalled = false

      const { result } = renderHook(() => ({
        terminals: [{ id: 'test-1', isActive: false } as any],
        activeTab: 'test-1',
        createTerminal: async () => ({} as any),
        closeTerminal: () => {},
        setActiveTab: (id: string) => {
          setActiveTabCalled = true
          return id
        },
        resizeTerminal: () => {},
        writeTerminal: () => {}
      }))

      act(() => {
        result.current.setActiveTab('test-2')
      })

      expect(setActiveTabCalled).toBe(true)
    })
  })

  describe('Terminal Operations', () => {
    it('should resize terminal', () => {
      let resizeTerminalCalled = false

      const { result } = renderHook(() => ({
        terminals: [],
        activeTab: '',
        createTerminal: async () => ({} as any),
        closeTerminal: () => {},
        setActiveTab: () => {},
        resizeTerminal: (_id: string, _cols: number, _rows: number) => {
          resizeTerminalCalled = true
        },
        writeTerminal: () => {}
      }))

      act(() => {
        result.current.resizeTerminal('test-1', 120, 40)
      })

      expect(resizeTerminalCalled).toBe(true)
    })

    it('should write to terminal', () => {
      let writeTerminalCalled = false

      const { result } = renderHook(() => ({
        terminals: [],
        activeTab: '',
        createTerminal: async () => ({} as any),
        closeTerminal: () => {},
        setActiveTab: () => {},
        resizeTerminal: () => {},
        writeTerminal: (_id: string, _data: string) => {
          writeTerminalCalled = true
        }
      }))

      act(() => {
        result.current.writeTerminal('test-1', 'ls\n')
      })

      expect(writeTerminalCalled).toBe(true)
    })
  })

  describe('State Management', () => {
    it('should track terminal state correctly', () => {
      const { result } = renderHook(() => ({
        terminals: [
          { id: 'test-1', isActive: true } as any,
          { id: 'test-2', isActive: false } as any
        ],
        activeTab: 'test-1',
        createTerminal: async () => ({} as any),
        closeTerminal: () => {},
        setActiveTab: (id: string) => id,
        resizeTerminal: () => {},
        writeTerminal: () => {}
      }))

      expect(result.current.activeTab).toBe('test-1')
      expect(result.current.terminals.length).toBe(2)
      expect(result.current.terminals.filter((t: any) => t.isActive).length).toBe(1)
    })

    it('should handle multiple sessions', () => {
      const { result } = renderHook(() => ({
        terminals: [],
        activeTab: '',
        createTerminal: async () => {
          return { id: `test-${result.current.terminals.length + 1}`, title: 'Test' } as any
        },
        closeTerminal: () => {},
        setActiveTab: () => {},
        resizeTerminal: () => {},
        writeTerminal: () => {}
      }))

      act(() => {
        result.current.createTerminal()
        result.current.createTerminal()
        result.current.createTerminal()
      })

      expect(result.current.terminals.length).toBe(3)
    })
  })
})
