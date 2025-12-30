import { create } from 'zustand'
import type { LLMConfig } from '@shared/types'

interface SettingsState {
  theme: string
  fontSize: number
  fontFamily: string
  llmConfigs: Map<string, LLMConfig>
  activeLLMId: string | null
  setTheme: (theme: string) => void
  setFontSize: (size: number) => void
  setFontFamily: (family: string) => void
  addLLMConfig: (id: string, config: LLMConfig) => void
  removeLLMConfig: (id: string) => void
  setActiveLLM: (id: string) => void
  loadSettings: () => Promise<void>
  saveSettings: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'dark',
  fontSize: 14,
  fontFamily: 'JetBrains Mono',
  llmConfigs: new Map(),
  activeLLMId: null,

  setTheme: (theme: string) => {
    set({ theme })
    window.electronAPI.settings.set('theme', theme)
  },

  setFontSize: (size: number) => {
    set({ fontSize: size })
    window.electronAPI.settings.set('fontSize', size)
  },

  setFontFamily: (family: string) => {
    set({ fontFamily: family })
    window.electronAPI.settings.set('fontFamily', family)
  },

  addLLMConfig: (id: string, config: LLMConfig) => {
    set(state => {
      const newConfigs = new Map(state.llmConfigs)
      newConfigs.set(id, config)
      return { llmConfigs: newConfigs }
    })
    window.electronAPI.settings.set('llmConfigs', Array.from(get().llmConfigs.entries()))
  },

  removeLLMConfig: (id: string) => {
    set(state => {
      const newConfigs = new Map(state.llmConfigs)
      newConfigs.delete(id)
      return { llmConfigs: newConfigs }
    })
    window.electronAPI.settings.set('llmConfigs', Array.from(get().llmConfigs.entries()))
  },

  setActiveLLM: (id: string) => {
    set({ activeLLMId: id })
    window.electronAPI.settings.set('activeLLMId', id)
  },

  loadSettings: async () => {
    try {
      const settings = await window.electronAPI.settings.get()
      
      if (settings.theme) set({ theme: settings.theme as string })
      if (settings.fontSize) set({ fontSize: settings.fontSize as number })
      if (settings.fontFamily) set({ fontFamily: settings.fontFamily as string })
      if (settings.activeLLMId) set({ activeLLMId: settings.activeLLMId as string })

      if (settings.llmConfigs && Array.isArray(settings.llmConfigs)) {
        const configs = new Map(settings.llmConfigs as [string, LLMConfig][])
        set({ llmConfigs: configs })
      }
    } catch (_error) {
      // Silently handle - renderer doesn't have Logger access
      // TODO: Implement renderer-side error handling
    }
  },

  saveSettings: async () => {
    try {
      await window.electronAPI.settings.set('theme', get().theme)
      await window.electronAPI.settings.set('fontSize', get().fontSize)
      await window.electronAPI.settings.set('fontFamily', get().fontFamily)
      await window.electronAPI.settings.set('llmConfigs', Array.from(get().llmConfigs.entries()))
      await window.electronAPI.settings.set('activeLLMId', get().activeLLMId)
    } catch (_error) {
      // Silently handle - renderer doesn't have Logger access
      // TODO: Implement renderer-side error handling
    }
  }
}))
