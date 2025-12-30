import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, RotateCcw, Server, Palette, Type, Shield } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'

const SettingsPanel = ({ onClose }: { onClose: () => void }): JSX.Element => {
  const { theme, fontSize, fontFamily, setTheme, setFontSize, setFontFamily, saveSettings } = useSettingsStore()
  const [activeTab, setActiveTab] = useState('llm')

  const tabs = [
    { id: 'llm', icon: Server, label: 'LLM Configuration' },
    { id: 'appearance', icon: Palette, label: 'Appearance' },
    { id: 'terminal', icon: Type, label: 'Terminal' },
    { id: 'security', icon: Shield, label: 'Security' }
  ]

  const handleSave = async () => {
    await saveSettings()
  }

  const handleReset = async () => {
    setTheme('dark')
    setFontSize(14)
    setFontFamily('JetBrains Mono')
    await saveSettings()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-[800px] max-h-[80vh] bg-terminal-bgSecondary border border-terminal-border rounded-xl shadow-2xl flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-terminal-border">
            <h2 className="text-xl font-bold text-terminal-text">Settings</h2>
            <motion.button
              onClick={onClose}
              className="p-2 rounded-lg text-terminal-textMuted hover:bg-terminal-border hover:text-terminal-text transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={20} />
            </motion.button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="w-48 border-r border-terminal-border p-3 space-y-1">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`sidebar-item w-full ${activeTab === tab.id ? 'active' : ''}`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon size={18} className={activeTab === tab.id ? 'text-terminal-accent' : ''} />
                  <span className="font-medium">{tab.label}</span>
                </motion.button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'llm' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-terminal-text mb-4">LLM Configuration</h3>
                  
                  <div className="card">
                    <h4 className="text-sm font-medium text-terminal-text mb-3">Connect Local LLM</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-terminal-textMuted mb-2">Provider</label>
                        <select className="w-full input-field">
                          <option value="ollama">Ollama</option>
                          <option value="lmstudio">LM Studio</option>
                          <option value="llamacpp">Llama.cpp</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-terminal-textMuted mb-2">Endpoint URL</label>
                        <input
                          type="text"
                          placeholder="http://localhost:11434/api"
                          className="w-full input-field"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-terminal-textMuted mb-2">Model Name</label>
                        <input
                          type="text"
                          placeholder="llama2, codellama, etc."
                          className="w-full input-field"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-terminal-textMuted mb-2">Temperature</label>
                        <input
                          type="number"
                          min="0"
                          max="2"
                          step="0.1"
                          defaultValue="0.7"
                          className="w-full input-field"
                        />
                      </div>
                      
                      <button className="btn-primary w-full">Connect & Save</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-terminal-text mb-4">Appearance</h3>
                  
                  <div className="card">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-terminal-textMuted mb-2">Theme</label>
                        <div className="grid grid-cols-3 gap-3">
                          {['dark', 'midnight', 'cyberpunk'].map((t) => (
                            <motion.button
                              key={t}
                              onClick={() => setTheme(t)}
                              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                                theme === t
                                  ? 'border-terminal-accent bg-terminal-accent/10'
                                  : 'border-terminal-border hover:border-terminal-textMuted'
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <div className={`w-full h-8 rounded mb-2 ${
                                t === 'dark' ? 'bg-terminal-bg' :
                                t === 'midnight' ? 'bg-gradient-to-r from-purple-900 to-blue-900' :
                                'bg-gradient-to-r from-terminal-accent to-terminal-info'
                              }`} />
                              <span className="text-xs font-medium capitalize">{t}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'terminal' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-terminal-text mb-4">Terminal Settings</h3>
                  
                  <div className="card space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-terminal-textMuted mb-2">Font Family</label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full input-field"
                      >
                        <option value="JetBrains Mono">JetBrains Mono</option>
                        <option value="Fira Code">Fira Code</option>
                        <option value="Source Code Pro">Source Code Pro</option>
                        <option value="Monaco">Monaco</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-terminal-textMuted mb-2">Font Size: {fontSize}px</label>
                      <input
                        type="range"
                        min="10"
                        max="24"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-terminal-text mb-4">Security</h3>
                  
                  <div className="card space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-terminal-text">SSH Key Management</h4>
                        <p className="text-xs text-terminal-textMuted">Manage your SSH keys securely</p>
                      </div>
                      <button className="btn-secondary text-sm">Manage Keys</button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-terminal-text">Session Encryption</h4>
                        <p className="text-xs text-terminal-textMuted">Encrypt terminal sessions</p>
                      </div>
                      <div className="w-12 h-6 bg-terminal-accent rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-terminal-text">Plugin Sandboxing</h4>
                        <p className="text-xs text-terminal-textMuted">Run plugins in isolated environment</p>
                      </div>
                      <div className="w-12 h-6 bg-terminal-accent rounded-full relative">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border-t border-terminal-border">
            <motion.button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-terminal-textMuted hover:text-terminal-text transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw size={16} />
              Reset to Default
            </motion.button>
            <div className="flex gap-2">
              <motion.button
                onClick={onClose}
                className="btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleSave}
                className="btn-primary flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save size={16} />
                Save Changes
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SettingsPanel
