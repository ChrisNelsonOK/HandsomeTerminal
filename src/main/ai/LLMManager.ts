import axios, { AxiosInstance } from 'axios'
import { EventEmitter } from 'eventemitter3'
import type { LLMConfig, LLMResponse } from '@shared/types'
import { logger } from '../services/Logger'

export class LLMManager extends EventEmitter {
  private configs: Map<string, LLMConfig> = new Map()
  private clients: Map<string, AxiosInstance> = new Map()
  private activeConfigId: string | null = null

  addConfig(id: string, config: LLMConfig): void {
    this.configs.set(id, config)
    
    const client = axios.create({
      baseURL: config.endpoint,
      timeout: 30000
    })
    
    this.clients.set(id, client)
    
    if (!this.activeConfigId) {
      this.activeConfigId = id
    }
  }

  removeConfig(id: string): void {
    this.configs.delete(id)
    this.clients.delete(id)
    
    if (this.activeConfigId === id) {
      this.activeConfigId = null
    }
  }

  setActiveConfig(id: string): void {
    if (this.configs.has(id)) {
      this.activeConfigId = id
    }
  }

  getActiveConfig(): LLMConfig | undefined {
    if (!this.activeConfigId) {
      return undefined
    }
    return this.configs.get(this.activeConfigId)
  }

  async checkConnection(configId?: string): Promise<boolean> {
    const id = configId || this.activeConfigId
    if (!id) {
      return false
    }

    const config = this.configs.get(id)
    if (!config) {
      return false
    }

    try {
      const client = this.clients.get(id)
      if (!client) {
        return false
      }

      switch (config.provider) {
        case 'ollama':
          await client.get('/tags')
          break
        case 'lmstudio':
        case 'llamacpp':
        case 'custom':
          await client.get('/models')
          break
        default:
          return false
      }

      return true
    } catch (error) {
      logger.error('LLM connection check failed', error as Error, { configId: id, provider: config.provider })
      return false
    }
  }

  async generate(prompt: string, configId?: string): Promise<LLMResponse> {
    const id = configId || this.activeConfigId
    if (!id) {
      throw new Error('No active LLM configuration')
    }

    const config = this.configs.get(id)
    if (!config) {
      throw new Error(`LLM configuration not found: ${id}`)
    }

    const client = this.clients.get(id)
    if (!client) {
      throw new Error(`HTTP client not found for configuration: ${id}`)
    }

    this.emit('generate-start', { configId: id, prompt })

    try {
      let response: LLMResponse

      switch (config.provider) {
        case 'ollama':
          response = await this.generateOllama(client, config, prompt)
          break
        case 'lmstudio':
          response = await this.generateOpenAICompatible(client, config, prompt)
          break
        case 'llamacpp':
          response = await this.generateLlamaCPP(client, config, prompt)
          break
        case 'custom':
          response = await this.generateOpenAICompatible(client, config, prompt)
          break
        default:
          throw new Error(`Unsupported LLM provider: ${config.provider}`)
      }

      this.emit('generate-complete', { configId: id, response })
      return response
    } catch (error) {
      this.emit('generate-error', { configId: id, error })
      throw error
    }
  }

  private async generateOllama(
    client: AxiosInstance,
    config: LLMConfig,
    prompt: string
  ): Promise<LLMResponse> {
    const response = await client.post('/generate', {
      model: config.model,
      prompt,
      stream: false,
      options: {
        temperature: config.temperature,
        num_predict: config.maxTokens
      },
      system: config.systemPrompt
    })

    return {
      content: response.data.response,
      model: response.data.model,
      usage: {
        promptTokens: response.data.prompt_eval_count || 0,
        completionTokens: response.data.eval_count || 0,
        totalTokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0)
      }
    }
  }

  private async generateOpenAICompatible(
    client: AxiosInstance,
    config: LLMConfig,
    prompt: string
  ): Promise<LLMResponse> {
    const response = await client.post('/chat/completions', {
      model: config.model,
      messages: [
        ...(config.systemPrompt ? [{ role: 'system', content: config.systemPrompt }] : []),
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens
    })

    const choice = response.data.choices[0]
    return {
      content: choice.message.content,
      model: response.data.model,
      usage: response.data.usage ? {
        promptTokens: response.data.usage.prompt_tokens,
        completionTokens: response.data.usage.completion_tokens,
        totalTokens: response.data.usage.total_tokens
      } : undefined
    }
  }

  private async generateLlamaCPP(
    client: AxiosInstance,
    config: LLMConfig,
    prompt: string
  ): Promise<LLMResponse> {
    const response = await client.post('/completion', {
      prompt,
      n_predict: config.maxTokens,
      temperature: config.temperature,
      ...(config.systemPrompt && { system_prompt: config.systemPrompt })
    })

    return {
      content: response.data.content,
      model: config.model
    }
  }

  async stream(
    prompt: string,
    onChunk: (chunk: string) => void,
    configId?: string
  ): Promise<void> {
    const id = configId || this.activeConfigId
    if (!id) {
      throw new Error('No active LLM configuration')
    }

    const config = this.configs.get(id)
    if (!config) {
      throw new Error(`LLM configuration not found: ${id}`)
    }

    const client = this.clients.get(id)
    if (!client) {
      throw new Error(`HTTP client not found for configuration: ${id}`)
    }

    this.emit('stream-start', { configId: id, prompt })

    try {
      const response = await client.post('/generate', {
        model: config.model,
        prompt,
        stream: true,
        options: {
          temperature: config.temperature,
          num_predict: config.maxTokens
        }
      }, {
        responseType: 'stream'
      })

      response.data.on('data', (chunk: ArrayBuffer) => {
        const lines = String.fromCharCode(...new Uint8Array(chunk as ArrayBuffer)).split('\n').filter(line => line.trim())
        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            if (data.response) {
              onChunk(data.response)
            }
          } catch {
            // Ignore parse errors for partial chunks
          }
        }
      })

      await new Promise<void>((resolve, reject) => {
        response.data.on('end', resolve)
        response.data.on('error', reject)
      })

      this.emit('stream-complete', { configId: id })
    } catch (error) {
      this.emit('stream-error', { configId: id, error })
      throw error
    }
  }
}
