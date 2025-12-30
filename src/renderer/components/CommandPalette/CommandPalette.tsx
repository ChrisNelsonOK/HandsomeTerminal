import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Terminal, Clock, ArrowUp, Command, Settings, Palette, Zap, Box, Cloud, Network, Sidebar } from 'lucide-react'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onExecuteCommand: (command: string) => void
}

const CommandPalette = ({ isOpen, onClose, onExecuteCommand }: CommandPaletteProps): JSX.Element => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const commands = [
    { id: 'new-terminal', label: 'New Terminal', icon: Terminal, shortcut: 'Ctrl+Shift+T', action: 'terminal.create' },
    { id: 'close-terminal', label: 'Close Terminal', icon: Terminal, shortcut: 'Ctrl+W', action: 'terminal.close' },
    { id: 'history-up', label: 'Command History Up', icon: ArrowUp, shortcut: '↑', action: 'history.up' },
    { id: 'history-search', label: 'Search History', icon: Search, shortcut: 'Ctrl+R', action: 'history.search' },
    { id: 'ai-suggest', label: 'AI Command Suggestions', icon: Command, shortcut: 'Ctrl+/', action: 'ai.suggest' },
    { id: 'ai-chat', label: 'Open AI Chat', icon: Command, shortcut: 'Ctrl+Shift+A', action: 'ai.chat' },
    { id: 'settings', label: 'Open Settings', icon: Settings, shortcut: 'Ctrl+,', action: 'settings.open' },
    { id: 'themes', label: 'Change Theme', icon: Palette, shortcut: 'Ctrl+T', action: 'themes.change' },
    { id: 'plugins', label: 'Plugin Manager', icon: Zap, shortcut: 'Ctrl+P', action: 'plugins.open' },
    { id: 'docker-containers', label: 'Docker Containers', icon: Box, shortcut: 'Ctrl+D', action: 'docker.containers' },
    { id: 'k8s-pods', label: 'Kubernetes Pods', icon: Cloud, shortcut: 'Ctrl+K', action: 'k8s.pods' },
    { id: 'network-scan', label: 'Network Scan', icon: Network, shortcut: 'Ctrl+N', action: 'network.scan' },
    { id: 'toggle-sidebar', label: 'Toggle Sidebar', icon: Sidebar, shortcut: 'Ctrl+B', action: 'ui.sidebar' },
    { id: 'focus-terminal', label: 'Focus Terminal', icon: Terminal, shortcut: 'Ctrl+1', action: 'ui.focus' }
  ]

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.action.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selected = filteredCommands[selectedIndex]
        if (selected) {
          onExecuteCommand(selected.action)
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredCommands, onClose, onExecuteCommand])

  if (!isOpen) return <></>

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-start justify-center pt-32"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-[600px] bg-terminal-bgSecondary border border-terminal-border rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-terminal-border">
              <Search size={20} className="text-terminal-textMuted" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent outline-none text-terminal-text placeholder:text-terminal-textMuted text-base"
                autoFocus
              />
              <kbd className="px-2 py-1 bg-terminal-border rounded text-xs text-terminal-textMuted">ESC</kbd>
            </div>

            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {filteredCommands.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search size={48} className="text-terminal-textMuted mb-3" />
                  <p className="text-terminal-textMuted">No commands found</p>
                </div>
              ) : (
                filteredCommands.map((command, index) => (
                  <motion.button
                    key={command.id}
                    onClick={() => {
                      onExecuteCommand(command.action)
                      onClose()
                    }}
                    className={`flex items-center gap-3 px-4 py-3 w-full text-left transition-all duration-150 ${
                      index === selectedIndex
                        ? 'bg-terminal-accent/10 border-l-2 border-terminal-accent'
                        : 'hover:bg-terminal-border border-l-2 border-transparent'
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <command.icon size={18} className="text-terminal-text" />
                    <div className="flex-1">
                      <div className="text-terminal-text font-medium">{command.label}</div>
                      <div className="text-xs text-terminal-textMuted">{command.action}</div>
                    </div>
                    <kbd className="px-2 py-1 bg-terminal-border rounded text-xs text-terminal-textMuted">
                      {command.shortcut}
                    </kbd>
                  </motion.button>
                ))
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-t border-terminal-border bg-terminal-bg/50">
              <div className="flex items-center gap-4 text-xs text-terminal-textMuted">
                <span><kbd className="px-1.5 py-0.5 bg-terminal-border rounded">↑↓</kbd> Navigate</span>
                <span><kbd className="px-1.5 py-0.5 bg-terminal-border rounded">Enter</kbd> Execute</span>
                <span><kbd className="px-1.5 py-0.5 bg-terminal-border rounded">Esc</kbd> Close</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-terminal-textMuted">
                <Clock size={14} />
                <span>Command Palette</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CommandPalette
