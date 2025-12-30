import { motion } from 'framer-motion'
import { Terminal, Box, Cpu, Network, Settings, Shield, Zap, Globe, Database, GitBranch, Cloud } from 'lucide-react'

const Sidebar = ({ onClose: _onClose }: { onClose: () => void }): JSX.Element => {
  const menuItems = [
    { icon: Terminal, label: 'Terminals', id: 'terminals', active: true },
    { icon: Box, label: 'Sessions', id: 'sessions', active: false },
    { icon: Globe, label: 'SSH', id: 'ssh', active: false },
    { icon: Cloud, label: 'Cloud', id: 'cloud', active: false },
    { icon: Database, label: 'Databases', id: 'databases', active: false },
    { icon: Cpu, label: 'DevOps', id: 'devops', active: false },
    { icon: GitBranch, label: 'Git', id: 'git', active: false },
    { icon: Network, label: 'Network', id: 'network', active: false },
    { icon: Zap, label: 'Plugins', id: 'plugins', active: false },
    { icon: Shield, label: 'Security', id: 'security', active: false },
    { icon: Settings, label: 'Settings', id: 'settings', active: false }
  ]

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      className="w-64 bg-terminal-bgSecondary border-r border-terminal-border flex flex-col"
    >
      <div className="p-4 border-b border-terminal-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-terminal-accent to-terminal-info flex items-center justify-center">
            <Terminal className="text-black" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-terminal-text">Handsome</h1>
            <p className="text-xs text-terminal-textMuted">Terminal v1.0</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            className={`sidebar-item w-full ${item.active ? 'active' : ''}`}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <item.icon size={18} className={item.active ? 'text-terminal-accent' : ''} />
            <span className="font-medium">{item.label}</span>
            {item.active && <div className="ml-auto w-2 h-2 rounded-full bg-terminal-accent animate-pulse" />}
          </motion.button>
        ))}
      </nav>

      <div className="p-4 border-t border-terminal-border">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={16} className="text-terminal-accent" />
            <span className="text-sm font-medium">System Status</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-terminal-textMuted">CPU</span>
              <span className="text-terminal-accent">23%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-terminal-textMuted">Memory</span>
              <span className="text-terminal-info">45%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-terminal-textMuted">Network</span>
              <span className="text-terminal-success">Online</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Sidebar
