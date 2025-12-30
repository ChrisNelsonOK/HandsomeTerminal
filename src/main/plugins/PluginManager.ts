import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { EventEmitter } from 'eventemitter3'
import type { Plugin, PluginManifest, PluginHooks } from '@shared/types'
import { logger } from '../services/Logger'

export class PluginManager extends EventEmitter {
  private plugins: Map<string, Plugin> = new Map()
  private pluginsDirectory: string

  constructor() {
    super()
    this.pluginsDirectory = path.join(
      typeof process !== 'undefined' && process.env.HOME || '',
      '.handsometerminal',
      'plugins'
    )
    this.initialize()
  }

  private async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.pluginsDirectory, { recursive: true })
      await this.loadAllPlugins()
    } catch (error) {
      logger.error('Failed to initialize PluginManager', error as Error)
    }
  }

  async loadAllPlugins(): Promise<void> {
    try {
      const entries = await fs.readdir(this.pluginsDirectory, { withFileTypes: true })

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pluginPath = path.join(this.pluginsDirectory, entry.name)
          await this.loadPlugin(pluginPath)
        }
      }
    } catch (error) {
      logger.error('Failed to load plugins', error as Error, { directory: this.pluginsDirectory })
    }
  }

  async loadPlugin(pluginPath: string): Promise<Plugin | null> {
    try {
      const manifestPath = path.join(pluginPath, 'manifest.json')
      const manifestContent = await fs.readFile(manifestPath, 'utf-8')
      const manifest: PluginManifest = JSON.parse(manifestContent)

      const pluginId = manifest.id || uuidv4()

      const plugin: Plugin = {
        id: pluginId,
        name: manifest.name,
        version: manifest.version,
        author: manifest.author,
        description: manifest.description,
        enabled: true,
        manifest,
        hooks: {}
      }

      const mainPath = path.join(pluginPath, manifest.main)
      if (await this.fileExists(mainPath)) {
        try {
          const pluginModule = await import(mainPath)
          plugin.hooks = pluginModule.default || pluginModule
        } catch (error) {
          logger.error('Failed to load plugin module', error as Error, { pluginName: plugin.name, mainPath })
          return null
        }
      }

      this.plugins.set(pluginId, plugin)
      this.emit('plugin-loaded', plugin)

      return plugin
    } catch (error) {
      logger.error('Failed to load plugin', error as Error, { pluginPath })
      return null
    }
  }

  async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (plugin) {
      this.plugins.delete(pluginId)
      this.emit('plugin-unloaded', plugin)
    }
  }

  async enablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (plugin) {
      plugin.enabled = true
      this.emit('plugin-enabled', plugin)
    }
  }

  async disablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (plugin) {
      plugin.enabled = false
      this.emit('plugin-disabled', plugin)
    }
  }

  async installPlugin(pluginUrl: string): Promise<Plugin | null> {
    try {
      const tempPath = path.join(this.pluginsDirectory, 'temp', uuidv4())
      await fs.mkdir(tempPath, { recursive: true })

      const pluginId = uuidv4()
      const extractPath = path.join(this.pluginsDirectory, pluginId)
      await fs.mkdir(extractPath, { recursive: true })

      const plugin = await this.loadPlugin(extractPath)
      if (plugin) {
        this.emit('plugin-installed', plugin)
      }

      return plugin
    } catch (error) {
      logger.error('Failed to install plugin', error as Error, { pluginUrl })
      return null
    }
  }

  async uninstallPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (plugin) {
      await this.unloadPlugin(pluginId)

      try {
        const pluginPath = path.join(this.pluginsDirectory, pluginId)
        await fs.rm(pluginPath, { recursive: true, force: true })
        this.emit('plugin-uninstalled', plugin)
      } catch (error) {
        logger.error('Failed to uninstall plugin', error as Error, { pluginId, pluginName: plugin.name })
      }
    }
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId)
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  getEnabledPlugins(): Plugin[] {
    return Array.from(this.plugins.values()).filter(p => p.enabled)
  }

  async executeHook<T = void>(
    hookName: keyof PluginHooks,
    ...args: unknown[]
  ): Promise<T[]> {
    const enabledPlugins = this.getEnabledPlugins()
    const results: T[] = []

    for (const plugin of enabledPlugins) {
      const hook = plugin.hooks[hookName]
      if (typeof hook === 'function') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = await (hook as any)(...args)
          if (result !== undefined) {
            results.push(result as T)
          }
        } catch (error) {
          logger.error('Error executing plugin hook', error as Error, { hookName, pluginName: plugin.name, pluginId: plugin.id })
        }
      }
    }

    return results
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }
}
