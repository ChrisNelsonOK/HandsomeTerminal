import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { LLMManager } from '../main/ai/LLMManager'
import type { LLMConfig } from '../shared/types'

import axios from 'axios'

vi.mock('axios')

describe('LLMManager Unit Tests', () => {
  let manager: LLMManager
  const mockClient = {
    post: vi.fn(),
    get: vi.fn()
  }

  beforeEach(() => {
    manager = new LLMManager()
    vi.clearAllMocks()
    vi.mocked(axios.create).mockReturnValue(mockClient as any)
    mockClient.post.mockResolvedValue({
      data: {
        response: 'Test response',
        model: 'llama2',
        prompt_eval_count: 10,
        eval_count: 20,
        choices: [{ message: { content: 'Test response' } }],
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
      }
    })
    mockClient.get.mockResolvedValue({ data: {} })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Configuration Management', () => {
    it('should add a new LLM configuration', () => {
      const config: LLMConfig = {
        provider: 'ollama',
        endpoint: 'http://localhost:11434/api',
        model: 'llama2',
        temperature: 0.7,
        maxTokens: 2048
      }

      manager.addConfig('test-config', config)

      const activeConfig = manager.getActiveConfig()
      expect(activeConfig?.provider).toBe('ollama')
    })

    it('should set active config by id', () => {
      const config1: LLMConfig = {
        provider: 'ollama',
        endpoint: 'http://localhost:11434/api',
        model: 'llama2',
        temperature: 0.7,
        maxTokens: 2048
      }

      const config2: LLMConfig = {
        provider: 'lmstudio',
        endpoint: 'http://localhost:1234/v1',
        model: 'codellama',
        temperature: 0.8,
        maxTokens: 4096
      }

      manager.addConfig('config1', config1)
      manager.addConfig('config2', config2)

      manager.setActiveConfig('config2')

      const activeConfig = manager.getActiveConfig()
      expect(activeConfig?.provider).toBe('lmstudio')
    })

    it('should remove configuration', () => {
      const config: LLMConfig = {
        provider: 'ollama',
        endpoint: 'http://localhost:11434/api',
        model: 'llama2',
        temperature: 0.7,
        maxTokens: 2048
      }

      manager.addConfig('test-config', config)
      manager.removeConfig('test-config')

      expect(manager.getActiveConfig()).toBeUndefined()
    })
  })

  describe('Text Generation', () => {
    it('should generate text using configured LLM', async () => {
      const config: LLMConfig = {
        provider: 'ollama',
        endpoint: 'http://localhost:11434/api',
        model: 'llama2',
        temperature: 0.7,
        maxTokens: 2048
      }

      manager.addConfig('test-config', config)

      const response = await manager.generate('Hello, world!', 'test-config')

      expect(response).toBeDefined()
      expect(response.content).toBeTruthy()
      expect(response.model).toBeTruthy()
    })

    it('should throw error when no active config exists', async () => {
      await expect(manager.generate('test')).rejects.toThrow('No active LLM configuration')
    })
  })

  describe('Connection Management', () => {
    it('should return true for valid Ollama connection', async () => {
      const config: LLMConfig = {
        provider: 'ollama',
        endpoint: 'http://localhost:11434/api',
        model: 'llama2',
        temperature: 0.7,
        maxTokens: 2048
      }

      manager.addConfig('test-ollama', config)
      const connected = await manager.checkConnection('test-ollama')

      expect(typeof connected).toBe('boolean')
    })

    it('should return false for invalid connection', async () => {
      mockClient.get.mockRejectedValue(new Error('Connection failed'))
      
      const config: LLMConfig = {
        provider: 'ollama',
        endpoint: 'http://invalid-host:9999/api',
        model: 'llama2',
        temperature: 0.7,
        maxTokens: 2048
      }

      manager.addConfig('test-invalid', config)
      const connected = await manager.checkConnection('test-invalid')

      expect(connected).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockClient.post.mockRejectedValue(new Error('Network Error'))

      const config: LLMConfig = {
        provider: 'ollama',
        endpoint: 'http://localhost:9999/api',
        model: 'llama2',
        temperature: 0.7,
        maxTokens: 2048
      }

      manager.addConfig('test-error', config)

      await expect(manager.generate('test', 'test-error')).rejects.toThrow()
    })

    it('should handle timeout errors gracefully', async () => {
      mockClient.post.mockRejectedValue(new Error('Timeout'))

      const config: LLMConfig = {
        provider: 'ollama',
        endpoint: 'http://localhost:9999/api',
        model: 'llama2',
        temperature: 0.7,
        maxTokens: 2048,
        timeout: 1
      } as any

      manager.addConfig('test-timeout', config)

      await expect(manager.generate('test', 'test-timeout')).rejects.toThrow()
    })
  })
})
