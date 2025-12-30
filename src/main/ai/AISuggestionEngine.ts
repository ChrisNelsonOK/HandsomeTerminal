import { EventEmitter } from 'eventemitter3'
import type { LLMManager } from './LLMManager'
import type { CommandSuggestion, TerminalCommand } from '@shared/types'
import { logger } from '../services/Logger'

export class AISuggestionEngine extends EventEmitter {
  private commandHistory: TerminalCommand[] = []
  private suggestionsCache: Map<string, CommandSuggestion[]> = new Map()
  private maxHistorySize = 1000

  constructor(private llmManager: LLMManager) {
    super()
  }

  async generateSuggestions(
    currentInput: string,
    context: {
      currentDirectory: string
      shellType: string
      recentCommands: TerminalCommand[]
    }
  ): Promise<CommandSuggestion[]> {
    const cacheKey = `${currentInput}-${context.currentDirectory}`
    if (this.suggestionsCache.has(cacheKey)) {
      return this.suggestionsCache.get(cacheKey)!
    }

    const suggestions: CommandSuggestion[] = []

    suggestions.push(...this.getHistorySuggestions(currentInput, context.recentCommands))
    suggestions.push(...this.getFileSystemSuggestions(currentInput, context.currentDirectory))

    if (currentInput.length > 3 && this.llmManager.getActiveConfig()) {
      const aiSuggestions = await this.getAISuggestions(currentInput, context)
      suggestions.push(...aiSuggestions)
    }

    const deduped = this.deduplicateSuggestions(suggestions)
    const ranked = this.rankSuggestions(deduped, currentInput)

    this.suggestionsCache.set(cacheKey, ranked.slice(0, 10))

    this.emit('suggestions-generated', ranked)

    return ranked.slice(0, 10)
  }

  private getHistorySuggestions(
    input: string,
    recentCommands: TerminalCommand[]
  ): CommandSuggestion[] {
    const lowerInput = input.toLowerCase()
    return recentCommands
      .filter(cmd => cmd.command.toLowerCase().startsWith(lowerInput))
      .slice(0, 5)
      .map(cmd => ({
        command: cmd.command,
        description: 'Recently used command',
        confidence: 0.9,
        source: 'history' as const
      }))
  }

  private getFileSystemSuggestions(input: string, _currentDirectory: string): CommandSuggestion[] {
    const suggestions: CommandSuggestion[] = []
    const commonCommands = [
      'ls', 'cd', 'pwd', 'mkdir', 'rm', 'cp', 'mv', 'cat', 'less', 'grep',
      'find', 'chmod', 'chown', 'tar', 'gzip', 'ssh', 'scp', 'rsync',
      'git', 'npm', 'yarn', 'pip', 'docker', 'kubectl', 'terraform'
    ]

    const lowerInput = input.toLowerCase()

    commonCommands
      .filter(cmd => cmd.startsWith(lowerInput))
      .slice(0, 5)
      .forEach(cmd => {
        suggestions.push({
          command: cmd,
          description: 'Common shell command',
          confidence: 0.8,
          source: 'plugin' as const
        })
      })

    return suggestions
  }

  private async getAISuggestions(
    input: string,
    context: {
      currentDirectory: string
      shellType: string
      recentCommands: TerminalCommand[]
    }
  ): Promise<CommandSuggestion[]> {
    try {
      const recentCommandsStr = context.recentCommands.slice(0, 10).map(c => c.command).join('\n')
      const prompt = `You are an expert shell command assistant. Given the following context, suggest 3-5 relevant shell commands.

Current input: ${input}
Current directory: ${context.currentDirectory}
Shell type: ${context.shellType}

Recent commands:
${recentCommandsStr}

Provide suggestions in this format (one per line):
command - brief description

Only suggest shell commands, not explanations.

Example output:
ls - list directory contents
cd - change directory
docker ps - list running containers`

      const response = await this.llmManager.generate(prompt)
      const lines = response.content.split('\n').filter(l => l.trim())

      const suggestions: CommandSuggestion[] = []

      lines.forEach(line => {
        const match = line.match(/^([a-zA-Z0-9_\-./\s]+)\s+-\s+(.+)$/)
        if (match) {
          suggestions.push({
            command: match[1].trim(),
            description: match[2].trim(),
            confidence: 0.95,
            source: 'ai' as const
          })
        }
      })

      return suggestions.slice(0, 5)
    } catch (error) {
      logger.error('Failed to generate AI suggestions', error as Error, { input, context })
      return []
    }
  }

  private deduplicateSuggestions(suggestions: CommandSuggestion[]): CommandSuggestion[] {
    const seen = new Set<string>()
    const deduped: CommandSuggestion[] = []

    suggestions.forEach(s => {
      const key = `${s.command}-${s.description}`
      if (!seen.has(key)) {
        seen.add(key)
        deduped.push(s)
      }
    })

    return deduped
  }

  private rankSuggestions(suggestions: CommandSuggestion[], input: string): CommandSuggestion[] {
    const lowerInput = input.toLowerCase()

    return suggestions.sort((a, b) => {
      if (a.source === 'ai' && b.source !== 'ai') {
        return -1
      }
      if (b.source === 'ai' && a.source !== 'ai') {
        return 1
      }

      const aStart = a.command.toLowerCase().startsWith(lowerInput)
      const bStart = b.command.toLowerCase().startsWith(lowerInput)

      if (aStart && !bStart) {
        return -1
      }
      if (bStart && !aStart) {
        return 1
      }

      return b.confidence - a.confidence
    })
  }

  addToHistory(command: TerminalCommand): void {
    this.commandHistory.unshift(command)

    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory = this.commandHistory.slice(0, this.maxHistorySize)
    }

    this.emit('history-updated', this.commandHistory)
  }

  getHistory(count = 50): TerminalCommand[] {
    return this.commandHistory.slice(0, count)
  }

  searchHistory(query: string, count = 10): TerminalCommand[] {
    const lowerQuery = query.toLowerCase()
    return this.commandHistory
      .filter(cmd => cmd.command.toLowerCase().includes(lowerQuery))
      .slice(0, count)
  }

  clearHistory(): void {
    this.commandHistory = []
    this.emit('history-updated', this.commandHistory)
  }

  clearCache(): void {
    this.suggestionsCache.clear()
  }
}
