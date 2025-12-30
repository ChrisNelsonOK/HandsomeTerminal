import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

vi.mock('../../src/renderer/main')

describe('Settings Store Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Theme Settings', () => {
    it('should set theme', () => {
      const { result } = renderHook(() => ({
        theme: 'dark',
        fontSize: 14,
        fontFamily: 'JetBrains Mono',
        llmConfigs: new Map(),
        activeLLMId: null,
        setTheme: (_theme: string) => {},
        setFontSize: (_size: number) => {},
        setFontFamily: (_family: string) => {},
        addLLMConfig: (_id: string, _config: any) => {},
        removeLLMConfig: (_id: string) => {},
        setActiveLLM: (_id: string) => {},
        loadSettings: async () => {},
        saveSettings: async () => {}
      }))

      result.current.setTheme('midnight')

      expect(result.current.theme).toBe('midnight')
    })
  })

  describe('Font Settings', () => {
    it('should set font size', () => {
      const { result } = renderHook(() => ({
        theme: 'dark',
        fontSize: 14,
        fontFamily: 'JetBrains Mono',
        llmConfigs: new Map(),
        activeLLMId: null,
        setTheme: (_theme: string) => {},
        setFontSize: (_size: number) => {},
        setFontFamily: (_family: string) => {},
        addLLMConfig: (_id: string, _config: any) => {},
        removeLLMConfig: (_id: string) => {},
        setActiveLLM: (_id: string) => {},
        loadSettings: async () => {},
        saveSettings: async () => {}
      }))

      result.current.setFontSize(16)

      expect(result.current.fontSize).toBe(16)
    })

    it('should set font family', () => {
      const { result } = renderHook(() => ({
        theme: 'dark',
        fontSize: 14,
        fontFamily: 'JetBrains Mono',
        llmConfigs: new Map(),
        activeLLMId: null,
        setTheme: (_theme: string) => {},
        setFontSize: (_size: number) => {},
        setFontFamily: (_family: string) => {},
        addLLMConfig: (_id: string, _config: any) => {},
        removeLLMConfig: (_id: string) => {},
        setActiveLLM: (_id: string) => {},
        loadSettings: async () => {},
        saveSettings: async () => {}
      }))

      result.current.setFontFamily('Fira Code')

      expect(result.current.fontFamily).toBe('Fira Code')
    })
  })

  describe('LLM Configuration', () => {
    it('should add LLM configuration', () => {
      const { result } = renderHook(() => ({
        theme: 'dark',
        setTheme: () => {},
        setFontSize: () => {},
        setFontFamily: () => {},
        llmConfigs: new Map(),
        addLLMConfig: (id: string, config: any) => {
          const newConfigs = new Map(result.current.llmConfigs)
          newConfigs.set(id, config)
          return { ...result, llmConfigs: newConfigs }
        },
        removeLLMConfig: (_id: string) => {},
        setActiveLLM: (_id: string) => {},
        loadSettings: async () => {},
        saveSettings: async () => {}
      }))

      const config = {
        id: 'test-llm',
        provider: 'ollama' as const,
        endpoint: 'http://localhost:11434/api',
        model: 'llama2',
        temperature: 0.7,
        maxTokens: 2048
      }

      result.current.addLLMConfig('test-llm', config)

      expect(result.current.llmConfigs.has('test-llm')).toBe(true)
    })

    it('should remove LLM configuration', () => {
      const { result } = renderHook(() => ({
        theme: 'dark',
        setTheme: () => {},
        setFontSize: () => {},
        setFontFamily: () => {},
        llmConfigs: new Map([['test-llm', {} as any]]),
        addLLMConfig: (id: string, config: any) => {
          const newConfigs = new Map(result.current.llmConfigs)
          newConfigs.set(id, config)
          return { ...result, llmConfigs: newConfigs }
        },
        removeLLMConfig: (id: string) => {
          const newConfigs = new Map(result.current.llmConfigs)
          newConfigs.delete(id)
          return { ...result, llmConfigs: newConfigs }
        },
        setActiveLLM: (_id: string) => {},
        loadSettings: async () => {},
        saveSettings: async () => {}
      }))

      result.current.removeLLMConfig('test-llm')

      expect(result.current.llmConfigs.has('test-llm')).toBe(false)
    })

    it('should set active LLM', () => {
      const { result } = renderHook(() => ({
        theme: 'dark',
        setTheme: () => {},
        setFontSize: () => {},
        setFontFamily: () => {},
        llmConfigs: new Map(),
        activeLLMId: null,
        addLLMConfig: (id: string, config: any) => {
          const newConfigs = new Map(result.current.llmConfigs)
          newConfigs.set(id, config)
          return { ...result, llmConfigs: newConfigs }
        },
        removeLLMConfig: (_id: string) => {},
        setActiveLLM: (id: string) => {
          return { ...result, activeLLMId: id }
        },
        loadSettings: async () => {},
        saveSettings: async () => {}
      }))

      result.current.setActiveLLM('test-llm')

      expect(result.current.activeLLMId).toBe('test-llm')
    })
  })
})
