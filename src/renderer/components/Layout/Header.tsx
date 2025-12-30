import { motion } from 'framer-motion'
import { Menu, Sparkles, Settings, Zap } from 'lucide-react'

interface HeaderProps {
  onToggleSidebar: () => void
  onToggleAI: () => void
  onToggleSettings: () => void
  onTogglePlugins: () => void
}

const Header = ({ onToggleSidebar, onToggleAI, onToggleSettings, onTogglePlugins }: HeaderProps): JSX.Element => {
  return (
    <div className="h-12 bg-terminal-bgSecondary border-b border-terminal-border flex items-center justify-between px-4 drag-region">
      <div className="flex items-center gap-3">
        <motion.button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-terminal-textMuted hover:bg-terminal-border hover:text-terminal-text transition-all duration-200 no-drag"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Menu size={18} />
        </motion.button>
        <div className="h-6 w-px bg-terminal-border" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-terminal-text">Quick Actions</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          onClick={onToggleAI}
          className="flex items-center gap-2 px-4 py-2 bg-terminal-accent/10 hover:bg-terminal-accent/20 text-terminal-accent rounded-lg transition-all duration-200 border border-terminal-accent/30 no-drag"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles size={16} className="animate-pulse" />
          <span className="text-sm font-medium">AI Assistant</span>
        </motion.button>

        <motion.button
          onClick={onTogglePlugins}
          className="p-2 rounded-lg text-terminal-textMuted hover:bg-terminal-border hover:text-terminal-text transition-all duration-200 no-drag"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Zap size={18} />
        </motion.button>

        <motion.button
          onClick={onToggleSettings}
          className="p-2 rounded-lg text-terminal-textMuted hover:bg-terminal-border hover:text-terminal-text transition-all duration-200 no-drag"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Settings size={18} />
        </motion.button>
      </div>
    </div>
  )
}

export default Header
