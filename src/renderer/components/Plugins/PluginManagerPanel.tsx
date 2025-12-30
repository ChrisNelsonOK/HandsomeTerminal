import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Search, Star, Zap, Shield, ExternalLink } from 'lucide-react'
import type { MarketPlacePlugin } from '@shared/types'

const PluginManagerPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'installed' | 'marketplace'>('installed')
  const plugins: MarketPlacePlugin[] = [
    {
      id: 'docker-integration',
      name: 'Docker Integration',
      version: '1.2.0',
      author: 'Handsome Team',
      description: 'Advanced Docker container management with AI-powered optimization suggestions',
      rating: 4.8,
      downloads: 15420,
      tags: ['DevOps', 'Docker', 'Containers'],
      manifest: {
        id: 'docker-integration',
        name: 'Docker Integration',
        version: '1.2.0',
        author: 'Handsome Team',
        description: 'Advanced Docker container management',
        main: 'index.js',
        permissions: ['terminal', 'network']
      }
    },
    {
      id: 'kubernetes-dashboard',
      name: 'Kubernetes Dashboard',
      version: '2.1.0',
      author: 'Cloud Native',
      description: 'Complete Kubernetes cluster management with visual topology and AI insights',
      rating: 4.9,
      downloads: 12350,
      tags: ['DevOps', 'Kubernetes', 'Cloud'],
      manifest: {
        id: 'kubernetes-dashboard',
        name: 'Kubernetes Dashboard',
        version: '2.1.0',
        author: 'Cloud Native',
        description: 'Complete Kubernetes cluster management',
        main: 'index.js',
        permissions: ['terminal', 'network', 'api']
      }
    },
    {
      id: 'network-monitor',
      name: 'Network Monitor Pro',
      version: '3.0.0',
      author: 'NetOps Team',
      description: 'Real-time network monitoring, packet analysis, and security alerts',
      rating: 4.7,
      downloads: 8920,
      tags: ['Network', 'Security', 'Monitoring'],
      manifest: {
        id: 'network-monitor',
        name: 'Network Monitor Pro',
        version: '3.0.0',
        author: 'NetOps Team',
        description: 'Real-time network monitoring',
        main: 'index.js',
        permissions: ['terminal', 'network', 'system']
      }
    },
    {
      id: 'ai-code-assistant',
      name: 'AI Code Assistant',
      version: '2.5.0',
      author: 'AI Labs',
      description: 'Intelligent code completion, refactoring suggestions, and documentation generation',
      rating: 4.9,
      downloads: 20150,
      tags: ['AI', 'Development', 'Productivity'],
      manifest: {
        id: 'ai-code-assistant',
        name: 'AI Code Assistant',
        version: '2.5.0',
        author: 'AI Labs',
        description: 'Intelligent code completion and refactoring',
        main: 'index.js',
        permissions: ['terminal', 'ai']
      }
    },
    {
      id: 'terraform-manager',
      name: 'Terraform Manager',
      version: '1.8.0',
      author: 'InfraCode',
      description: 'Infrastructure as Code management with state tracking and AI optimization',
      rating: 4.6,
      downloads: 6780,
      tags: ['DevOps', 'Terraform', 'Infrastructure'],
      manifest: {
        id: 'terraform-manager',
        name: 'Terraform Manager',
        version: '1.8.0',
        author: 'InfraCode',
        description: 'Infrastructure as Code management',
        main: 'index.js',
        permissions: ['terminal', 'api']
      }
    }
  ]

  const [installedPlugins, setInstalledPlugins] = useState<string[]>([])

  useEffect(() => {
    const loadInstalledPlugins = async () => {
      try {
        const pluginList = await window.electronAPI.plugin.list()
        setInstalledPlugins(pluginList.map((p: { id: string }) => p.id))
      } catch (_error) {
        // Silently handle - renderer doesn't have Logger access
        // TODO: Implement renderer-side error UI feedback
      }
    }
    loadInstalledPlugins()
  }, [])

  const filteredPlugins = plugins.filter(plugin =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleInstall = async (_plugin: MarketPlacePlugin) => {
    // TODO: Implement plugin installation
    // await window.electronAPI.plugin.install(plugin.id)
  }

  const handleUninstall = async (pluginId: string) => {
    try {
      await window.electronAPI.plugin.unload(pluginId)
      setInstalledPlugins(prev => prev.filter(id => id !== pluginId))
    } catch (_error) {
      // Silently handle - renderer doesn't have Logger access
      // TODO: Implement renderer-side error UI feedback
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-[900px] h-[700px] bg-terminal-bgSecondary border border-terminal-border rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-terminal-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Zap className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-terminal-text">Plugin Marketplace</h2>
                  <p className="text-sm text-terminal-textMuted">Extend your terminal with powerful plugins</p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="p-2 rounded-lg text-terminal-textMuted hover:bg-terminal-border hover:text-terminal-text transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
            </div>

            <div className="flex items-center justify-between p-4 border-b border-terminal-border">
              <div className="flex gap-2">
                <motion.button
                  onClick={() => setActiveTab('installed')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'installed'
                      ? 'bg-terminal-accent/10 text-terminal-accent border border-terminal-accent/30'
                      : 'text-terminal-textMuted hover:bg-terminal-border hover:text-terminal-text'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Installed ({installedPlugins.length})
                </motion.button>
                <motion.button
                  onClick={() => setActiveTab('marketplace')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'marketplace'
                      ? 'bg-terminal-accent/10 text-terminal-accent border border-terminal-accent/30'
                      : 'text-terminal-textMuted hover:bg-terminal-border hover:text-terminal-text'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Marketplace ({plugins.length})
                </motion.button>
              </div>

              {activeTab === 'marketplace' && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-terminal-textMuted" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search plugins..."
                    className="pl-10 pr-4 py-2 bg-terminal-bg border border-terminal-border rounded-lg text-terminal-text outline-none focus:border-terminal-accent transition-colors w-64 text-sm"
                  />
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
              {activeTab === 'installed' && (
                <div className="space-y-4">
                  {installedPlugins.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Zap size={48} className="text-terminal-textMuted mb-4" />
                      <h3 className="text-lg font-semibold text-terminal-text mb-2">No Plugins Installed</h3>
                      <p className="text-sm text-terminal-textMuted mb-4">Browse the marketplace to find useful plugins</p>
                      <button
                        onClick={() => setActiveTab('marketplace')}
                        className="btn-primary"
                      >
                        Browse Marketplace
                      </button>
                    </div>
                  ) : (
                    filteredPlugins
                      .filter(plugin => installedPlugins.includes(plugin.id))
                      .map(plugin => (
                        <PluginCard
                          key={plugin.id}
                          plugin={plugin}
                          installed
                          onUninstall={() => handleUninstall(plugin.id)}
                        />
                      ))
                  )}
                </div>
              )}

              {activeTab === 'marketplace' && (
                <div className="grid grid-cols-1 gap-4">
                  {filteredPlugins.map(plugin => (
                    <PluginCard
                      key={plugin.id}
                      plugin={plugin}
                      installed={installedPlugins.includes(plugin.id)}
                      onInstall={() => handleInstall(plugin)}
                      onUninstall={() => handleUninstall(plugin.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface PluginCardProps {
  plugin: MarketPlacePlugin
  installed: boolean
  onInstall?: () => void
  onUninstall?: () => void
}

const PluginCard = ({ plugin, installed, onInstall, onUninstall }: PluginCardProps): JSX.Element => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card hover:border-terminal-accent/50 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-terminal-accent to-terminal-info flex items-center justify-center flex-shrink-0">
          <Zap className="text-black" size={24} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-terminal-text">{plugin.name}</h3>
                {installed && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-terminal-accent/10 text-terminal-accent rounded text-xs font-medium">
                    <Shield size={10} />
                    Installed
                  </div>
                )}
              </div>
              <p className="text-sm text-terminal-textMuted mb-2">{plugin.description}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star size={14} fill="currentColor" />
                <span className="text-sm font-medium">{plugin.rating}</span>
              </div>
              <span className="text-sm text-terminal-textMuted">
                {(plugin.downloads / 1000).toFixed(1)}k downloads
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {plugin.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-terminal-bg rounded text-xs text-terminal-textMuted"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3 text-sm text-terminal-textMuted">
              <span>v{plugin.version}</span>
              <span>by {plugin.author}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {installed ? (
            <motion.button
              onClick={onUninstall}
              className="px-4 py-2 bg-terminal-error/10 hover:bg-terminal-error/20 text-terminal-error border border-terminal-error/30 rounded-lg transition-all duration-200 text-sm font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Uninstall
            </motion.button>
          ) : (
            <motion.button
              onClick={onInstall}
              className="btn-primary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={16} />
              Install
            </motion.button>
          )}
          <motion.button
            className="px-4 py-2 bg-terminal-bg hover:bg-terminal-border text-terminal-text rounded-lg transition-all duration-200 text-sm flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ExternalLink size={14} />
            Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default PluginManagerPanel
